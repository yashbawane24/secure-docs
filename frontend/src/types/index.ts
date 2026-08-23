export type Role = 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'EXTERNAL_CLIENT';
export type Classification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'HIGHLY_CONFIDENTIAL';
export type ActionType = 'ALLOW' | 'ENCRYPT' | 'WATERMARK' | 'RESTRICT_DOWNLOAD' | 'REQUIRE_APPROVAL' | 'BLOCK';
export type EntityType = 'AADHAAR' | 'PAN' | 'PASSPORT' | 'BANK_ACCOUNT' | 'CREDIT_CARD' | 'EMAIL' | 'PHONE' | 'API_KEY' | 'PASSWORD' | 'SSN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  trustLevel: number;
  orgId: string;
}

export interface DocumentEntity {
  id: string;
  entityType: EntityType;
  maskedValue: string;
  confidence: number;
  locationCount: number;
}

export interface Share {
  id: string;
  documentId: string;
  document?: DocumentItem;
  senderId: string;
  sender?: { name: string; email: string };
  recipientId: string;
  recipient?: { id: string; name: string; email: string; trustLevel: number };
  permissionLevel: 'VIEW_ONLY' | 'DOWNLOAD_EDIT' | 'TIME_LIMITED' | 'DENIED';
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'SUSPICIOUS_DOWNGRADE';
  expiresAt?: string;
  anomalyFlag?: boolean;
  anomalyReason?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actor?: { id: string; name: string; email: string; role: Role };
  documentId?: string;
  document?: { id: string; title: string; classification: Classification; leakScore: number };
  action: string;
  metadataJson?: string;
  ipAddress: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  ownerId: string;
  owner?: { id: string; name: string; email: string; role?: string };
  title: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  extractedText?: string;
  classification: Classification;
  leakScore: number;
  recommendedAction: ActionType;
  isEncrypted: boolean;
  entities: DocumentEntity[];
  shares?: Share[];
  auditLogs?: AuditLog[];
  createdAt: string;
  updatedAt: string;
}

export interface ReasoningFactor {
  title: string;
  description: string;
  weight: number;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AnalysisReasoning {
  summary: string;
  factors: ReasoningFactor[];
  policyTriggered: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  minLeakScore: number;
  maxLeakScore: number;
  action: ActionType;
  description: string;
  isEditable: boolean;
}
