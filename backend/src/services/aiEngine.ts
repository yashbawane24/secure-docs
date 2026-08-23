/**
 * SecureDocs AI Engine - Entity Extraction, Classification & Leak Prediction Engine
 * Pluggable module supporting Heuristic Regex + NLP Heuristic Pipeline
 */

export interface DetectedEntity {
  entityType: 'AADHAAR' | 'PAN' | 'PASSPORT' | 'BANK_ACCOUNT' | 'CREDIT_CARD' | 'EMAIL' | 'PHONE' | 'API_KEY' | 'PASSWORD' | 'SSN';
  rawMatch: string;
  maskedValue: string;
  confidence: number;
  locationCount: number;
}

export type ClassificationType = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'HIGHLY_CONFIDENTIAL';
export type ActionType = 'ALLOW' | 'ENCRYPT' | 'WATERMARK' | 'RESTRICT_DOWNLOAD' | 'REQUIRE_APPROVAL' | 'BLOCK';

export interface ReasoningFactor {
  title: string;
  description: string;
  weight: number; // e.g. +30%
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AnalysisResult {
  entities: DetectedEntity[];
  classification: ClassificationType;
  leakScore: number; // 0 to 100
  recommendedAction: ActionType;
  reasoning: {
    summary: string;
    factors: ReasoningFactor[];
    policyTriggered: string;
  };
}

// Regex patterns for sensitive entity detection
const PATTERNS: { type: DetectedEntity['entityType']; regex: RegExp; weight: number }[] = [
  {
    type: 'API_KEY',
    regex: /(?:sk_demo_[0-9a-zA-Z]{24,32}|sk_test_[0-9a-zA-Z]{24,32}|AKIA[0-9A-Z]{16}|ghp_[0-9a-zA-Z]{36}|AIzaSy[0-9A-Za-z-_]{35}|bearer\s+[a-zA-Z0-9_\-\.]{30,})/gi,
    weight: 35
  },
  {
    type: 'PASSWORD',
    regex: /(?:password|passwd|secret_key|auth_token)\s*[:=]\s*["']?([^\s"']{8,})["']?/gi,
    weight: 30
  },
  {
    type: 'AADHAAR',
    regex: /\b[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}\b|\b[2-9]{1}[0-9]{11}\b/g,
    weight: 25
  },
  {
    type: 'PAN',
    regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
    weight: 25
  },
  {
    type: 'CREDIT_CARD',
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    weight: 25
  },
  {
    type: 'PASSPORT',
    regex: /\b[A-PR-WYa-pr-wy][1-9]\ds?\d{4}[1-9]\b/g,
    weight: 20
  },
  {
    type: 'SSN',
    regex: /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g,
    weight: 20
  },
  {
    type: 'BANK_ACCOUNT',
    regex: /\b(?:IFSC\s*[:=]?\s*[A-Z]{4}0[A-Z0-9]{6}|Account\s*#?\s*[:=]?\s*\d{9,18})\b/gi,
    weight: 20
  },
  {
    type: 'EMAIL',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    weight: 5
  },
  {
    type: 'PHONE',
    regex: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    weight: 5
  }
];

function maskEntityValue(type: DetectedEntity['entityType'], value: string): string {
  if (value.length <= 4) return '****';
  if (type === 'EMAIL') {
    const parts = value.split('@');
    return `${parts[0].substring(0, 2)}***@${parts[1]}`;
  }
  if (type === 'PAN' || type === 'AADHAAR') {
    return value.substring(0, 2) + '****' + value.substring(value.length - 2);
  }
  return value.substring(0, 3) + '••••••••' + value.substring(value.length - 2);
}

export function analyzeDocument(text: string, recipientTrustLevel: number = 75): AnalysisResult {
  const entityMap = new Map<string, { type: DetectedEntity['entityType']; rawMatches: Set<string>; count: number; weight: number }>();
  let totalRawWeight = 0;
  const factors: ReasoningFactor[] = [];

  for (const item of PATTERNS) {
    const matches = Array.from(text.matchAll(item.regex));
    if (matches.length > 0) {
      const matchStrings = new Set<string>();
      matches.forEach(m => matchStrings.add(m[0]));
      const count = matches.length;
      entityMap.set(item.type, {
        type: item.type,
        rawMatches: matchStrings,
        count,
        weight: item.weight
      });
      const contribution = Math.min(item.weight * count, item.weight * 2.5);
      totalRawWeight += contribution;
    }
  }

  const entities: DetectedEntity[] = [];
  entityMap.forEach((val, key) => {
    const firstMatch = Array.from(val.rawMatches)[0] || key;
    entities.push({
      entityType: val.type,
      rawMatch: firstMatch,
      maskedValue: maskEntityValue(val.type, firstMatch),
      confidence: 0.95,
      locationCount: val.count
    });

    const impactLevel = val.weight >= 30 ? 'CRITICAL' : val.weight >= 20 ? 'HIGH' : val.weight >= 10 ? 'MEDIUM' : 'LOW';
    factors.push({
      title: `${val.type.replace('_', ' ')} Detected (${val.count} occurrence${val.count > 1 ? 's' : ''})`,
      description: `Found ${val.count} sensitive ${val.type} reference(s) posing data leakage risk.`,
      weight: val.weight,
      impact: impactLevel
    });
  });

  // Check for high-risk corporate keywords
  const highRiskKeywords = ['strictly confidential', 'do not distribute', 'trade secret', 'proprietary', 'internal only', 'financial forecast'];
  let keywordBonus = 0;
  highRiskKeywords.forEach(kw => {
    if (text.toLowerCase().includes(kw)) {
      keywordBonus += 15;
      factors.push({
        title: `Policy Keyword: "${kw}"`,
        description: `Text explicitly specifies strict confidentiality control language.`,
        weight: 15,
        impact: 'HIGH'
      });
    }
  });

  // Calculate base leak score (0 - 100)
  let rawLeakScore = Math.round(totalRawWeight + keywordBonus);

  // Apply recipient trust level penalty if trust is low (< 60)
  if (recipientTrustLevel < 60) {
    const trustPenalty = Math.round((60 - recipientTrustLevel) * 0.5);
    rawLeakScore += trustPenalty;
    factors.push({
      title: `Low Recipient Trust Level (${recipientTrustLevel}/100)`,
      description: `Recipient trust index is below standard threshold, increasing leak probability score.`,
      weight: trustPenalty,
      impact: 'MEDIUM'
    });
  }

  const leakScore = Math.min(100, Math.max(0, rawLeakScore));

  // Determine Classification
  let classification: ClassificationType = 'PUBLIC';
  if (leakScore >= 75 || entityMap.has('API_KEY') || entityMap.has('PASSWORD')) {
    classification = 'HIGHLY_CONFIDENTIAL';
  } else if (leakScore >= 45 || entityMap.has('AADHAAR') || entityMap.has('PAN') || entityMap.has('CREDIT_CARD')) {
    classification = 'CONFIDENTIAL';
  } else if (leakScore >= 15 || entities.length > 0) {
    classification = 'INTERNAL';
  }

  // Determine Recommended Security Action
  let recommendedAction: ActionType = 'ALLOW';
  let policyTriggered = 'Default Standard Policy (Low Risk)';

  if (classification === 'HIGHLY_CONFIDENTIAL' || leakScore >= 80) {
    recommendedAction = 'BLOCK';
    policyTriggered = 'Policy HC-900: High Risk & Secret Leak Protection (Leak Score ≥ 80% or API Keys)';
  } else if (leakScore >= 60) {
    recommendedAction = 'REQUIRE_APPROVAL';
    policyTriggered = 'Policy MA-600: Manager Approval Mandate for Sensitive Entities';
  } else if (leakScore >= 40) {
    recommendedAction = 'WATERMARK';
    policyTriggered = 'Policy WM-400: Mandatory Recipient Identity Watermark Overlay';
  } else if (leakScore >= 20 || classification === 'CONFIDENTIAL') {
    recommendedAction = 'ENCRYPT';
    policyTriggered = 'Policy EN-200: AES-256 Encryption at Rest Enabled';
  }

  const summary = `Document analyzed with ${entities.length} sensitive entity types found. Overall Leak Probability Score is ${leakScore}%, classified as ${classification}. Recommended Action: ${recommendedAction}.`;

  return {
    entities,
    classification,
    leakScore,
    recommendedAction,
    reasoning: {
      summary,
      factors,
      policyTriggered
    }
  };
}
