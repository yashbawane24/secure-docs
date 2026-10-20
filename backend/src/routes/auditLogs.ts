import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/audit-logs
 * Security audit logs: Admins & Managers see all; Employees see their own activity stream
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { action, search, limit } = req.query;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const whereClause: any = {};

  // Restrict standard users to their own actions or actions targeting their documents
  if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
    whereClause.OR = [
      { actorId: userId },
      { document: { ownerId: userId } }
    ];
  }

  if (action) {
    whereClause.action = String(action);
  }

  if (search) {
    const searchFilter = [
      { actor: { name: { contains: String(search) } } },
      { actor: { email: { contains: String(search) } } },
      { document: { title: { contains: String(search) } } }
    ];

    if (whereClause.OR) {
      whereClause.AND = [
        { OR: whereClause.OR },
        { OR: searchFilter }
      ];
      delete whereClause.OR;
    } else {
      whereClause.OR = searchFilter;
    }
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
