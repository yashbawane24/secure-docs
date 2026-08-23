import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/analytics
 * Comprehensive aggregated metrics for security analytics dashboard
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const totalDocuments = await prisma.document.count();
  const totalAuditEvents = await prisma.auditLog.count();
  const totalUsers = await prisma.user.count();
  const totalShares = await prisma.share.count();

  // Documents by Classification
  const classificationCounts = await prisma.document.groupBy({
    by: ['classification'],
    _count: { id: true }
  });

  const classificationMap: Record<string, number> = {
    PUBLIC: 0,
    INTERNAL: 0,
    CONFIDENTIAL: 0,
    HIGHLY_CONFIDENTIAL: 0
  };
  classificationCounts.forEach(c => {
    classificationMap[c.classification] = c._count.id;
  });

  const classificationData = Object.keys(classificationMap).map(key => ({
    name: key,
    count: classificationMap[key]
  }));

  // Leak Score Distribution Buckets (0-20, 21-40, 41-60, 61-80, 81-100)
  const allDocs = await prisma.document.findMany({ select: { leakScore: true } });
  const scoreBuckets = [
    { range: '0-20% (Low)', count: 0 },
    { range: '21-40% (Mild)', count: 0 },
    { range: '41-60% (Moderate)', count: 0 },
    { range: '61-80% (High)', count: 0 },
    { range: '81-100% (Critical)', count: 0 }
  ];

  allDocs.forEach(d => {
    if (d.leakScore <= 20) scoreBuckets[0].count++;
    else if (d.leakScore <= 40) scoreBuckets[1].count++;
    else if (d.leakScore <= 60) scoreBuckets[2].count++;
    else if (d.leakScore <= 80) scoreBuckets[3].count++;
    else scoreBuckets[4].count++;
  });

  // Top Risky Documents
  const topRiskyDocuments = await prisma.document.findMany({
    orderBy: { leakScore: 'desc' },
    take: 5,
    include: {
      owner: { select: { name: true, email: true } },
      entities: true
    }
  });

  // Security Events Breakdown
  const actionCounts = await prisma.auditLog.groupBy({
    by: ['action'],
    _count: { id: true }
  });

  const securityEvents = actionCounts.map(ac => ({
    action: ac.action,
    count: ac._count.id
  }));

  // Entity Type Frequencies
  const entityCounts = await prisma.documentEntity.groupBy({
    by: ['entityType'],
    _count: { id: true }
  });

  const entityFrequencies = entityCounts.map(ec => ({
    type: ec.entityType,
    count: ec._count.id
  }));

  return res.json({
    summary: {
      totalDocuments,
      totalAuditEvents,
      totalUsers,
      totalShares,
      highRiskCount: scoreBuckets[3].count + scoreBuckets[4].count
    },
    classificationData,
    scoreBuckets,
    topRiskyDocuments,
    securityEvents,
    entityFrequencies
  });
});

export default router;
