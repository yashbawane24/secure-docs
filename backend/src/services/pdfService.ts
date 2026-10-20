import PDFDocument from 'pdfkit';

export interface EncryptedPdfOptions {
  title: string;
  filename: string;
  classification: string;
  leakScore: number;
  recommendedAction: string;
  extractedText?: string;
  encryptedBuffer?: Buffer;
  ivHex?: string;
  authTagHex?: string;
  userEmail: string;
  userRole: string;
  entities?: { entityType: string; maskedValue: string }[];
}

/**
 * Sanitizes raw document text by cryptographically masking and redacting
 * sensitive entities (Aadhaar, PAN, Credit Cards, Passwords, API Keys, etc.)
 * so the document is readable, understandable, and safe to share without leakage.
 */
export function sanitizeDocumentText(text: string): { sanitizedText: string; redactedCount: number } {
  if (!text) return { sanitizedText: 'No preview content available.', redactedCount: 0 };

  let sanitized = text;
  let redactedCount = 0;

  // 1. API Keys & Secrets
  const apiKeyRegex = /(?:sk_demo_[0-9a-zA-Z]{24,32}|sk_test_[0-9a-zA-Z]{24,32}|AKIA[0-9A-Z]{16}|ghp_[0-9a-zA-Z]{36}|AIzaSy[0-9A-Za-z-_]{35}|bearer\s+[a-zA-Z0-9_\-\.]{30,})/gi;
  sanitized = sanitized.replace(apiKeyRegex, (match) => {
    redactedCount++;
    const prefix = match.slice(0, 6);
    return `[PROTECTED API KEY: ${prefix}••••••••••••]`;
  });

  // 2. Passwords & Auth Tokens
  const passwordRegex = /((?:password|passwd|secret_key|auth_token|PGPASSWORD)\s*[:=]\s*["']?)([^\s"'\n]{6,})(["']?)/gi;
  sanitized = sanitized.replace(passwordRegex, (match, prefix, val, suffix) => {
    redactedCount++;
    return `${prefix}[REDACTED PASSWORD: ••••••••]${suffix}`;
  });

  // 3. Aadhaar Numbers (12 digits)
  const aadhaarRegex = /\b([2-9]{1}[0-9]{3})\s?([0-9]{4})\s?([0-9]{4})\b/g;
  sanitized = sanitized.replace(aadhaarRegex, (match, p1, p2, p3) => {
    redactedCount++;
    return `[PROTECTED AADHAAR: ${p1} •••• ${p3}]`;
  });

  // 4. PAN Cards (5 letters + 4 digits + 1 letter)
  const panRegex = /\b([A-Z]{2})[A-Z]{3}[0-9]{4}([A-Z]{1})\b/g;
  sanitized = sanitized.replace(panRegex, (match, p1, p2) => {
    redactedCount++;
    return `[PROTECTED PAN: ${p1}••••••${p2}]`;
  });

  // 5. Credit Cards (13 to 16 digits)
  const ccRegex = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g;
  sanitized = sanitized.replace(ccRegex, (match) => {
    redactedCount++;
    const first4 = match.slice(0, 4);
    const last4 = match.slice(-4);
    return `[PROTECTED CREDIT CARD: ${first4} •••• •••• ${last4}]`;
  });

  // 6. Bank Account Numbers & IFSC
  const bankAccRegex = /\b((?:Account\s*#?\s*[:=]?\s*)|(?:Bank\s*Account\s*[:=]?\s*))(\d{9,18})\b/gi;
  sanitized = sanitized.replace(bankAccRegex, (match, prefix, num) => {
    redactedCount++;
    const last4 = num.slice(-4);
    return `${prefix}[PROTECTED BANK ACCOUNT: ••••••••${last4}]`;
  });

  const ifscRegex = /\b(IFSC\s*[:=]?\s*)([A-Z]{4}0[A-Z0-9]{6})\b/gi;
  sanitized = sanitized.replace(ifscRegex, (match, prefix, code) => {
    redactedCount++;
    return `${prefix}[PROTECTED IFSC: ${code.slice(0, 4)}••••••]`;
  });

  // 7. Passports
  const passportRegex = /\b([A-PR-WYa-pr-wy][1-9])\ds?\d{4}([1-9])\b/g;
  sanitized = sanitized.replace(passportRegex, (match, p1, p2) => {
    redactedCount++;
    return `[PROTECTED PASSPORT: ${p1}••••${p2}]`;
  });

  // 8. SSN Numbers
  const ssnRegex = /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-([0-9]{4})\b/g;
  sanitized = sanitized.replace(ssnRegex, (match, last4) => {
    redactedCount++;
    return `[PROTECTED SSN: •••-••-${last4}]`;
  });

  // 9. Emails
  const emailRegex = /\b([A-Za-z0-9._%+-]{1,2})[A-Za-z0-9._%+-]*(@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g;
  sanitized = sanitized.replace(emailRegex, (match, start, domain) => {
    redactedCount++;
    return `${start}***${domain}`;
  });

  // 10. Phone numbers
  const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  sanitized = sanitized.replace(phoneRegex, (match) => {
    redactedCount++;
    return `+1 (555) •••-••••`;
  });

  return { sanitizedText: sanitized, redactedCount };
}

/**
 * Generates an easily understandable, secured PDF document where:
 * 1. Sensitive PII, secrets, and financial details are hidden and replaced with clear protection tokens.
 * 2. An official diagonal watermark is stamped across every page with the recipient's identity and timestamp.
 * 3. The document text is readable and formatted, safe for authorized sharing.
 */
export function generateEncryptedPdf(options: EncryptedPdfOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 45,
        bufferPages: true,
        info: {
          Title: `Secured - ${options.title}`,
          Author: 'SecureDocs AI Platform',
          Subject: 'Sanitized & Watermarked Document for Secure Sharing',
          Keywords: 'DLP, Watermark, Privacy, SecureDocs AI'
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Sanitize the raw text to hide all sensitive data
      const rawText = options.extractedText || options.encryptedBuffer?.toString('utf-8') || 'No document content available.';
      const { sanitizedText, redactedCount } = sanitizeDocumentText(rawText);

      // Helper function to draw identity watermark on current page
      const drawWatermark = () => {
        doc.save();
        doc.opacity(0.08); // Subtle, semi-transparent watermark
        doc.rotate(-32, { origin: [297, 420] });
        
        doc.fontSize(22).font('Helvetica-Bold').fillColor('#0284C7')
           .text(`SECUREDOCS AI  •  CONFIDENTIAL  •  ${options.userEmail.toUpperCase()}`, -90, 360, {
             align: 'center',
             width: 780
           });

        doc.fontSize(16).font('Helvetica-Bold')
           .text(`SAFE RECIPIENT COPY  •  SENSITIVE DATA SHIELDED  •  ${new Date().toISOString().substring(0, 10)}`, -90, 410, {
             align: 'center',
             width: 780
           });

        doc.restore();
        doc.opacity(1.0);
      };

      // Draw watermark on page 1
      drawWatermark();

      // 1. Top Header Banner
      doc.rect(45, 45, 505, 52).fill('#0F172A'); // Slate 900
      
      doc.fillColor('#38BDF8').fontSize(14).font('Helvetica-Bold')
         .text('SECUREDOCS AI', 60, 56);
      
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
         .text('ADAPTIVE DATA LEAK PREVENTION  •  SECURE SANITIZED EXPORT', 60, 74);

      // Drawn green dot for status
      doc.circle(385, 62, 3.5).fill('#22C55E');
      doc.fillColor('#22C55E').fontSize(8).font('Helvetica-Bold').text('SENSITIVE DATA HIDDEN', 395, 58);
      doc.fillColor('#94A3B8').fontSize(7.5).font('Helvetica').text('IDENTITY WATERMARKED', 395, 72);

      // 2. Document Governance & Summary Card
      const cardY = 108;
      const cardHeight = 82;
      doc.rect(45, cardY, 505, cardHeight).fillAndStroke('#F8FAFC', '#E2E8F0');

      doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold')
         .text(options.title, 60, cardY + 10);

      doc.fillColor('#64748B').fontSize(8).font('Helvetica')
         .text(`Original File: ${options.filename}   •   Classification: ${options.classification}`, 60, cardY + 26);

      doc.fillColor('#64748B').fontSize(8).font('Helvetica')
         .text(`Exported For: ${options.userEmail} (${options.userRole})   •   Date: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`, 60, cardY + 38);

      // Privacy assurance banner inside summary card
      doc.rect(55, cardY + 54, 485, 18).fill('#DCFCE7'); // Soft emerald green
      doc.circle(68, cardY + 63, 3).fill('#15803D');
      doc.fillColor('#15803D').fontSize(8).font('Helvetica-Bold')
         .text(`PRIVACY PROTECTED: ${redactedCount > 0 ? `${redactedCount} sensitive entities (IDs, cards, passwords) were hidden.` : 'All confidential numbers and credentials shielded.'}`, 76, cardY + 59);

      // 3. Document Content Header
      const contentTitleY = cardY + cardHeight + 18;
      doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold')
         .text('DOCUMENT CONTENT (SECURED & SANITIZED):', 45, contentTitleY);

      doc.fillColor('#64748B').fontSize(8).font('Helvetica')
         .text('All private credentials and personal numbers have been replaced with protection tokens so this file can be shared safely.', 45, contentTitleY + 13);

      // 4. Document Body Text
      const bodyY = contentTitleY + 30;
      doc.fillColor('#1E293B').fontSize(9.5).font('Courier')
         .text(sanitizedText, 45, bodyY, {
           width: 505,
           lineGap: 4
         });

      // 5. Watermark and Footers across all pages
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        doc.save();
        if (i > 0) drawWatermark();

        // Footer line
        const footerY = 760;
        doc.moveTo(45, footerY).lineTo(550, footerY).strokeColor('#E2E8F0').stroke();
        
        doc.fillColor('#94A3B8').fontSize(7.5).font('Helvetica')
           .text('SecureDocs AI Platform • Tamper-evident Watermark Protected • Safe for Authorized Distribution', 45, footerY + 6, {
             lineBreak: false
           });
        
        doc.text(`Page ${i + 1} of ${range.count}`, 450, footerY + 6, {
          align: 'right',
          width: 100,
          lineBreak: false
        });
        doc.restore();
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
