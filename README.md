# SecureDocs AI — Adaptive Data Leakage Prevention Platform

SecureDocs AI is an enterprise document security system that automatically scans confidential uploads, extracts sensitive entities (Aadhaar, PAN, Passport, Bank Account, Credit Cards, API Keys, Passwords, SSN), calculates dynamic **Leak Probability Scores (0-100%)**, and enforces adaptive security policies (*Allow / Encrypt / Watermark / Restrict Download / Require Approval / Block*).

---

## 🚀 Quickstart & Setup

### Option 1: Local Development (Fast)

#### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run db:seed
npm run dev
```
Backend runs on `http://localhost:5001`.

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend application runs on `http://localhost:3000`.

---

### Option 2: Docker Compose Setup

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5001/api`
- PostgreSQL: `localhost:5432`

---

## 🔑 Pre-Seeded Demo User Accounts

| Role | Email | Password | Trust Score |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@securedocs.ai` | `password123` | 100/100 |
| **Manager** | `manager@securedocs.ai` | `password123` | 90/100 |
| **Employee** | `sarah.employee@securedocs.ai` | `password123` | 80/100 |
| **External Client** | `client.external@partner.com` | `password123` | 45/100 |

*Note: All logins require a 2FA OTP step. The simulated OTP code is logged to the backend console and displayed in an interactive copy banner on screen.*

---

## 🧪 Testing

Run backend AI Decision & Entity Extraction Unit Tests:
```bash
cd backend && npm test
```

---

## 🛠️ Architecture Highlights

- **Pluggable Heuristic/NER AI Engine:** Regex + NLP pipeline detecting Aadhaar, PAN, SSN, Credit Cards, and API Keys.
- **Explainable Decision Reasoning:** Shows step-by-step risk factor contributions (+25% Aadhaar, +35% API Keys, +15% Policy Keyword).
- **Real AES-256-GCM Encryption:** Encrypts buffer at rest and decrypts on authorized download.
- **Dynamic Identity Watermarking:** Client/server watermark overlay stamped with viewer identity and timestamp.
- **Access Velocity Anomaly Detection:** Automatically downgrades suspicious download sprees to View-Only access.
