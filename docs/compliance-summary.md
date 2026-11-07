# Compliance Summary — Split & Settle

## 1. Licensing Analysis

### Regulatory Landscape

Payment services in Nigeria are governed primarily by the **Central Bank of Nigeria (CBN)** under the **Payment System Management Act (2003)** and the **CBN Guidelines for Licensing and Regulation of Payment Service Banks (2020)**. The CBN classifies payment service providers into distinct licence categories: Payment Solution Service Providers (PSSPs), Payment Terminal Service Providers (PTSPs), Mobile Money Operators (MMOs), and Super-Agents, among others.

### What Split & Settle Is (and Is Not)

Split & Settle is a **payment facilitation layer** — it orchestrates group expense splitting and triggers instant settlement. Critically, the product doesn't:

- Hold customer funds or maintain float balances
- Issue wallets or store value on behalf of users
- Perform direct debit or credit to bank accounts independently
- Operate as a lending or insurance platform

All payment processing — charging cards, disbursing funds, managing escrow — is handled by **Paystack**, which holds a CBN-issued Payment Solution Service Provider (PSSP) licence and is regulated as a payment processor under Nigerian law.

### MVP Licensing Position

The MVP operates as a **merchant on Paystack's platform**. Under the CBN's framework, merchants that rely entirely on a licensed payment processor for fund movement don't require a separate CBN licence. This is analogous to how an e-commerce store uses Paystack without needing its own PSSP licence. Our legal basis:

- Paystack's PSSP licence covers payment initiation, processing, and settlement on our behalf.
- We don't touch funds at any point in the transaction lifecycle. Paystack handles the full settlement flow from payer to payee.
- Our Terms of Service clearly define our role as a technology platform, not a financial institution.

### Licences Deferred (and Why)

| Licence | Reason for Deferral | Trigger for Revisiting |
|---|---|---|
| **PSSP (Switching & Processing)** | MVP relies on Paystack; no independent payment processing | If we build proprietary payment rails or process transactions without a licensed intermediary |
| **MMO Licence** | No wallet functionality in MVP; users pay directly from linked bank accounts/cards | If we introduce in-app wallet balances or stored value |
| **Microfinance Bank Licence** | No lending, credit, or savings features | If we add "split now, pay later" or group savings pots |
| **Insurance Licence (NAICOM)** | No coverage or protection features | If we offer transaction insurance or group expense guarantees |

This is a deliberate product scoping decision, not an oversight. Each deferred licence maps to a feature that is intentionally excluded from the MVP roadmap to maintain regulatory clarity.

---

## 2. Data Collection, Storage, and Protection

### What We Collect and Why

| Data Point | Purpose | Legal Basis |
|---|---|---|
| **Full name** | Account creation, display in group expense contexts | User consent (NDPA Art. 25); necessary for contract performance |
| **Phone number** | Account verification, in-app notifications, group invitations | User consent; legitimate interest for service delivery |
| **Email address** | Account recovery, transaction receipts, regulatory communications | User consent; necessary for contract performance |
| **BVN (Bank Verification Number)** | KYC/identity verification | CBN KYC Regulations (2013, amended 2022); mandatory — not optional |
| **Transaction data** (amounts, timestamps, references, group context) | Reconciliation, dispute resolution, regulatory audit trail | CBN Regulatory Requirement; NFIU reporting obligations |
| **Device and session data** (IP, device fingerprint, session tokens) | Fraud prevention, session management, anomaly detection | Legitimate interest under NDPA Art. 26 |

### How It Is Protected

**Nigeria Data Protection Act (NDPA), 2023** — enacted to replace the NDPR 2019 — is the primary data protection legislation. Split & Settle's compliance posture:

**Encryption:**
- BVN data is encrypted at rest using AES-256 and in transit using TLS 1.2+. BVN is never stored in plaintext, logged, or exposed in API responses.
- All personal data in transit is protected via HTTPS (TLS 1.2 minimum).

**Purpose Limitation (NDPA Art. 24):**
- Each data point is collected for a stated purpose (see table above). Data isn't repurposed without fresh consent.

**Data Retention:**
- Transaction records: retained for **6 years** minimum, per CBN's Guidelines on Electronic Banking (2003) and the Money Laundering (Prevention and Prohibition) Act 2022 (Section 10).
- Personal data (name, email, phone): deletable on user request, subject to the 6-year regulatory retention requirement for associated transaction records. Where deletion conflicts with retention obligations, we anonymise the personal data while preserving the transaction audit trail.

**Data Processing Agreements:**
- A Data Processing Agreement (DPA) is in place with Paystack as our data processor, per NDPA Art. 30. This DPA specifies Paystack's obligations around data handling, breach notification, and sub-processor management.

**MVP-Specific Note:**
In the current MVP, user data (excluding payment credentials, which Paystack handles) is stored client-side in localStorage. No personal data is transmitted to or stored on Split & Settle servers. This is a temporary architecture decision for the MVP phase. Before production scale, we will migrate to server-side storage with proper database encryption, access controls, and audit logging — a requirement we have already scoped.

**FCCPC Consumer Protection Framework:**
Under the Federal Competition and Consumer Protection Commission (FCCPC) Guidelines on Data Protection in Consumer Transactions:
- Our privacy policy is written in plain language and presented before account creation — not buried in terms.
- Users can access, correct, and request deletion of their personal data through in-app settings.
- We don't share personal data with third parties for marketing purposes.

**NITDA Compliance:**
As a data controller, Split & Settle will file an annual Data Protection Compliance audit with the Nigeria Data Protection Commission (NDPC, formerly under NITDA) once we process data at scale, per NDPA requirements. For the MVP (client-side only, limited user base), this obligation has not yet triggered, but we have budgeted for it in our first-year operational plan.

---

## 3. AML/CFT Compliance

Split & Settle's AML/CFT framework is designed around the **Money Laundering (Prevention and Prohibition) Act 2022**, the **CBN AML/CFT Regulations (2013, revised 2022)**, and reporting obligations to the **Nigerian Financial Intelligence Unit (NFIU)**.

### KYC Tiering

We implement tiered KYC aligned with CBN's three-tier KYC framework:

| Tier | Verification | Daily Transaction Limit | Use Case |
|---|---|---|---|
| **Tier 1** | BVN only | N50,000 | Casual users splitting small group expenses (meals, rides) |
| **Tier 2** | BVN + government-issued ID (NIN, voter's card, international passport) | N200,000 | Regular users splitting rent, subscriptions, event costs |
| **Tier 3** | Full KYC (BVN + ID + utility bill/address verification) | Unlimited | Power users, group treasurers, high-value settlements |

This tiering isn't just regulatory checkbox compliance — it directly shapes the product experience. A user trying to split a N75,000 expense at Tier 1 will be prompted to upgrade, with a clear explanation of why and a streamlined verification flow.

### Transaction Monitoring and Flagging

- **Automatic flagging:** Any single transaction exceeding **N500,000** triggers enhanced due diligence. The transaction is held pending review before settlement proceeds.
- **Structuring detection:** Our monitoring logic detects patterns consistent with structuring — for example, a user initiating multiple group expenses just below N500,000 within a 24-hour window. This is flagged for manual review.
- **Velocity checks:** Unusual spikes in transaction frequency or volume relative to a user's historical pattern trigger alerts.
- **SAR filing:** When a transaction or pattern is confirmed as suspicious after review, a Suspicious Activity Report (SAR) is filed with the **NFIU** within the mandated reporting window. SARs are filed confidentially — the affected user isn't notified that a report has been made, per Section 6 of the Money Laundering Act.
- **Record-keeping:** All flagged transactions, review decisions, and SAR filings are logged and retained for a minimum of **5 years** after the business relationship ends, per CBN AML/CFT Regulations.

### Why This Matters for a Group Expense Product

Group expense splitting introduces a specific AML risk: **layering through fragmentation.** A bad actor could use group splits to move money across multiple accounts in small, individually unremarkable amounts. Our structuring detection and velocity checks are designed specifically to address this — they are not generic AML rules bolted on, but controls tailored to our product's mechanics.

---

## 4. 48-Hour Regulatory Response Plan

This plan assumes the CBN, NFIU, FCCPC, or NDPC issues a directive that directly affects Split & Settle's product category (e.g., new requirements for payment facilitators, restrictions on peer-to-peer settlements, or revised data handling mandates).

### Hours 0-6: Incident Assessment

- **Regulatory watch triggers alert.** We monitor the CBN website, NFIU circulars, and NDPC publications. Our external legal counsel (a fintech-specialist firm) is contracted to flag relevant directives within 2 hours of publication.
- **Legal team reviews the directive's text** to determine: (a) Does it apply to us directly, or only to licensed payment processors like Paystack? (b) Is compliance required immediately, or is there a grace period? (c) Are there ambiguities that require clarification from the regulator?
- **Brief the CEO and CTO.** A one-page impact memo is prepared covering: what changed, who it affects, and our preliminary compliance posture.
- **Contact Paystack's compliance team.** As our payment processor, Paystack may be issuing its own guidance to merchants. We align our response with theirs.

### Hours 6-12: Impact Analysis

- **Feature-by-feature impact mapping.** Product and engineering leads walk through every user-facing flow and backend process to identify what the directive requires us to change. This is documented in a shared matrix: Feature | Current State | Required State | Effort | Risk.
- **User impact assessment.** How many active users are affected? Will any ongoing group settlements be disrupted? Do we need to pause new sign-ups?
- **Identify quick wins vs. heavy lifts.** Some changes (e.g., updating a disclosure notice) can ship in hours. Others (e.g., adding a new verification step) require days or weeks. We categorise accordingly.

### Hours 12-24: Response Execution

- **If the directive requires immediate compliance:**
  - Disable or modify affected features via feature flags (our architecture supports this without a full app redeployment).
  - Push an emergency update with a clear in-app notice explaining what changed and why.
  - If transactions must be paused, execute a controlled wind-down: allow pending settlements to complete, but block new transaction initiation.
- **File formal acknowledgment** with the issuing regulatory body, confirming receipt and stating our compliance timeline.
- **Engage external legal counsel** to prepare a formal written response if the directive requires one, or if we intend to seek clarification or a compliance extension.
- **Draft user communications.** In-app notice (mandatory), email to all active users (mandatory), and a blog post or FAQ update (if the change is significant enough to warrant public explanation).

### Hours 24-48: Communication and Adaptation

- **Publish user communications** across all channels.
- **Begin product modifications** for any changes that could not be shipped immediately. Assign dedicated engineering resources with a clear sprint plan.
- **Set up ongoing monitoring** as required by the directive (e.g., new reporting cadences, additional data capture).
- **Schedule a follow-up with the regulatory body** (if permitted and appropriate) to confirm our compliance approach and timeline.
- **Internal post-incident review.** Document what happened, how we responded, and what we would do differently. Update the response playbook.

### Why We Have This Plan Pre-Launch

Regulatory directives in Nigeria's fintech space are not hypothetical. The CBN's January 2024 directive on crypto-related accounts, the revised BVN/NIN linkage requirements, and the FCCPC's enforcement actions against fintech companies all demonstrate that regulatory action can be sudden and consequential. Having a response plan before we need one isn't over-engineering — it is a baseline expectation for any product handling financial transactions in Nigeria.

---

## Summary of Regulatory Touchpoints

| Regulatory Body | Relevance to Split & Settle | Key Obligation |
|---|---|---|
| **CBN** | Payment services oversight, KYC/AML requirements, licensing | Operate within Paystack's PSSP licence; comply with KYC tiering and AML thresholds |
| **NFIU** | Financial intelligence and SAR reporting | File SARs for suspicious transactions; respond to information requests |
| **NDPC** (formerly NITDA for data protection) | Data protection enforcement under NDPA | Lawful data processing, purpose limitation, breach notification within 72 hours |
| **FCCPC** | Consumer protection in financial services | Transparent pricing, clear terms, accessible complaint resolution |

---

*This compliance summary reflects Split & Settle's regulatory posture as of the MVP stage. It will be reviewed and updated quarterly, or immediately upon any relevant regulatory development.*
