import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Checks recipient access pattern for anomalous activity (e.g. rapid downloads/access).
 * If threshold is exceeded, downgrades permission to VIEW_ONLY and logs an audit record.
 */
export async function evaluateAccessAnomaly(shareId: string, actorId: string): Promise<{ isAnomalous: boolean; reason?: string }> {
  const share = await prisma.share.findUnique({
    where: { id: shareId },
    include: { document: true, recipient: true }
  });

  if (!share) return { isAnomalous: false };

  const now = new Date();
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

  // Count recent access attempts in audit log
  const recentAccesses = await prisma.auditLog.count({
    where: {
      actorId,
      documentId: share.documentId,
      action: { in: ['VIEW', 'DOWNLOAD'] },
      createdAt: { gte: twoMinutesAgo }
    }
  });

  // Threshold: more than 4 accesses in 2 minutes is flagged as unusual velocity
  if (recentAccesses >= 4 && share.permissionLevel !== 'VIEW_ONLY' && share.status !== 'SUSPICIOUS_DOWNGRADE') {
    // Downgrade share
    await prisma.share.update({
      where: { id: shareId },
      data: {
        permissionLevel: 'VIEW_ONLY',
        status: 'SUSPICIOUS_DOWNGRADE'
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorId,
        documentId: share.documentId,
        action: 'ANOMALY_DOWNGRADE',
        metadataJson: JSON.stringify({
          reason: 'High access velocity detected (>4 requests in 2 min)',
          previousPermission: share.permissionLevel,
          newPermission: 'VIEW_ONLY',
          accessCount: recentAccesses
        })
      }
    });

    return {
      isAnomalous: true,
      reason: `Access velocity anomaly detected (${recentAccesses} accesses in 2 mins). Permissions automatically downgraded to VIEW_ONLY.`
    };
  }

  return { isAnomalous: false };
}
