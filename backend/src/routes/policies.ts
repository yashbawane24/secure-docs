import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/policies
 * List organization security policy rules
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const policies = await prisma.securityPolicy.findMany({
    orderBy: { minLeakScore: 'asc' }
  });
  return res.json({ policies });
});

/**
 * PUT /api/policies/:id
 * Update policy thresholds and action (Admin only)
 */
router.put('/:id', authenticateToken, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  const { minLeakScore, maxLeakScore, action, description } = req.body;

  const policy = await prisma.securityPolicy.findUnique({ where: { id: req.params.id } });
  if (!policy) return res.status(404).json({ error: 'Policy not found.' });

  const updated = await prisma.securityPolicy.update({
    where: { id: req.params.id },
    data: {
      minLeakScore: minLeakScore !== undefined ? parseInt(String(minLeakScore), 10) : policy.minLeakScore,
      maxLeakScore: maxLeakScore !== undefined ? parseInt(String(maxLeakScore), 10) : policy.maxLeakScore,
      action: action || policy.action,
      description: description || policy.description
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: req.user!.id,
      action: 'POLICY_UPDATE',
      metadataJson: JSON.stringify({
        policyId: updated.id,
        policyName: updated.name,
        newMin: updated.minLeakScore,
        newMax: updated.maxLeakScore,
        newAction: updated.action
      })
    }
  });

  return res.json({ message: 'Policy threshold updated successfully.', policy: updated });
});

export default router;
