import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { evaluateAccessAnomaly } from '../services/anomalyService';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/shares
 * Share document with recipient, auto-adjust permission based on recipient trust & doc leak score
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { documentId, recipientEmail, customPermission } = req.body;

  if (!documentId || !recipientEmail) {
    return res.status(400).json({ error: 'Document ID and Recipient Email are required.' });
  }

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) return res.status(404).json({ error: 'Document not found.' });

  const recipient = await prisma.user.findUnique({ where: { email: recipientEmail } });
  if (!recipient) return res.status(404).json({ error: 'Recipient user not found.' });

  // Compute recommended permission based on doc leak score + recipient trust level
  let autoPermission = customPermission || 'VIEW_ONLY';
  if (!customPermission) {
    if (recipient.trustLevel < 50 || doc.leakScore >= 75) {
      autoPermission = 'VIEW_ONLY';
    } else if (doc.leakScore >= 50) {
      autoPermission = 'TIME_LIMITED';
    } else {
      autoPermission = 'DOWNLOAD_EDIT';
    }
  }

  const expiresAt = autoPermission === 'TIME_LIMITED' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

  const share = await prisma.share.create({
    data: {
      documentId: doc.id,
      senderId: req.user!.id,
      recipientId: recipient.id,
      permissionLevel: autoPermission,
      expiresAt,
      status: 'ACTIVE'
    },
    include: {
      document: { select: { title: true, classification: true, leakScore: true } },
      recipient: { select: { id: true, name: true, email: true, trustLevel: true } }
    }
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: req.user!.id,
      documentId: doc.id,
      action: 'SHARE',
      metadataJson: JSON.stringify({
        recipientEmail: recipient.email,
        permissionLevel: autoPermission,
        recipientTrustLevel: recipient.trustLevel
      })
    }
  });

  return res.status(201).json({
    message: 'Document shared successfully.',
    share
  });
});

/**
 * GET /api/shares/my-shares
 * List documents shared with current logged in user (with anomaly check)
 */
router.get('/my-shares', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const shares = await prisma.share.findMany({
    where: { recipientId: req.user.id },
    include: {
      document: {
        include: {
          owner: { select: { name: true, email: true } },
          entities: true
        }
      },
      sender: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Run velocity anomaly evaluation on each share view
  const processedShares = await Promise.all(shares.map(async (share) => {
    const anomaly = await evaluateAccessAnomaly(share.id, req.user!.id);
    return {
      ...share,
      anomalyFlag: anomaly.isAnomalous,
      anomalyReason: anomaly.reason
    };
  }));

  return res.json({ shares: processedShares });
});

/**
 * DELETE /api/shares/:id
 * Revoke document share access
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const share = await prisma.share.findUnique({ where: { id: req.params.id } });
  if (!share) return res.status(404).json({ error: 'Share record not found.' });

  await prisma.share.update({
    where: { id: share.id },
    data: { status: 'REVOKED' }
  });

  await prisma.auditLog.create({
    data: {
      actorId: req.user!.id,
      documentId: share.documentId,
      action: 'SHARE_REVOKE',
      metadataJson: JSON.stringify({ shareId: share.id })
    }
  });

  return res.json({ message: 'Share access revoked successfully.' });
});

export default router;
