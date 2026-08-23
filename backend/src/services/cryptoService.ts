import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = crypto.scryptSync(process.env.JWT_SECRET || 'securedocs_super_secret_jwt_key_2026', 'salt', 32);

export interface EncryptedBufferResult {
  encryptedBuffer: Buffer;
  ivHex: string;
  authTagHex: string;
}

export function encryptBuffer(buffer: Buffer): EncryptedBufferResult {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedBuffer: encrypted,
    ivHex: iv.toString('hex'),
    authTagHex: authTag.toString('hex')
  };
}

export function decryptBuffer(encryptedBuffer: Buffer, ivHex: string, authTagHex: string): Buffer {
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  decipher.setAuthTag(authTag);
  
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
}
