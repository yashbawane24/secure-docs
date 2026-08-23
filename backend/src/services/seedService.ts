import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { analyzeDocument } from './aiEngine';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('🌱 Starting SecureDocs AI Database Seeding...');

  // Clean existing tables
  await prisma.auditLog.deleteMany();
  await prisma.share.deleteMany();
  await prisma.documentEntity.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();
  await prisma.securityPolicy.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Users across roles
  const usersData = [
    { name: 'Elena Rostova (Admin)', email: 'admin@securedocs.ai', role: 'ADMIN', trustLevel: 100 },
    { name: 'Marcus Vance (Security Manager)', email: 'manager@securedocs.ai', role: 'MANAGER', trustLevel: 90 },
    { name: 'Sarah Chen (Senior Developer)', email: 'sarah.employee@securedocs.ai', role: 'EMPLOYEE', trustLevel: 80 },
    { name: 'Alex Rivera (DevOps Engineer)', email: 'alex.dev@securedocs.ai', role: 'EMPLOYEE', trustLevel: 75 },
    { name: 'Priya Sharma (Finance Lead)', email: 'priya.fin@securedocs.ai', role: 'MANAGER', trustLevel: 88 },
    { name: 'David Miller (External Contractor)', email: 'client.external@partner.com', role: 'EXTERNAL_CLIENT', trustLevel: 45 },
    { name: 'Rachel Green (External Auditor)', email: 'auditor.ext@securityfirm.com', role: 'EXTERNAL_CLIENT', trustLevel: 50 },
    { name: 'Rohit Verma (HR Partner)', email: 'rohit.hr@securedocs.ai', role: 'EMPLOYEE', trustLevel: 70 },
    { name: 'Kavita Patel (Legal Counsel)', email: 'compliance.officer@securedocs.ai', role: 'MANAGER', trustLevel: 95 },
    { name: 'Tom Holland (Product Specialist)', email: 'tom.product@securedocs.ai', role: 'EMPLOYEE', trustLevel: 65 },
  ];

  const createdUsers: Record<string, string> = {};
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        trustLevel: u.trustLevel,
        orgId: 'org-securedocs-corp'
      }
    });
    createdUsers[u.email] = user.id;
  }

  // 2. Seed Default Security Policies
  const policiesData = [
    { name: 'Standard Public Clearance', minLeakScore: 0, maxLeakScore: 15, action: 'ALLOW', description: 'Public or low-sensitivity content. Unrestricted distribution permitted.', isEditable: false },
    { name: 'Internal Data Cipher Enforcement', minLeakScore: 16, maxLeakScore: 35, action: 'ENCRYPT', description: 'Requires AES-256 encryption at rest for internal operational files.', isEditable: true },
    { name: 'Recipient Identity Overlay', minLeakScore: 36, maxLeakScore: 59, action: 'WATERMARK', description: 'Applies dynamic viewer name and timestamp watermark to document preview.', isEditable: true },
    { name: 'Manager Approval Mandate', minLeakScore: 60, maxLeakScore: 79, action: 'REQUIRE_APPROVAL', description: 'Requires security manager explicit approval before external sharing.', isEditable: true },
    { name: 'Critical Secret Leak Blockade', minLeakScore: 80, maxLeakScore: 100, action: 'BLOCK', description: 'High probability leak of API keys, passwords, or PII. Fully blocks external download.', isEditable: true }
  ];

  for (const p of policiesData) {
    await prisma.securityPolicy.create({
      data: {
        orgId: 'org-securedocs-corp',
        name: p.name,
        minLeakScore: p.minLeakScore,
        maxLeakScore: p.maxLeakScore,
        action: p.action,
        description: p.description,
        isEditable: p.isEditable
      }
    });
  }

  // 3. Seed ~25 Documents with realistic contents & AI analysis
  const sampleDocs = [
    {
      title: 'AWS Production Deployment Keys 2026',
      filename: 'aws_prod_secrets.env',
      mimeType: 'text/plain',
      ownerEmail: 'alex.dev@securedocs.ai',
      text: 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\nAWS_SECRET_ACCESS_KEY=sk_demo_51Hz7890abcdefghijklmnopqrstuvwxyz123\nDATABASE_URL=postgresql://admin:password123@prod-db.internal:5432/main'
    },
    {
      title: 'Q3 Financial Audit & Bank Accounts',
      filename: 'q3_finance_audit.pdf',
      mimeType: 'application/pdf',
      ownerEmail: 'priya.fin@securedocs.ai',
      text: 'Strictly Confidential Financial Audit Report.\nCompany Bank Account: 987654321098\nIFSC Code: HDFC0001234\nAuthorized Signatory PAN: ABCDE1234F\nNet Margin Forecast: $14.2M'
    },
    {
      title: 'Employee Aadhaar & KYC Registry',
      filename: 'employee_kyc_records.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ownerEmail: 'rohit.hr@securedocs.ai',
      text: 'Employee Identity Register 2026.\nJohn Doe - Aadhaar: 3672 8901 2345, PAN: FGHIJ5678K\nPriya Sharma - Aadhaar: 9821 4567 1123\nDo Not Distribute - Internal HR Only.'
    },
    {
      title: 'Passport & Visa Verification Specs',
      filename: 'executive_passports.pdf',
      mimeType: 'application/pdf',
      ownerEmail: 'compliance.officer@securedocs.ai',
      text: 'Executive Travel Clearances.\nCEO Passport No: Z1234567\nVP Operations Passport: A9876543\nContact Email: compliance@securedocs.ai, Phone: +1-555-019-2834'
    },
    {
      title: 'Stripe Payment Gateway Integration Tokens',
      filename: 'stripe_config.json',
      mimeType: 'application/json',
      ownerEmail: 'sarah.employee@securedocs.ai',
      text: '{"stripe_live_key": "sk_demo_28917398127398127391827391827391283", "webhook_secret": "whsec_abcd1234efgh5678ijkl9012"}'
    },
    {
      title: 'Company Public Brand Guidelines 2026',
      filename: 'brand_guidelines.pdf',
      mimeType: 'application/pdf',
      ownerEmail: 'tom.product@securedocs.ai',
      text: 'SecureDocs AI Official Brand Book.\nColors: Electric Cyan #06B6D4, Deep Slate #0F172A.\nTypography: Inter, Outfit. Free to share publicly.'
    },
    {
      title: 'Product Roadmap & Vision Deck',
      filename: 'product_roadmap_2026.pptx',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ownerEmail: 'tom.product@securedocs.ai',
      text: 'Internal Only Product Strategy.\nQ1: Adaptive AI Engine.\nQ2: Dynamic Watermarking.\nQ3: Enterprise SSO & Anomaly Detection.'
    },
    {
      title: 'Customer Support SLA & Policy',
      filename: 'support_sla_v2.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ownerEmail: 'sarah.employee@securedocs.ai',
      text: 'Standard Operating Procedures for Technical Support.\nResponse time under 15 minutes for P0 incidents.\nEmail support@securedocs.ai'
    },
    {
      title: 'Executive Salary & Compensation Sheet',
      filename: 'compensation_matrix_2026.csv',
      mimeType: 'text/csv',
      ownerEmail: 'priya.fin@securedocs.ai',
      text: 'CONFIDENTIAL HR SALARY DATA.\nRole, Band, Base, Bonus, Stock Options.\nVP Engineering: $280,000 + 0.5% Equity.\nLead Architect: $220,000 + 0.25% Equity.\nStrictly Confidential.'
    },
    {
      title: 'SSN & Tax Identity Forms',
      filename: 'us_contractor_tax_forms.pdf',
      mimeType: 'application/pdf',
      ownerEmail: 'compliance.officer@securedocs.ai',
      text: 'Tax Identification Records.\nContractor SSN: 666-45-1234\nEIN Tax ID: 12-3456789\nAddress: 100 Silicon Way, CA'
    },
    {
      title: 'Database Backup Script & Auth Credentials',
      filename: 'backup_db.sh',
      mimeType: 'application/x-sh',
      ownerEmail: 'alex.dev@securedocs.ai',
      text: '#!/bin/bash\npg_dump -U postgres -h 10.0.4.12 -d securedocs_db > dump.sql\nexport PGPASSWORD="password123"'
    },
    {
      title: 'Open Source License Declaration',
      filename: 'LICENSE.txt',
      mimeType: 'text/plain',
      ownerEmail: 'sarah.employee@securedocs.ai',
      text: 'MIT License. Copyright (c) 2026 SecureDocs AI Team. Permission is hereby granted, free of charge...'
    },
    {
      title: 'Architecture Diagram & Security Review',
      filename: 'system_architecture.pdf',
      mimeType: 'application/pdf',
      ownerEmail: 'manager@securedocs.ai',
      text: 'SecureDocs AI System Architecture Document.\nMicroservice layout, OAuth2 standard, AES-256 GCM storage encryption layer.'
    },
    {
      title: 'Vendor Contract - Cloud Flare Enterprise',
      filename: 'cloudflare_contract_signed.pdf',
      mimeType: 'application/pdf',
      ownerEmail: 'compliance.officer@securedocs.ai',
      text: 'Vendor Service Agreement.\nTotal Contract Value: $120,000/yr.\nBilling Account: Account #: 981273981273.\nSignatory: Elena Rostova.'
    },
    {
      title: 'Penetration Testing & Vulnerability Assessment',
      filename: 'pentest_report_july2026.pdf',
      mimeType: 'application/pdf',
      ownerEmail: 'manager@securedocs.ai',
      text: 'HIGHLY CONFIDENTIAL PENTEST RESULTS.\n0 Critical, 1 High, 3 Low findings.\nRecommendation: Upgrade JWT secret rotation schedule.'
    },
    {
      title: 'Public Press Release - Series A Funding',
      filename: 'press_release_series_a.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ownerEmail: 'admin@securedocs.ai',
      text: 'FOR IMMEDIATE RELEASE: SecureDocs AI Raises $12M Series A to Revolutionize Dynamic Data Leak Prevention.'
    },
    {
      title: 'Patent Application Draft - Adaptive Security Engine',
      filename: 'patent_draft_claim_14.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ownerEmail: 'manager@securedocs.ai',
      text: 'Patent Claims: Method and apparatus for dynamic trust-based document permission downgrading using velocity anomaly detection.'
    },
    {
      title: 'Credit Card Merchant Settlement Report',
      filename: 'merchant_settlement_july.csv',
      mimeType: 'text/csv',
      ownerEmail: 'priya.fin@securedocs.ai',
      text: 'Merchant ID: 453298104921\nProcessed Cards: 4532890123456789, 5155123456789012\nSettlement Sum: $492,100'
    },
    {
      title: 'ISO 27001 Security Audit Certificate',
      filename: 'iso27001_cert_2026.pdf',
      mimeType: 'application/pdf',
      ownerEmail: 'manager@securedocs.ai',
      text: 'Certificate of Compliance with ISO/IEC 27001:2022 Security Standards. Issued to SecureDocs AI Corp.'
    },
    {
      title: 'API Developer Portal Getting Started',
      filename: 'api_quickstart.md',
      mimeType: 'text/markdown',
      ownerEmail: 'sarah.employee@securedocs.ai',
      text: '# Quickstart Guide\nTo integrate with SecureDocs AI REST API, request a developer client_id from your admin panel.'
    },
    {
      title: 'Board Meeting Minutes - Strategic Acquisition',
      filename: 'board_minutes_july2026.pdf',
      mimeType: 'application/pdf',
      ownerEmail: 'admin@securedocs.ai',
      text: 'STRICTLY CONFIDENTIAL BOARD MEETING.\nDiscussion of target acquisition valuation ($45M).\nDo Not Copy or Transfer.'
    },
    {
      title: 'Office Facilities & Access Card Codes',
      filename: 'facility_access_codes.txt',
      mimeType: 'text/plain',
      ownerEmail: 'rohit.hr@securedocs.ai',
      text: 'Building B Door PIN: 4892#\nServer Room Keypad Code: secret_key = "991204"\nEmergency Contact: 555-019-9988'
    },
    {
      title: 'Customer Churn Analytics & Survey',
      filename: 'churn_survey_q2.pdf',
      mimeType: 'application/pdf',
      ownerEmail: 'tom.product@securedocs.ai',
      text: 'Customer Retention Feedback. Net Promoter Score: 68. Key feedback on UI speed and automated alerts.'
    },
    {
      title: 'Employee Performance Review Template',
      filename: 'perf_review_template.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ownerEmail: 'rohit.hr@securedocs.ai',
      text: 'Standard Performance Review Evaluation Form. Goal attainment, core values alignment, self assessment.'
    },
    {
      title: 'Incident Response Playbook & Contacts',
      filename: 'incident_playbook_v3.pdf',
      mimeType: 'application/pdf',
      ownerEmail: 'alex.dev@securedocs.ai',
      text: 'Security Incident Escalation Protocol.\nLevel 1: On-call DevOps.\nLevel 2: CISO & Security Manager.\nPhone: +1-555-911-0000'
    }
  ];

  const createdDocs = [];

  for (const item of sampleDocs) {
    const ownerId = createdUsers[item.ownerEmail];
    const analysis = analyzeDocument(item.text);

    const doc = await prisma.document.create({
      data: {
        ownerId,
        title: item.title,
        filename: item.filename,
        fileSize: Buffer.byteLength(item.text, 'utf-8'),
        mimeType: item.mimeType,
        storagePath: `uploads/${item.filename}`,
        extractedText: item.text,
        classification: analysis.classification,
        leakScore: analysis.leakScore,
        recommendedAction: analysis.recommendedAction,
        isEncrypted: analysis.recommendedAction === 'ENCRYPT' || analysis.recommendedAction === 'BLOCK',
        entities: {
          create: analysis.entities.map(e => ({
            entityType: e.entityType,
            maskedValue: e.maskedValue,
            confidence: e.confidence,
            locationCount: e.locationCount
          }))
        }
      }
    });

    createdDocs.push(doc);

    // Initial Audit Log for Upload
    await prisma.auditLog.create({
      data: {
        actorId: ownerId,
        documentId: doc.id,
        action: 'UPLOAD',
        metadataJson: JSON.stringify({
          classification: analysis.classification,
          leakScore: analysis.leakScore,
          recommendedAction: analysis.recommendedAction
        })
      }
    });
  }

  // 4. Seed Shares between users
  const externalClientId = createdUsers['client.external@partner.com'];
  const auditorId = createdUsers['auditor.ext@securityfirm.com'];
  const employeeId = createdUsers['sarah.employee@securedocs.ai'];

  const sampleShares = [
    { docIndex: 0, recipientId: externalClientId, permissionLevel: 'VIEW_ONLY', status: 'ACTIVE' },
    { docIndex: 1, recipientId: auditorId, permissionLevel: 'TIME_LIMITED', status: 'ACTIVE' },
    { docIndex: 2, recipientId: employeeId, permissionLevel: 'DOWNLOAD_EDIT', status: 'ACTIVE' },
    { docIndex: 3, recipientId: externalClientId, permissionLevel: 'VIEW_ONLY', status: 'SUSPICIOUS_DOWNGRADE' },
    { docIndex: 4, recipientId: externalClientId, permissionLevel: 'DENIED', status: 'REVOKED' },
  ];

  for (const s of sampleShares) {
    const doc = createdDocs[s.docIndex];
    if (doc) {
      const share = await prisma.share.create({
        data: {
          documentId: doc.id,
          senderId: doc.ownerId,
          recipientId: s.recipientId,
          permissionLevel: s.permissionLevel,
          status: s.status,
          expiresAt: s.permissionLevel === 'TIME_LIMITED' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
        }
      });

      await prisma.auditLog.create({
        data: {
          actorId: doc.ownerId,
          documentId: doc.id,
          action: 'SHARE',
          metadataJson: JSON.stringify({
            sharedWithId: s.recipientId,
            permissionLevel: s.permissionLevel,
            status: s.status
          })
        }
      });
    }
  }

  // 5. Seed Additional Realistic Audit Logs for Dashboard & Analytics
  const actions = ['VIEW', 'DOWNLOAD', 'WATERMARK', 'ENCRYPT', 'POLICY_TRIGGER'];
  for (let i = 0; i < 20; i++) {
    const randomUserEmail = Object.keys(createdUsers)[i % Object.keys(createdUsers).length];
    const randomDoc = createdDocs[i % createdDocs.length];
    const action = actions[i % actions.length];

    await prisma.auditLog.create({
      data: {
        actorId: createdUsers[randomUserEmail],
        documentId: randomDoc.id,
        action,
        metadataJson: JSON.stringify({
          device: 'Chrome / macOS',
          ip: `192.168.1.${10 + i}`
        }),
        createdAt: new Date(Date.now() - (i * 3 * 3600 * 1000))
      }
    });
  }

  console.log(`✅ Seeded ${Object.keys(createdUsers).length} Users, ${createdDocs.length} Documents, Policies, Shares & Audit Logs!`);
}

// Run direct script execution
if (require.main === module) {
  seedDatabase()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
