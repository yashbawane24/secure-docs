import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'securedocs_super_secret_jwt_key_2026';

// Store temporary pending OTPs in memory for dev
const pendingOtps = new Map<string, { otp: string; expires: number; userId: string }>();

/**
 * POST /api/auth/login
 * Step 1: Validate credentials, generate OTP
 */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password, portalRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Strict Portal Role Authorization Verification
  if (portalRole) {
    if (portalRole === 'ADMIN' && user.role !== 'ADMIN') {
      return res.status(403).json({
        error: `Access Denied: Your account role is ${user.role}. You are NOT authorized to log in through the Administrator Portal. Please switch to the ${user.role === 'MANAGER' ? 'Manager' : 'Employee'} Portal.`
      });
    }

    if (portalRole === 'MANAGER' && user.role !== 'MANAGER' && user.role !== 'ADMIN') {
      return res.status(403).json({
        error: `Access Denied: Your account role is ${user.role}. You are NOT authorized to log in through the Manager Portal. Please switch to the Employee Portal.`
      });
    }

    if (portalRole === 'EMPLOYEE' && user.role !== 'EMPLOYEE' && user.role !== 'ADMIN') {
      return res.status(403).json({
        error: `Access Denied: Your account role is ${user.role}. Please log in through your designated ${user.role === 'MANAGER' ? 'Manager' : 'External'} Portal.`
      });
    }
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      trustLevel: user.trustLevel,
      orgId: user.orgId
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      trustLevel: user.trustLevel,
      orgId: user.orgId
    }
  });
});

/**
 * POST /api/auth/verify-otp
 * Step 2: Verify OTP and issue JWT Token
 */
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP code are required.' });
  }

  const record = pendingOtps.get(email);
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(400).json({ error: 'Invalid or expired OTP code.' });
  }

  // Clear pending OTP
  pendingOtps.delete(email);

  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      trustLevel: user.trustLevel,
      orgId: user.orgId
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      trustLevel: user.trustLevel,
      orgId: user.orgId
    }
  });
});

/**
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: 'User already exists with this email.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role || 'EMPLOYEE',
      trustLevel: 75,
      orgId: 'org-securedocs-corp'
    }
  });

  return res.status(201).json({
    message: 'Account created successfully. Please login.',
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user?.id },
    select: { id: true, name: true, email: true, role: true, trustLevel: true, orgId: true, createdAt: true }
  });

  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user });
});

export default router;
