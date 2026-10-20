# 🛡️ SecureDocs AI — Complete Website Guide, Roles & Step-by-Step Tutorial

Welcome to **SecureDocs AI**! This guide is written in plain, easy-to-understand language so anyone can master the platform, understand every feature and button, know what each role does, and follow a complete hands-on tutorial.

---

## 1. 💡 What is SecureDocs AI? (Simple Explanation)

Imagine your company has thousands of confidential documents: employee Aadhaar/PAN cards, customer credit cards, bank accounts, passwords, API keys, and internal strategy memos.
- If someone accidentally uploads or shares a document containing passwords or credit cards with an outsider, it could cause a massive, expensive data breach.
- **SecureDocs AI acts like an intelligent airport security scanner for files.**
- Whenever someone uploads a document, the AI immediately inspects every line of text, flags sensitive data (like PAN, Aadhaar, credit cards, or API secrets), calculates a **Leak Probability Score (0% to 100%)**, and automatically decides what safety action to take:
  1. **ALLOW**: Safe to share freely.
  2. **ENCRYPT**: Lock with AES-256 military-grade encryption.
  3. **WATERMARK**: Stamp the reader's name and timestamp diagonally across the page to prevent screenshots or leaks.
  4. **RESTRICT DOWNLOAD / REQUIRE APPROVAL**: Prevent instant downloading until a manager reviews it.
  5. **BLOCK**: Total lockdown for extreme threats (e.g., leaked production AWS secrets or database passwords).

---

## 2. 👥 The 4 Roles Explained (Who Does What?)

SecureDocs AI uses **Role-Based Access Control (RBAC)** combined with a **Dynamic Trust Score (0 to 100)**:

| Role | Default Email | Password | Trust Score | What They Can & Cannot Do |
| :--- | :--- | :--- | :---: | :--- |
| 👑 **ADMIN** | `admin@securedocs.ai` | `password123` | **100 / 100** | • **Full system control**.<br>• Can see and download **all** documents across the entire organization.<br>• Can configure **Security Policies** (adjust sliders for when to block, encrypt, or watermark).<br>• Can inspect full **Audit Logs** and view company-wide **Analytics**.<br>• Can bypass block restrictions when emergency maintenance is needed. |
| 👔 **MANAGER** | `manager@securedocs.ai` | `password123` | **90 / 100** | • Department supervisor or team lead.<br>• Can view all team documents and review sensitive files.<br>• Can view Audit Trails & Analytics to check security compliance.<br>• Can share files with team members and external partners. |
| 💼 **EMPLOYEE** | `sarah.employee@securedocs.ai`<br>*(also `alex.dev@securedocs.ai`)* | `password123` | **80 / 100** | • Standard staff member.<br>• Can upload, scan, and inspect their own documents.<br>• Can share their documents with coworkers or clients.<br>• Can only see their own uploaded files or files shared directly with them.<br>• Subject to policy blocks (cannot download files that AI marked as `BLOCK`). |
| 🌐 **EXTERNAL CLIENT** | `client.external@partner.com`<br>*(also `auditor.ext@securityfirm.com`)* | `password123` | **45 / 100** | • Outside partner, vendor, or contractor.<br>• Low trust score (45/100).<br>• When someone shares a sensitive file with them, the system automatically downgrades permissions to **VIEW_ONLY**.<br>• Always sees a **Dynamic Watermark** with their email and IP stamped across the preview.<br>• Cannot download files if the leak score is high.<br>• **Anomaly Trigger**: If they rapidly refresh or try to grab files more than 4 times in 2 minutes, the system triggers a **Velocity Anomaly** and immediately revokes download permissions! |

---

## 3. 🗺️ All Website Pages & Sections Explained

### 1. 🌟 Landing Page (`/`)
- **What it is**: The public homepage of the product.
- **Key Sections**:
  - Hero banner explaining Adaptive Data Leak Prevention.
  - Interactive Feature Cards: Real-Time AI Scanning, AES-256-GCM Encryption, Dynamic Watermarking, and Access Velocity Anomaly Detection.
  - Quick buttons to **Log In**, **Sign Up**, or **Launch App**.

### 2. 🔐 Multi-Portal Login & CAPTCHA Verification (`/login`)
- **What it is**: Multi-role portal interface inspired by institutional enterprise portals (VTOP style) with 3 dedicated sections:
  1. 💼 **Employee Portal**: Staff, developers, and operational accounts.
  2. 👔 **Manager Portal**: Security supervisors and policy approvers.
  3. 👑 **Admin Portal**: Chief information security officers and system administrators.
- **How it works**:
  1. Click on your respective role portal card (**Employee**, **Manager**, or **Admin**).
  2. Enter your Email and Password.
  3. Enter the **Security CAPTCHA** shown in the canvas box (anti-bot security check; click the refresh icon if you want a new code).
  4. Click **Sign In**: You are authenticated and enter your workspace dashboard immediately without waiting for OTP codes!

### 3. 📊 Dashboard (`/dashboard`)
- **What it is**: Your central command center.
- **Key Elements**:
  - **Security & Data Leakage Overview Banner**: Quick button to upload & scan.
  - **4 KPI Metric Cards**:
    - *Total Scanned Docs*: How many files have been processed.
    - *High Risk Files*: Files with Leak Score ≥ 60%.
    - *Encrypted Repositories*: Files locked with AES-256 at rest.
    - *Security Events*: Audit actions logged today.
  - **Average Leak Risk Gauge**: An interactive SVG gauge displaying the health of your documents.
  - **Recent Scans Table**: Quick list of the last 5 scanned files with their leak score badge and classification.
  - **Live Audit Feed**: Shows the latest actions (Uploads, Shares, Views) happening right now.

### 4. 📁 Document Library (`/documents`)
- **What it is**: Where you view, search, and upload files.
- **Features**:
  - **Upload Box**: Drag-and-drop or select any file (text, code, logs, PDF, notes).
  - **Search Bar**: Instant search by document title or file name.
  - **Filter by Classification**: Filter by *PUBLIC*, *INTERNAL*, *CONFIDENTIAL*, or *HIGHLY_CONFIDENTIAL*.
  - **Filter by Risk Score**: Slider to quickly show only files with high leak scores (e.g., score > 70%).
  - **Document Card / Table**: Shows file size, who uploaded it, date, classification badge, leak probability percentage, and action button to **Inspect & Share**.

### 5. 🔬 Document Detail & AI Inspector (`/documents/:id`)
- **What it is**: The most powerful screen in the app. It breaks down *why* a document is risky.
- **Key Sections**:
  - **Top Bar**:
    - **Download Encrypted (PDF)**: Downloads the **Secured & Sanitized Document PDF** (`[filename]_SECURED.pdf`). This PDF preserves the readable original document text while **automatically hiding and masking all sensitive data** (Aadhaar, PAN, Passwords, Credit Cards, Bank Accounts, API Keys). It also stamps a **semi-transparent identity watermark** across the pages with the recipient's email and timestamp so the document can be safely and securely shared with anyone.
    - **Download Decrypted**: Downloads the original plaintext file if authorized by the DLP policy. If the file is marked `BLOCK`, unmasked downloads are blocked to prevent data leakage.
  - **Classification Badge & Encryption Status**: Shows if AES-256 encryption at rest is active.
  - **AI Decision Reasoning Box**:
    - Displays the overall summary.
    - Factor-by-factor risk contribution table (e.g., `+35% API Key Detected`, `+25% Aadhaar Found`, `+15% Confidential Policy Keyword`).
    - Exact security policy that triggered (e.g., `Policy HC-900: High Risk & Secret Leak Protection`).
  - **Detected Sensitive Entity Tokens**: Shows chips for every sensitive entity found, masked for privacy (e.g. `AADHAAR: 92****12`, `PAN: AB****1Z`, `API_KEY: sk_demo_••••••••24`).
  - **Dynamic Identity Watermarked Preview**: Displays the text content of the file. If classified as Confidential or Highly Confidential, a semi-transparent watermark containing the viewer's email, IP, and timestamp is stamped all over the document!
  - **Dynamic Secure Sharing Panel**: Allows you to type any user's email to share the file. You can leave it to *Auto Trust Calculation* or manually set *View Only*, *Time-Limited (7 Days)*, or *Download & Edit*.
  - **Active Recipient Permissions List**: Shows everyone who has access to this file and their status.

### 6. 🤝 Shared With Me (`/shared`)
- **What it is**: Displays all documents that other colleagues have shared with your account.
- **Special Feature**:
  - If an external user accesses the document too rapidly, this page displays a **Velocity Anomaly Alert**:
    `"Access velocity anomaly detected (>4 requests in 2 min). Permissions automatically downgraded to VIEW_ONLY."`

### 7. 📜 Audit Logs (`/audit-log`)
- **What it is**: A tamper-evident chronological ledger of every single event in the organization.
- **Logged Events**:
  - `UPLOAD`: When a file is uploaded and scanned.
  - `VIEW`: When someone opens a document to read.
  - `DOWNLOAD`: When someone downloads the decrypted file.
  - `SHARE`: When a document is shared with another employee or partner.
  - `POLICY_TRIGGER`: When an AI policy triggers an automatic action.
  - `ANOMALY_DOWNGRADE`: When suspicious download sprees are detected.
- **Filters**: Filter by Actor, Action type, or search specific dates/IP addresses.

### 8. 📈 Analytics & Threat Intelligence (`/analytics`)
- **What it is**: Visual data charts for security leaders.
- **Key Charts**:
  - **Classification Distribution Pie/Donut Chart**: Ratio of Public vs. Internal vs. Confidential vs. Highly Confidential files.
  - **Detected Entity Frequency Bar Chart**: Counts of Aadhaar, PAN, Passwords, API Keys, Credit Cards, and Emails detected across the company.
  - **Access Velocity & Leak Trends**: Historical graph showing risk evolution over time.

### 9. ⚙️ Security Policy Controls (`/settings`)
- **What it is**: Admin configuration panel for the AI enforcement engine.
- **Features**:
  - Interactive sliders to define Leak Probability thresholds:
    - *Policy Low Risk (0 - 19%)*: **ALLOW**
    - *Policy Confidential (20 - 39%)*: **ENCRYPT** (Applies AES-256)
    - *Policy High Risk (40 - 59%)*: **WATERMARK** (Enforces identity watermark)
    - *Policy Manager Approval (60 - 79%)*: **REQUIRE_APPROVAL**
    - *Policy Secret Leak Protection (80 - 100%)*: **BLOCK** (Blocks downloading entirely)

---

## 4. 🧠 How the AI Detection & Risk Engine Works

When a file is uploaded, the AI Engine runs a 4-step pipeline:

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐     ┌──────────────────────┐
│  Document Text  │ ──> │ Entity Extraction    │ ──> │ Risk Weight Scoring │ ──> │ Policy Enforcement   │
│  Extracted      │     │ (Aadhaar, PAN, Keys) │     │ (0% to 100%)        │     │ (Allow/Encrypt/Block)│
└─────────────────┘     └──────────────────────┘     └─────────────────────┘     └──────────────────────┘
```

### Risk Weights:
- **API Keys (`sk_live_...`, `AKIA...`)**: +35% Risk (Critical)
- **Passwords (`password = "..."`)**: +30% Risk (Critical)
- **Aadhaar Numbers (`12 digits`)**: +25% Risk (High)
- **PAN Cards (`5 letters + 4 digits + 1 letter`)**: +25% Risk (High)
- **Credit Cards (`Visa, Mastercard, Amex`)**: +25% Risk (High)
- **Bank Account / IFSC Numbers**: +20% Risk (Medium)
- **Passports / SSN Numbers**: +20% Risk (Medium)
- **Email & Phone Numbers**: +5% Risk (Low)
- **Policy Keywords** (*"strictly confidential"*, *"trade secret"*, *"internal only"*): +15% Risk bonus
- **Recipient Trust Penalty**: If recipient trust < 60, an additional risk penalty is added!

---

## 5. 🚀 Hands-On Tutorial: Try it Step-by-Step!

Follow this step-by-step walkthrough to test every feature of the website:

### Step 1: Log in as Employee Sarah
1. Open the website: **[http://localhost:3001](http://localhost:3001)**.
2. Click **Sign In** (or go to `http://localhost:3001/login`).
3. Enter:
   - **Email**: `sarah.employee@securedocs.ai`
   - **Password**: `password123`
4. Click **Sign In With Credentials**.
5. On the 2FA screen, notice the cyan banner with the code (e.g. `899002`). Copy and enter the 6 digits, then click **Verify & Enter Workspace**.
6. You are now on Sarah's Dashboard!

---

### Step 2: Upload & Scan Test Documents
You have two folders full of real test documents already prepared in this workspace:
- `sample_test_documents/`
- `employee_test_documents/`

Let's test three different risk levels:

#### Test A: Upload a Normal File (Low Risk / Public)
1. In the sidebar, click **Document Library** (`/documents`).
2. Click **Choose File** in the upload card.
3. Select `sample_test_documents/05_PUBLIC_Press_Release_Series_A.txt`.
4. Click **Upload & Scan Document**.
5. Notice:
   - Leak Score is **0%**!
   - Classification: **PUBLIC**.
   - Recommended Action: **ALLOW**.

#### Test B: Upload an Aadhaar & PAN File (High Risk / Confidential)
1. Click **Choose File** again.
2. Select `sample_test_documents/02_HIGH_RISK_Employee_KYC_Aadhaar_PAN.txt`.
3. Click **Upload & Scan Document**.
4. Click on the uploaded file to view the **Document Detail** page (`/documents/:id`).
5. Notice:
   - Leak Score is around **65% - 75%**!
   - The AI identifies detected entities: `AADHAAR` and `PAN` with masked values.
   - The preview box has a **Dynamic Watermark** overlay stamping Sarah's email and timestamp.
   - The file is automatically marked as **AES-256 Encrypted**.

#### Test C: Upload an AWS & Stripe Secrets File (Extreme Risk / Blocked)
1. Select `sample_test_documents/01_CRITICAL_AWS_And_Stripe_Secrets.env`.
2. Click **Upload & Scan Document**.
3. View the detail page:
   - Leak Score is **100%**!
   - Recommended Action is **BLOCK**.
   - The **Download** button is disabled with high risk protection.

---

### Step 3: Test Dynamic Sharing with an External Client
1. On the detail page of any confidential file (like the KYC document), look at the right sidebar under **Dynamic Secure Sharing**.
2. In the **Recipient User Email** box, type:
   ```
   client.external@partner.com
   ```
3. Leave Permission Override as **Auto Trust Calculation**.
4. Click **Share Document Securely**.
5. Notice that because `client.external@partner.com` is an external contractor with a low trust score (45/100), the system automatically restricts them to **VIEW_ONLY**!

---

### Step 4: Log in as External Client to See the Watermark & Restrictions
1. Click your profile avatar on the top right and click **Sign Out**.
2. Log in as the external client:
   - **Email**: `client.external@partner.com`
   - **Password**: `password123`
   - (Enter 2FA OTP code from the banner).
3. In the sidebar, click **Shared With Me** (`/shared`).
4. You will see the document Sarah shared with you!
5. Notice:
   - The permission is locked to **View Only**.
   - There is no download button for this user.
   - Click **View Watermarked Preview**: The document preview has `client.external@partner.com` boldly watermarked across the text so they cannot screenshot or leak it without being caught!

---

### Step 5: Log in as Admin to View Analytics, Audit Logs & Policies
1. Sign out and log in as the Admin:
   - **Email**: `admin@securedocs.ai`
   - **Password**: `password123`
2. **Audit Logs** (`/audit-log`):
   - You can see every single action you just did: Sarah uploading, Sarah sharing, the external client viewing!
3. **Analytics** (`/analytics`):
   - View the entity distribution (Aadhaar counts, API Keys found) and risk breakdown charts.
4. **Policy Settings** (`/settings`):
   - Check the sliders for the security rules. You can adjust the thresholds for when documents get watermarked or blocked.

---

## 6. 📂 Pre-built Test Files in this Repository

### 🧑‍💻 Employee Share Samples (`employee_sample_shares/`)
Documents created for employees to upload and test sharing with coworkers, managers, or clients:

| File Path | Description | Expected Risk & Result |
| :--- | :--- | :--- |
| `employee_sample_shares/01_Sprint_Release_Notes_Internal.txt` | Sprint 44 release changelog and microservice endpoints | **INTERNAL** (Low Risk) |
| `employee_sample_shares/02_Expense_Reimbursement_Voucher.txt` | Travel reimbursement with employee Bank Account & PAN | **CONFIDENTIAL** (~60% Risk, Watermarked PDF) |
| `employee_sample_shares/03_Frontend_Payment_Form_Component.txt` | React component with test Stripe keys and sandbox card | **HIGH RISK** (Triggers Key & Card detection) |
| `employee_sample_shares/04_Client_Deliverable_Handover.txt` | Project handover memo intended for external clients | **INTERNAL / TIME_LIMITED** |
| `employee_sample_shares/05_Weekly_Engineering_Status_Report.txt` | Regular engineering status update memo | **INTERNAL** (Low Risk) |

### 👔 Manager Share Samples (`manager_sample_shares/`)
Confidential management files for reviewing appraisals, contracts, and security audits:

| File Path | Description | Expected Risk & Result |
| :--- | :--- | :--- |
| `manager_sample_shares/01_Manager_Quarterly_Team_Appraisal_Matrix.txt` | Performance ratings, salaries, and promotion decisions | **CONFIDENTIAL / RESTRICTED** |
| `manager_sample_shares/02_Manager_Enterprise_Vendor_MSA_Contract.txt` | Vendor contract with wire transfer routing & bank numbers | **CONFIDENTIAL** (Bank entity detected) |
| `manager_sample_shares/03_Manager_Security_Incident_Investigation_Report.txt` | P1 incident post-mortem on PII data leakage | **HIGHLY_CONFIDENTIAL** (Leak Score ≥ 80%) |
| `manager_sample_shares/04_Manager_Department_Budget_Forecast_2027.txt` | Department annual budget ($2.85M) and compute allocations | **CONFIDENTIAL** |
| `manager_sample_shares/05_Manager_Strategic_Executive_Roadmap.txt` | High-level M&A acquisition targets and unreleased IP | **HIGHLY_CONFIDENTIAL** |

---

## 7. 🛡️ Trust Index Calculation & Behavior

### What is the Trust Index?
The **Trust Index** is a 0 to 100 integer score associated with each user account (`User.trustLevel` in the database). It represents the identity confidence and clearance standing of a user within the enterprise.

### Baseline Trust Scores:
* **Administrator** (`admin@securedocs.ai`): **100/100** — Full security governance authority.
* **Security Manager** (`manager@securedocs.ai`): **90–95/100** — High trust, authorized to review, approve shares, and adjust DLP policies.
* **Regular Employee** (`sarah.employee@securedocs.ai`): **75–80/100** — Baseline internal employee trust.
* **External Client / Auditor** (`client.external@partner.com`): **45–50/100** — Low trust, untrusted external domain.
* **New User Registration**: Defaults to **75/100** (Standard enterprise employee baseline).

### How Trust Index Influences the System:
1. **AI Document Leak Score Penalty**:
   In `aiEngine.ts`, whenever a document is evaluated or prepared for a recipient:
   $$\text{Penalty} = \max(0, \text{round}((60 - \text{RecipientTrustLevel}) \times 0.5))$$
   If an external contractor has Trust Index = $40$, $(60 - 40) \times 0.5 = +10\%$ is automatically added to the document's leak probability score. Sharing sensitive documents with lower-trust accounts inherently poses higher risk.
2. **Automated Sharing Permissions**:
   In `shares.ts`, when a user shares a document without a manual override:
   * If $\text{RecipientTrustLevel} < 50$ OR $\text{LeakScore} \ge 75$: Permission is locked to **`VIEW_ONLY`** (downloads disabled).
   * If $\text{LeakScore} \ge 50$: Automatically downgraded to **`TIME_LIMITED`** (expires in 7 days).
   * If $\text{RecipientTrustLevel} \ge 50$ and file has low leak score: Full **`DOWNLOAD_EDIT`** is permitted.
3. **Anomaly & Audit Penalties**:
   Suspicious activities (rapid abnormal download velocity, attempting to access restricted files) trigger `ANOMALY_DOWNGRADE` audit events which can decrement a user's trust level.

---

## 8. 📊 Dashboard Breakdown — Everything Explained

When you log into the SecureDocs AI Dashboard (`/dashboard`), you see:

1. **Top Header & Role Scope Banner**:
   - Displays whether you are looking at your **Personal Workspace** (for Employees and Managers) or the **Organization-wide Overview** (for Admins).
   - **Upload & Scan Document Button**: Instant shortcut to upload and scan any file.
2. **Total Scanned Docs**:
   - The total number of documents uploaded and scanned by your account (or across the enterprise for Admin).
   - For a brand new user, this starts at **0** and increases each time you upload a document.
3. **High Risk Files**:
   - Number of documents with an AI Leak Probability Score $\ge 60\%$.
   - These files contain detected PII (Aadhaar, PAN, Passwords, API Keys, Credit Cards) and require automated encryption or watermarking.
4. **Encrypted Repositories**:
   - Percentage of scanned documents secured at rest with AES-256-GCM buffer protection in the upload storage.
5. **Security Events**:
   - Count of auditable security operations associated with your workspace (Uploads, Scans, Shares, Watermarks, Downloads, and Policy Checks).
6. **Risk Score Index (Circular Gauge Meter)**:
   - The composite average leak probability percentage across your scanned files:
     - 🟢 **0–20% (Safe / Low)**: Minimal or no sensitive entities detected.
     - 🔵 **21–40% (Mild)**: Internal non-sensitive operational data.
     - 🟡 **41–60% (Moderate)**: Confidential business information or internal memos.
     - 🔴 **61–100% (High / Critical)**: Secrets, government identifiers, or financial data requiring immediate lockdown.
7. **Top High-Risk Documents Card**:
   - Displays your top monitored documents sorted by risk severity, showing confidentiality chips (`HIGHLY_CONFIDENTIAL`, `CONFIDENTIAL`, `INTERNAL`, `PUBLIC`), entity count, recommended action, and exact risk percentage.
   - If you haven't uploaded documents yet, it displays a friendly **"No documents scanned yet"** card.
8. **Live Security Activity Stream**:
   - Real-time audit trail of actions performed by your account or on your files, providing transparency on who accessed or shared what file and when.
9. **Top Navbar Trust Index Indicator**:
   - Displays your current standing (e.g., `Trust Index: 75/100`) at the top right of every screen.

---

## 9. 🛠️ Tech Stack Reference

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Framer Motion, Recharts.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, SQLite database.
- **Security Engine**: Custom Regex & NLP Pattern Entity Recognizer, AES-256-GCM authenticated cipher, SVG Watermark renderer, Access Velocity rate-checker.

Enjoy exploring and presenting SecureDocs AI!
