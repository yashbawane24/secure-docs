import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/audit-logs
 * Filterable security audit logs (Manager & Admin access)
 */
router.get('/', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req: AuthRequest, res: Response) => {
  const { action, search, limit } = req.query;

  const whereClause: any = {};
  if (action) {
    whereClause.action = String(action);
  }

  if (search) {
    whereClause.OR = [
      { actor: { name: { contains: String(search) } } },
      { actor: { email: { contains: String(search) } } },
      { document: { title: { contains: String(search) } } }
    ];
  }

  const logs = await prisma.auditLog.findMany({
    where: whereClause,
    include: {
      actor: { select: { id: true, name: true, email: true, role: true } },
      document: { select: { id: true, title: true, classification: true, leakScore: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: limit ? parseInt(String(limit), 10) : 50
  });

  return res.json({ logs });
});

export default router;
