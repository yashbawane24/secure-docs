# 🎬 SecureDocs AI — Complete Live Implementation Demo & Presentation Script

> **Purpose**: This script is your step-by-step walkthrough to present and demonstrate the **SecureDocs AI** platform to professors, project evaluators, interviewers, or clients.
> **Total Duration**: ~7 to 10 Minutes
> **Live App URLs**:
> - Frontend: `http://localhost:3001`
> - Backend API: `http://localhost:5005`

---

## 📌 Demo Preparation Checklist (Before You Start)
1. Ensure both backend and frontend servers are running:
   - Backend running on `http://localhost:5005`
   - Frontend running on `http://localhost:3001`
2. Have the following test credentials ready:
   - **Employee**: `sarah.employee@securedocs.ai` | Password: `password123`
   - **Manager**: `manager@securedocs.ai` | Password: `password123`
   - **Admin**: `admin@securedocs.ai` | Password: `password123`
   - **External Client**: `client.external@partner.com` | Password: `password123`
3. Have your sample documents folder open in Finder:
   - `employee_sample_shares/02_Expense_Reimbursement_Voucher.txt`
   - `sample_test_documents/01_CRITICAL_AWS_And_Stripe_Secrets.env`

---

## ⏱️ PHASE 1: Introduction & Problem Statement (1 Minute)

### 🗣️ What to Say:
> *"Good morning/afternoon everyone. Today, I am presenting **SecureDocs AI**, an Adaptive Data Leak Prevention and Zero-Trust Document Security Platform.*
> 
> *In modern enterprises, employees routinely share documents—financial reports, code snippets, reimbursement claims, and client memos—over email, Slack, and cloud drives. Traditional Data Loss Prevention (DLP) systems are rigid: they either block everything and hurt employee productivity, or fail to catch sensitive data like Aadhaar cards, PAN numbers, and API credentials until after a leak has occurred.*
> 
> *SecureDocs AI solves this with **context-aware adaptive security**:*
> 1. *It automatically detects sensitive PII and confidential secrets using an intelligent NLP scanning engine.*
> 2. *It calculates dynamic leak probability scores based on document contents and recipient trust levels.*
> 3. *Instead of simply returning useless raw encrypted text, it produces a **sanitized, watermarked secure PDF** where sensitive data is masked in-place, allowing secure collaboration without exposing private data.*
> 4. *It enforces strict role-based access control with dedicated portals for Employees, Managers, and Administrators.*
> 
> *Let me demonstrate the implementation live."*

---

## ⏱️ PHASE 2: Multi-Portal Login & Strict Role Segregation (1.5 Minutes)

### 🖥️ Action 1: Open the Login Page
- Navigate to `http://localhost:3001/login`

### 🗣️ What to Say:
> *"Here is the enterprise login gateway. Notice that we have structured access into three distinct organizational portals: **Employee**, **Manager**, and **Administrator**.*
> 
> *A major security flaw in many web apps is lack of portal segregation where any user can login through any gateway. In SecureDocs AI, we enforce strict zero-trust role verification on both the frontend and backend."*

### 🖥️ Action 2: Demonstrate Portal Rejection (The Security Check)
1. Click on the **Manager** portal card (the green card).
2. Enter an Employee's credentials:
   - Email: `sarah.employee@securedocs.ai`
   - Password: `password123`
3. Look at the canvas **Security CAPTCHA** (anti-bot verification). Enter the alphanumeric code displayed.
4. Click **Sign In**.

### 🗣️ What to Say:
> *"Notice what happens: The backend immediately rejects the attempt with `HTTP 403 Forbidden` and displays an explicit security alert:*
> 
> *'Access Denied: Your account role is EMPLOYEE. You are NOT authorized to log in through the Manager Portal.'*
> 
> *To provide an intuitive user experience, the system offers an instant **'Switch to Employee Portal'** button that automatically navigates the user to their designated portal while keeping their credentials intact."*

### 🖥️ Action 3: Log In to the Correct Portal
1. Click **Switch to Employee Portal** (or click the amber Employee card).
2. Enter the new CAPTCHA code.
3. Click **Sign In**.
4. You are routed to the dashboard (`/dashboard`).

---

## ⏱️ PHASE 3: The Personal Workspace Dashboard & Trust Index (1.5 Minutes)

### 🖥️ Action: Point out the Dashboard Elements on Screen

### 🗣️ What to Say:
> *"Now we are inside Sarah's personal workspace dashboard. Notice how the metrics are dynamically scoped to her account rather than showing arbitrary global numbers:*
> 
> 1. *At the top right navbar, you can see Sarah's **Trust Index: 80/100**.*
>    - *What is the Trust Index? It is a continuous security standing metric from 0 to 100. Admins start at 100, Managers at 90, Employees at 75–80, and External Contractors at 45. The trust index dynamically penalizes leak scores if a document is shared with an untrusted recipient.*
> 2. *Look at the 4 Key Performance Indicators (KPIs):*
>    - *Total Scanned Docs: Exact number of files indexed for Sarah.*
>    - *High Risk Files: Documents with a leak probability score ≥ 60%.*
>    - *Encrypted Repositories: 100% of sensitive documents are stored with AES-256-GCM buffer encryption at rest.*
>    - *Security Events: Sarah's audit operations recorded in the immutable audit trail.*
> 3. *The **Document Risk Index Gauge** displays the composite average leak score across her files.*
> 4. *Below that, we see the **Top High-Risk Documents** and the **Live Security Activity Stream** tracking every upload, view, and share."*

---

## ⏱️ PHASE 4: Document Upload & AI NLP Leak Detection (2 Minutes)

### 🖥️ Action 1: Upload a Sensitive Document
1. Click **Upload & Scan Document** (or go to `/documents` in the sidebar).
2. In the upload area, click or drag-and-drop the file:
   `employee_sample_shares/02_Expense_Reimbursement_Voucher.txt`
3. Click **Analyze & Secure Document**.

### 🗣️ What to Say:
> *"Let's upload an employee expense reimbursement claim. In this document, Sarah has included her travel expenses, but also sensitive details: her **Bank Account Number**, **IFSC Code**, **PAN Card Number**, and **Aadhaar UID**.*
> 
> *Watch how fast the AI pipeline processes the document."*

### 🖥️ Action 2: Inspect the AI Decision Breakdown
- The app redirects to `/documents/:id` (Document Detail & AI Inspector).

### 🗣️ What to Say:
> *"Look at the analysis generated in milliseconds:*
> 1. ***Classification**: Automatically classified as **CONFIDENTIAL**.*
> 2. ***Leak Probability Score**: Calculated at **60% to 75%**.*
> 3. ***Detected Sensitive Tokens**: Notice the detected entity chips:*
>    - *`AADHAAR`: Masked as `98****65`*
>    - *`PAN`: Masked as `BD****2K`*
>    - *`BANK_ACCOUNT`: Masked as `50100••••••••78`*
> 4. ***AI Decision Reasoning**: The system details the exact risk contribution:*
>    - *`+25% Aadhaar Found`*
>    - *`+20% Bank Account Found`*
>    - *`+15% PAN Card Found`*
>    - *Triggered Policy: `Policy CONF-500: Confidential PII Protection`.*
> 5. ***Dynamic Identity Watermarked Preview**: Notice how the preview on the screen has Sarah's email and timestamp watermarked across the document to prevent unauthorized screenshots."*

---

## ⏱️ PHASE 5: The Core Innovation — Secured Watermarked PDF Download (2 Minutes)

### 🖥️ Action 1: Download the Secured Document
1. In the top action bar, click **Download Encrypted (PDF)**.
2. The browser immediately downloads `[filename]_SECURED.pdf`.
3. Open the downloaded PDF in your browser or previewer.

### 🗣️ What to Say:
> *"This is the central innovation of SecureDocs AI. Earlier, traditional encryption systems would hand the user raw hex bytes or encrypted cipher text that no human could read or use.*
> 
> *Notice what our engine produced:*
> 1. *It generated a clean, readable **Secured Enterprise PDF**.*
> 2. *All confidential entities—the Aadhaar number, PAN card, and Bank Account—are **automatically redacted and masked in-place**.*
> 3. *Across each page, an **identity watermark** is permanently embedded containing the recipient's identity, organization, and timestamp.*
> 
> *This means the employee can safely send this document to third parties or finance without leaking sensitive personal credentials. If someone attempts to leak this PDF, the watermark provides undeniable cryptographic provenance."*

### 🖥️ Action 2: Try Downloading the Unmasked Original
1. Return to the browser.
2. If the file was classified as High Risk / Block, point out:
> *"Notice that the **Download Decrypted (Original)** button is governed by DLP policy. When a document's leak score exceeds the security threshold, unmasked raw downloads are restricted to authorized managers."*

---

## ⏱️ PHASE 6: Zero-Trust Dynamic Sharing (1 Minute)

### 🖥️ Action: Share with an External Client
1. On the document detail page, look at the right sidebar under **Dynamic Secure Sharing**.
2. In **Recipient User Email**, type:
   `client.external@partner.com`
3. Leave permission as **Auto Trust Calculation**.
4. Click **Share Document Securely**.

### 🗣️ What to Say:
> *"Now watch how adaptive zero-trust sharing works:*
> *Because `client.external@partner.com` belongs to an external contractor with a low Trust Index (45/100), the system automatically restricts the share permission to **VIEW_ONLY** or **TIME_LIMITED (7 Days)**.*
> *The employee doesn't have to guess the right security settings—the platform automatically enforces least-privilege access based on recipient trustworthiness."*

---

## ⏱️ PHASE 7: Administrative Governance & Audit Trail (1 Minute)

### 🖥️ Action 1: Sign Out and Sign In as Admin
1. Click Sarah's avatar on the top right -> Click **Sign Out**.
2. On `/login`, click the **Admin** portal card.
3. Credentials:
   - Email: `admin@securedocs.ai`
   - Password: `password123`
4. Enter CAPTCHA -> Click **Sign In**.

### 🖥️ Action 2: Show Enterprise Audit Logs & Analytics
1. Look at the Dashboard:
   > *"As an Administrator, the dashboard automatically transitions to the **Organization Security & Data Leakage Overview**, aggregating data across all enterprise teams."*
2. In the sidebar, click **Audit Logs** (`/audit-log`):
   > *"Every single action we just took—the failed login attempt, the document upload, the entity detection, the secure download, and the external share—is immutably recorded in the security audit trail with actor name, IP, and timestamp."*
3. In the sidebar, click **Security Policies** (`/settings`):
   > *"Admins can customize leak probability thresholds, configure which file types require automatic watermarking, and adjust the trust score sensitivity."*

---

## ⏱️ PHASE 8: Conclusion & Summary (30 Seconds)

### 🗣️ What to Say:
> *"To summarize, SecureDocs AI provides:*
> 1. ***Active Prevention***: *AI-driven detection of PII, secrets, and financial tokens before data leaves the enterprise.*
> 2. ***Usable Security***: *Redacted, watermarked PDFs that maintain business workflows without exposing raw confidential data.*
> 3. ***Zero-Trust Governance***: *Continuous Trust Index evaluation and role-segregated portals for Employees, Managers, and Administrators.*
> 
> *Thank you, and I am now ready for questions."*

---

## 🎓 Viva / Evaluator Q&A Cheat Sheet

| Likely Question | Impressive Technical Answer |
| :--- | :--- |
| **Q1: How does the AI detect sensitive entities?** | *"We use a hybrid NLP and Regex token analyzer. It runs pattern recognition with Luhn algorithm validation for credit cards, Verhoeff checksum validation for Aadhaar UIDs, standard Income Tax regex for PAN cards, and heuristic entropy checks for API keys and JWTs."* |
| **Q2: What encryption standard is used?** | *"We use AES-256-GCM (Galois/Counter Mode). GCM provides both confidentiality and built-in cryptographic authentication via 128-bit authentication tags, preventing ciphertext tampering."* |
| **Q3: How does the Trust Index work?** | *"Each user has a `trustLevel` from 0 to 100. When sharing a document, if the recipient's trust is under 60, a formula `(60 - Trust) * 0.5` adds a penalty to the document's leak score, automatically forcing restricted permissions like `VIEW_ONLY`."* |
| **Q4: How is data isolated between users?** | *"Our backend uses scoped database queries based on the verified JWT claims (`req.user.id`). Regular employees can only query their own uploaded documents and audit logs, while administrators have organization-wide oversight."* |
| **Q5: Why PDF export instead of raw encrypted download?** | *"Raw encrypted `.enc` files are unreadable by third parties and break business collaboration. Our PDF pipeline generates a sanitized PDF where sensitive data is masked in-place and dynamic identity watermarks are rendered across every page."* |
