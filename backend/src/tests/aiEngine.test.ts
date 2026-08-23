import { analyzeDocument } from '../services/aiEngine';

describe('SecureDocs AI Engine', () => {
  test('detects Aadhaar, PAN, and API keys correctly', () => {
    const sampleText = `
      Confidential Document
      Employee Aadhaar: 3672 8901 2345
      PAN Card Number: ABCDE1234F
      Stripe API Secret Key: sk_demo_51Hz7890abcdefghijklmnopqrstuvwxyz123
    `;

    const result = analyzeDocument(sampleText);

    expect(result.entities.length).toBeGreaterThanOrEqual(3);
    const entityTypes = result.entities.map(e => e.entityType);
    expect(entityTypes).toContain('AADHAAR');
    expect(entityTypes).toContain('PAN');
    expect(entityTypes).toContain('API_KEY');
    expect(result.classification).toBe('HIGHLY_CONFIDENTIAL');
    expect(result.leakScore).toBeGreaterThanOrEqual(75);
    expect(['BLOCK', 'REQUIRE_APPROVAL']).toContain(result.recommendedAction);
    expect(result.reasoning.factors.length).toBeGreaterThan(0);
  });

  test('classifies public benign text as PUBLIC with low leak score', () => {
    const publicText = 'Welcome to SecureDocs AI. This is a public press release about our new security features.';
    const result = analyzeDocument(publicText);

    expect(result.classification).toBe('PUBLIC');
    expect(result.leakScore).toBeLessThan(20);
    expect(result.recommendedAction).toBe('ALLOW');
  });

  test('applies penalty for low recipient trust index', () => {
    const text = 'Internal memo regarding project timeline and team members john@company.com.';
    const highTrustResult = analyzeDocument(text, 90);
    const lowTrustResult = analyzeDocument(text, 30);

    expect(lowTrustResult.leakScore).toBeGreaterThan(highTrustResult.leakScore);
  });
});
