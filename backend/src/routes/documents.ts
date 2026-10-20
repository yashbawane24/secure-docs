import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { analyzeDocument } from '../services/aiEngine';
import { encryptBuffer, decryptBuffer } from '../services/cryptoService';
import { generateEncryptedPdf } from '../services/pdfService';

const router = Router();
const prisma = new PrismaClient();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });

/**
 * POST /api/documents/upload
 * Process document upload -> AI analysis -> Encryption if high risk -> Audit log
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file || !req.user) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const filePath = req.file.path;
    let extractedText = '';

    // Read text from file (txt/json/csv/code directly, fallback for others)
    try {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    } catch {
      extractedText = `Uploaded document ${req.file.originalname} binary file content.`;
    }

    // Run AI Entity & Leak Probability Engine
    const analysis = analyzeDocument(extractedText, req.user.trustLevel);

    let isEncrypted = false;
    let encryptionIV: string | undefined;
    let authTag: string | undefined;

    // Apply AES-256 encryption at rest if policy or AI decision requires
    if (analysis.recommendedAction === 'ENCRYPT' || analysis.recommendedAction === 'BLOCK') {
      const fileBuffer = fs.readFileSync(filePath);
      const enc = encryptBuffer(fileBuffer);
      fs.writeFileSync(filePath, enc.encryptedBuffer);
      isEncrypted = true;
      encryptionIV = enc.ivHex;
      authTag = enc.authTagHex;
    }

    // Create Document in Database
    const doc = await prisma.document.create({
      data: {
        ownerId: req.user.id,
        title: req.body.title || req.file.originalname,
        filename: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        storagePath: filePath,
        extractedText,
        classification: analysis.classification,
        leakScore: analysis.leakScore,
        recommendedAction: analysis.recommendedAction,
        isEncrypted,
        encryptionIV,
        authTag,
        entities: {
          create: analysis.entities.map(e => ({
            entityType: e.entityType,
            maskedValue: e.maskedValue,
            confidence: e.confidence,
            locationCount: e.locationCount
          }))
        }
      },
      include: {
        entities: true,
        owner: { select: { id: true, name: true, email: true } }
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        documentId: doc.id,
        action: 'UPLOAD',
        metadataJson: JSON.stringify({
          classification: analysis.classification,
          leakScore: analysis.leakScore,
          recommendedAction: analysis.recommendedAction,
          entitiesFound: analysis.entities.length
        })
      }
    });

    return res.status(201).json({
      message: 'Document analyzed and processed successfully.',
      document: doc,
      analysisReasoning: analysis.reasoning
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return res.status(500).json({ error: 'Failed to process document upload.' });
  }
});

/**
 * GET /api/documents
 * List all documents owned by user or accessible in organization
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { search, classification, minScore } = req.query;

  const whereClause: any = {};
  if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
    whereClause.ownerId = req.user.id;
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: String(search) } },
      { filename: { contains: String(search) } }
    ];
  }

  if (classification) {
    whereClause.classification = String(classification);
  }

  if (minScore) {
    whereClause.leakScore = { gte: parseInt(String(minScore), 10) };
  }

  const documents = await prisma.document.findMany({
    where: whereClause,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      entities: true,
      shares: {
        include: { recipient: { select: { id: true, name: true, email: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return res.json({ documents });
});

/**
 * GET /api/documents/:id
 * Get detail view with entity breakdown & decision reasoning
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const doc = await prisma.document.findUnique({
    where: { id: req.params.id },
    include: {
      owner: { select: { id: true, name: true, email: true, role: true } },
      entities: true,
      shares: {
        include: { recipient: { select: { id: true, name: true, email: true, trustLevel: true } } }
      },
      auditLogs: {
        include: { actor: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!doc) return res.status(404).json({ error: 'Document not found' });

  // Access check
  const isOwner = doc.ownerId === req.user.id;
  const isShared = doc.shares.some(s => s.recipientId === req.user?.id);
  const isManagerOrAdmin = req.user.role === 'ADMIN' || req.user.role === 'MANAGER';

  if (!isOwner && !isShared && !isManagerOrAdmin) {
    return res.status(403).json({ error: 'Access denied to this document.' });
  }

  // Re-run decision engine reasoning
  const analysis = analyzeDocument(doc.extractedText || '', req.user.trustLevel);

  // Log View Audit Event
  await prisma.auditLog.create({
    data: {
      actorId: req.user.id,
      documentId: doc.id,
      action: 'VIEW',
      metadataJson: JSON.stringify({ viewerRole: req.user.role })
    }
  });

  return res.json({
    document: doc,
    analysisReasoning: analysis.reasoning
  });
});

/**
 * GET /api/documents/:id/download
 * Download file: defaults to encrypted (.enc) version as requested by user,
 * or decrypted version if explicitly requested and permitted by policy.
 */
router.get('/:id/download', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const doc = await prisma.document.findUnique({
    where: { id: req.params.id },
    include: { shares: true, entities: true }
  });

  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const isOwner = doc.ownerId === req.user.id;
  const share = doc.shares.find(s => s.recipientId === req.user?.id);
  const isManagerOrAdmin = req.user.role === 'ADMIN' || req.user.role === 'MANAGER';

  // Check access permissions
  if (!isOwner && !isManagerOrAdmin) {
    if (!share || share.status !== 'ACTIVE' || share.permissionLevel === 'DENIED') {
      return res.status(403).json({ error: 'Download permission denied for this document.' });
    }
  }

  // Determine requested download mode: 'encrypted' is default, 'decrypted' if explicitly requested
  const requestedMode = req.query.mode === 'decrypted' || req.query.encrypted === 'false' ? 'decrypted' : 'encrypted';

  // If user explicitly asks for decrypted plaintext, enforce DLP Policy HC-900
  if (requestedMode === 'decrypted' && doc.recommendedAction === 'BLOCK' && !isManagerOrAdmin) {
    return res.status(403).json({
      error: 'Plaintext download blocked by Policy HC-900 (High Risk Leak Prevention). Please download the AES-256 Encrypted version (.enc) to protect sensitive data.'
    });
  }

  // Resolve storage path or fallback to extracted text buffer
  let resolvedPath = doc.storagePath;
  if (resolvedPath && !path.isAbsolute(resolvedPath)) {
    const candidate1 = path.join(uploadDir, path.basename(resolvedPath));
    const candidate2 = path.join(__dirname, '../../', resolvedPath);
    if (fs.existsSync(candidate1)) resolvedPath = candidate1;
    else if (fs.existsSync(candidate2)) resolvedPath = candidate2;
  }

  let fileBuffer: Buffer;
  if (resolvedPath && fs.existsSync(resolvedPath)) {
    fileBuffer = fs.readFileSync(resolvedPath);
  } else {
    // Resilient fallback from extracted text
    fileBuffer = Buffer.from(doc.extractedText || `SecureDocs AI Document: ${doc.title}`, 'utf-8');
    try {
      const safePath = path.join(uploadDir, `${Date.now()}-${doc.filename}`);
      fs.writeFileSync(safePath, fileBuffer);
      await prisma.document.update({
        where: { id: doc.id },
        data: { storagePath: safePath }
      });
    } catch (e) {
      console.warn('Could not cache file on disk:', e);
    }
  }

  if (requestedMode === 'encrypted') {
    // Ensure the payload is encrypted with AES-256-GCM
    let encryptedBuffer = fileBuffer;
    let ivHex = doc.encryptionIV || '';
    let authTagHex = doc.authTag || '';

    if (!doc.isEncrypted || !doc.encryptionIV || !doc.authTag) {
      // Encrypt on the fly using AES-256-GCM
      const enc = encryptBuffer(fileBuffer);
      encryptedBuffer = enc.encryptedBuffer;
      ivHex = enc.ivHex;
      authTagHex = enc.authTagHex;
      try {
        await prisma.document.update({
          where: { id: doc.id },
          data: {
            isEncrypted: true,
            encryptionIV: enc.ivHex,
            authTag: enc.authTagHex
          }
        });
      } catch (e) {
        console.warn('Failed to update encryption metadata in db:', e);
      }
    }

    // Generate Encrypted Security PDF containing masked sensitive data & watermark
    const pdfBuffer = await generateEncryptedPdf({
      title: doc.title,
      filename: doc.filename,
      classification: doc.classification,
      leakScore: doc.leakScore,
      recommendedAction: doc.recommendedAction,
      extractedText: doc.extractedText || (doc.isEncrypted && doc.encryptionIV && doc.authTag ? decryptBuffer(fileBuffer, doc.encryptionIV, doc.authTag).toString('utf-8') : fileBuffer.toString('utf-8')),
      encryptedBuffer,
      ivHex,
      authTagHex,
      userEmail: req.user.email,
      userRole: req.user.role,
      entities: doc.entities || []
    });

    // Create a clean PDF filename based on the document name
    const baseName = doc.filename.replace(/\.[^/.]+$/, '').replace(/_(?:ENCRYPTED|SECURED)$/i, '');
    const downloadFilename = `${baseName}_SECURED.pdf`;

    // Audit log encrypted PDF download
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        documentId: doc.id,
        action: 'DOWNLOAD',
        metadataJson: JSON.stringify({ mode: 'ENCRYPTED_PDF_AES_256', filename: downloadFilename, size: pdfBuffer.length })
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    return res.send(pdfBuffer);
  } else {
    // Decrypted mode requested
    let decryptedBuffer = fileBuffer;
    if (doc.isEncrypted && doc.encryptionIV && doc.authTag) {
      try {
        decryptedBuffer = decryptBuffer(fileBuffer, doc.encryptionIV, doc.authTag);
      } catch {
        // If fileBuffer was already plaintext (e.g. from seed fallback), use it
        decryptedBuffer = Buffer.from(doc.extractedText || fileBuffer.toString(), 'utf-8');
      }
    }

    // Audit log decrypted download
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        documentId: doc.id,
        action: 'DOWNLOAD',
        metadataJson: JSON.stringify({ mode: 'DECRYPTED_PLAINTEXT', filename: doc.filename, size: decryptedBuffer.length })
      }
    });

    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.filename}"`);
    return res.send(decryptedBuffer);
  }
});

export default router;
