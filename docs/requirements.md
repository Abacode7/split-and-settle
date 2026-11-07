# Split & Settle -- Requirements Document

**Product:** Split & Settle -- Group expense splitting with instant settlement for Nigerian friend groups.

**Version:** 1.0
**Last Updated:** 2026-11-07
**Author:** Product Manager (Capstone Defense)
**Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS

---

## 1. Overview

Split & Settle allows a group organizer to create expense splits, invite participants, collect payments, and view a reconciliation summary once all shares are settled. The application targets Nigerian users in social contexts -- dinners, trips, shared subscriptions -- where one person fronts the cost and needs a lightweight way to collect from others.

> **[PM Note]:** AI initially framed this product as a "bill-splitting utility," which undersells the settlement layer. Split & Settle is not just a calculator -- it records actual payment transactions and tracks settlement status. Reframed the overview to emphasize the transactional nature, which is what makes it a fintech product rather than a lifestyle app.

---

## 2. Definitions

| Term | Definition |
|------|-----------|
| **Organizer** | The user who creates a split. Typically the person who paid for the full expense upfront. |
| **Participant** | A user added to a split who owes a share of the expense. |
| **Split** | A single expense divided among two or more people. |
| **Settlement** | The state reached when all participants have paid their respective shares. |
| **BVN** | Bank Verification Number -- an 11-digit identity number issued by NIBSS to every bank account holder in Nigeria. |
| **AML** | Anti-Money Laundering -- regulatory requirements that flag suspicious transaction patterns. |
| **NIBSS** | Nigeria Inter-Bank Settlement System -- the central infrastructure for payments and identity verification in Nigeria. |

---

## 3. User Stories

---

### US-1: User Registration and KYC/BVN Verification

**As a** new user, **I want to** register with my phone number and verify my identity via BVN, **so that** I can access the app in compliance with Nigerian financial regulations.

> **[PM Note]:** AI initially suggested email-based registration with optional phone number. In Nigeria, phone numbers are the primary digital identity -- most users have a phone number before they have an email address, and mobile money infrastructure is phone-first. Changed to phone-number-first registration with optional email. This also aligns with how Nigerian fintech apps like OPay, PalmPay, and Kuda onboard users.

**Acceptance Criteria:**

- [ ] User can enter a Nigerian phone number (format: +234XXXXXXXXXX or 0XXXXXXXXXX) to begin registration.
- [ ] User is prompted to enter their 11-digit BVN after phone number entry.
- [ ] System validates that the BVN is exactly 11 numeric digits before submission.
- [ ] A valid BVN (any 11-digit number not matching a known-failure pattern) returns a successful verification and the user proceeds to the dashboard.
- [ ] BVN `00000000000` returns a "BVN not found" error -- the user is shown a distinct message: "We could not find a BVN matching this number. Please check and try again."
- [ ] BVN `11111111111` returns a "BVN flagged" error -- the user is shown a distinct message: "Your BVN has been flagged for review. Please contact your bank for more information."
- [ ] User cannot access any app functionality (creating splits, viewing splits, making payments) until BVN verification is successful.
- [ ] On successful verification, the user's profile is created with their name, phone number, and verified status.

> **[PM Note]:** AI generated a single generic error state for BVN verification failure ("BVN verification failed, please try again"). This is inadequate. NIBSS returns distinct failure codes -- "not found" and "flagged" are fundamentally different situations with different user actions required. A "not found" user likely mistyped their BVN; a "flagged" user has a regulatory issue that no amount of retrying will fix. Separated these into two distinct error states with appropriate copy and next-step guidance.

**Edge Cases:**

- User enters a BVN with fewer or more than 11 digits -- inline validation prevents submission.
- User enters non-numeric characters in BVN field -- input is restricted to digits only.
- User closes the app mid-verification -- on return, they are redirected to the verification screen and must complete it before proceeding.

---

### US-2: Create a Split

**As an** organizer, **I want to** create a new split by entering the total amount, selecting a split method, and adding participants, **so that** I can track who owes what.

**Acceptance Criteria:**

- [ ] Organizer can enter a split title (e.g., "Friday dinner at Circa") and total amount in Naira.
- [ ] Organizer can select a split method: Equal, Custom amounts, or Percentage-based.
- [ ] **Equal split:** The total is divided evenly among all participants (including the organizer if they choose to include themselves). Amounts are rounded to the nearest whole Naira. Any rounding remainder (e.g., N1 or N2) is absorbed by the organizer's share.
- [ ] **Custom amounts:** Organizer manually enters each participant's share. The sum of all shares must equal the total amount; the system validates this before the split can be created.
- [ ] **Percentage-based:** Organizer assigns a percentage to each participant. Percentages must total 100%. Amounts are calculated as whole Naira values (rounded down), with any remainder added to the last participant's share.
- [ ] Organizer can add participants by selecting from demo profiles (Tunde, Amaka, Chidi).
- [ ] A split must have at least two participants (including the organizer).
- [ ] On creation, the split status is set to "active" and each participant's payment status is set to "pending."
- [ ] The organizer's own share (if they are a participant) is automatically marked as "paid" since they fronted the expense.

> **[PM Note]:** The original AI-generated acceptance criteria did not address what happens when the organizer is also a participant in the split. This is the most common real-world scenario -- the organizer paid for dinner and is splitting the bill including their own portion. Added the criterion that the organizer's share is automatically marked as "paid" since they already fronted the money. Without this, the organizer would have to "pay themselves," which makes no sense.

> **[PM Note]:** AI suggested that percentage-based splitting should allow decimal Naira values (e.g., N3,333.33). Corrected this: round to whole Naira amounts. Nigerians do not transact in kobo for social payments -- no one sends N3,333.33 to a friend. The rounding remainder is assigned to the last participant or absorbed by the organizer, keeping amounts clean and transferable.

**Edge Cases:**

- Organizer enters a total amount of N0 or a negative number -- validation prevents split creation.
- In custom split mode, the sum of individual amounts does not equal the total -- the system shows the discrepancy and blocks creation.
- In percentage mode, percentages do not total 100% -- the system shows the difference and blocks creation.
- Organizer tries to create a split with only themselves -- validation requires at least one other participant.

---

### US-3: Pay Your Share

**As a** participant, **I want to** view my share of a split and make a payment, **so that** I can settle my portion of the expense.

**Acceptance Criteria:**

- [ ] Participant sees a list of splits they have been added to, with their share amount and payment status for each.
- [ ] For each unpaid split, participant can tap "Pay Now" to initiate a simulated payment.
- [ ] On successful payment, the participant's status for that split changes from "pending" to "paid."
- [ ] The payment transaction is recorded with: participant ID, split ID, amount, timestamp, and transaction reference.
- [ ] Participant receives a confirmation screen showing the payment details and a "Return to Splits" action.
- [ ] The organizer is notified (in-app) when a participant completes payment.

**Edge Cases:**

- Participant tries to pay a split they have already paid -- the "Pay Now" button is replaced with a "Paid" badge and is not actionable.
- Participant views a split that has already been fully settled -- they see a "Settled" status with no payment action available.

---

### US-4: Settlement and Reconciliation

**As an** organizer, **I want to** see a reconciliation view of my split showing total expected vs. total received, **so that** I know when all participants have paid and can verify the amounts.

**Acceptance Criteria:**

- [ ] Organizer can view a reconciliation summary for each split they created.
- [ ] The reconciliation view displays: total expected amount, total received amount, outstanding amount, and a per-participant breakdown (name, amount owed, amount paid, status).
- [ ] When all participants have paid their shares, the split status automatically changes from "active" to "settled."
- [ ] The organizer sees a clear visual indicator when a split reaches "settled" status.
- [ ] The reconciliation view updates in real-time (or on refresh) as payments come in.
- [ ] Organizer can send a "friendly reminder" to participants who have not yet paid.

> **[PM Note]:** AI initially labelled the reminder feature "Send Payment Demand" in its suggested copy. This is tone-deaf for the Nigerian social context. Splitting expenses among friends is already a socially delicate situation -- nobody wants to feel like a debt collector among their inner circle. Changed the copy to "Send Friendly Reminder." The feature needs to feel light and non-confrontational, not like a legal notice. Small copy decisions like this are the difference between a product people actually use and one they avoid out of embarrassment.

**Edge Cases:**

- Organizer views reconciliation for a split where no one has paid yet -- total received is N0, all participants show "pending."
- A split has partial payments (some paid, some pending) -- the outstanding amount is clearly shown and the status remains "active."

---

### US-5: Payment Failure and Dispute Resolution

**As a** participant, **I want to** be able to retry a failed payment or raise a dispute, **so that** I am not stuck when a payment does not go through.

**Acceptance Criteria:**

- [ ] When a payment fails (simulated: insufficient funds scenario), the participant sees a clear error message: "Payment failed -- insufficient funds. Please try again or use a different funding source."
- [ ] The participant's payment status remains "pending" after a failure -- it does not change to "failed" as a terminal state.
- [ ] A "Retry Payment" button is displayed after a failure, allowing the participant to attempt payment again.
- [ ] If the participant believes the failure is incorrect, they can tap "Raise Dispute" to flag the transaction.
- [ ] When a dispute is raised: the split status changes to "disputed," the organizer is notified in-app, and the disputed transaction is marked for review.
- [ ] The dispute record includes: participant ID, split ID, amount, reason (free-text entry), and timestamp.
- [ ] The organizer can view disputes on their reconciliation screen with the participant's stated reason.

**Edge Cases:**

- Participant raises a dispute on a split they have already successfully paid -- the system prevents this and shows "This share has already been settled."
- Multiple participants dispute the same split -- each dispute is recorded independently and the split remains in "disputed" status until all disputes are resolved.
- Organizer tries to mark a disputed split as settled -- the system blocks this until all disputes are resolved.

---

### US-6: AML-Flagged Transaction

**As a** user, **I want to** be informed if my transaction is held for anti-money laundering review, **so that** I understand why my payment is not processing immediately and what to expect next.

**Acceptance Criteria:**

- [ ] Any single participant payment exceeding N500,000 triggers an AML review flag.
- [ ] When a transaction is flagged, the payment is recorded with status "held_for_review" rather than "paid."
- [ ] The participant sees a notification: "This transaction has been flagged for review due to its amount. You will be notified within 24 hours."
- [ ] The split does not move to "settled" status while any transaction is in "held_for_review" state.
- [ ] The organizer's reconciliation view shows the participant's status as "Under Review" with a distinct visual treatment (not "pending" and not "paid").
- [ ] After the 24-hour review period (simulated in demo), the transaction is either approved (status changes to "paid") or rejected (status changes to "pending" with a notification to retry with a lower amount or contact support).
- [ ] The AML threshold and review outcome are logged for audit purposes.

> **[PM Note]:** AI initially set the AML threshold at N1,000,000, which is a common international assumption. Corrected to N500,000 based on the product brief and alignment with CBN (Central Bank of Nigeria) suspicious transaction reporting thresholds for individual transfers. The threshold may differ by institution, but N500,000 is the appropriate level for this product's context and demo.

**Edge Cases:**

- A split total is N600,000 divided equally among 3 people (N200,000 each) -- no individual payment exceeds N500,000, so no AML flag is triggered. The flag applies to the individual payment amount, not the split total.
- A participant pays N500,001 -- this triggers the AML flag. The threshold is strictly "exceeds N500,000," not "equals."
- An organizer creates a split where one participant's custom share exceeds N500,000 -- the AML flag is triggered only at the point of payment, not at split creation. The organizer is not warned in advance (to avoid tipping off potential bad actors, consistent with AML best practices).

---

### US-7: Profile Switching for Demo

**As a** demo reviewer, **I want to** switch between predefined user profiles, **so that** I can experience the app from different perspectives without creating multiple accounts.

**Acceptance Criteria:**

- [ ] A profile switcher is accessible from the app header or settings screen at all times during the demo.
- [ ] Three demo profiles are available: Tunde (organizer role), Amaka (participant role), and Chidi (edge-case scenarios).
- [ ] Switching profiles immediately updates the app state to reflect that user's view -- their splits, payment statuses, and notifications.
- [ ] Profile switching does not require re-authentication or BVN verification (profiles are pre-verified for demo purposes).
- [ ] A "Reset Demo Data" button is available that restores all splits, payments, and statuses to their initial demo state.
- [ ] After reset, all splits are removed, all payment records are cleared, and all profiles return to their default state.

**Edge Cases:**

- User switches profile while in the middle of creating a split -- the in-progress split is discarded and the user is taken to the new profile's dashboard.
- User resets demo data while a split is in "disputed" or "held_for_review" status -- the reset clears all states regardless.

---

## 4. Compliance Gate: BVN Verification

### 4.1 Flow

1. User opens the app for the first time.
2. User enters their phone number.
3. User is prompted to enter their 11-digit BVN.
4. System validates the BVN format (11 digits, numeric only).
5. System sends the BVN to the verification service (simulated).
6. Verification returns one of three outcomes:
   - **Verified:** User proceeds to the dashboard.
   - **Not Found (BVN: 00000000000):** User is shown an error with guidance to re-check.
   - **Flagged (BVN: 11111111111):** User is shown an error with guidance to contact their bank.
7. Users who do not pass verification cannot access any transactional feature.

### 4.2 Regulatory Context

Nigerian fintech applications are required to perform Know Your Customer (KYC) checks before enabling financial transactions. BVN verification through NIBSS is the standard Tier 1 KYC method. This gate ensures Split & Settle meets CBN guidelines for electronic payment platforms.

---

## 5. Settlement and Reconciliation Flow

### 5.1 Flow

1. Organizer creates a split (status: "active").
2. Each participant's share is recorded with status "pending."
3. If the organizer is a participant, their share is auto-marked "paid."
4. As each participant pays, a transaction record is created and their status moves to "paid."
5. After each payment, the system checks: have all participants paid?
   - **No:** Split remains "active." Reconciliation view shows outstanding balance.
   - **Yes:** Split status changes to "settled." Organizer is notified.
6. Organizer can view the reconciliation summary at any time:
   - Total expected: sum of all shares.
   - Total received: sum of all "paid" transactions.
   - Outstanding: Total expected minus Total received.
   - Per-participant breakdown with status indicators.

### 5.2 States

| Split Status | Condition |
|-------------|-----------|
| **Active** | Created, at least one participant has not paid. |
| **Settled** | All participants have paid their shares. |
| **Disputed** | At least one participant has raised a dispute. |

| Participant Payment Status | Condition |
|---------------------------|-----------|
| **Pending** | Share assigned, not yet paid. |
| **Paid** | Payment received and recorded. |
| **Under Review** | Payment held for AML review. |

---

## 6. Failure and Dispute Scenario

### 6.1 Payment Failure Flow

1. Participant initiates payment.
2. Payment fails (simulated: insufficient funds).
3. System displays error message with clear explanation.
4. Participant's status remains "pending" (not a terminal "failed" state).
5. Participant can retry payment or raise a dispute.

### 6.2 Dispute Flow

1. Participant taps "Raise Dispute" on a failed or questionable transaction.
2. Participant enters a reason for the dispute (free text).
3. Dispute is recorded in the system.
4. Split status changes to "disputed."
5. Organizer is notified and can view dispute details in the reconciliation view.
6. Split cannot be marked as "settled" until all disputes are resolved.

### 6.3 AML Hold Flow

1. Participant initiates a payment exceeding N500,000.
2. Transaction is flagged and recorded with status "held_for_review."
3. Participant is informed of the hold and the 24-hour review window.
4. After review (simulated), the transaction is approved or rejected.
5. If approved, status changes to "paid" and normal settlement logic applies.
6. If rejected, status reverts to "pending" and the participant is notified with next steps.

---

## 7. Split Methods -- Detailed Rules

| Method | Rule | Rounding |
|--------|------|----------|
| **Equal** | Total / number of participants. | Round to nearest whole Naira. Remainder absorbed by organizer. |
| **Custom** | Organizer enters each share manually. | No rounding -- amounts must be whole Naira and sum to total. |
| **Percentage** | Organizer assigns percentage per participant. Percentages must total 100%. | Calculate each share, round down to whole Naira. Remainder added to last participant. |

---

## 8. Demo Profiles

| Profile | Role | Purpose |
|---------|------|---------|
| **Tunde** | Organizer | Creates and manages splits. Views reconciliation. Sends reminders. |
| **Amaka** | Participant | Receives split invitations. Makes payments. Views payment history. |
| **Chidi** | Edge Cases | Triggers payment failures, AML flags, and disputes. Used to demonstrate error handling and compliance flows. |

---

## 9. Non-Functional Requirements

- **Data Persistence:** Demo data is stored in browser local storage or in-memory state. No backend database is required for the demo.
- **Responsiveness:** The application must be usable on mobile screen sizes (375px width and above), reflecting how Nigerian users primarily access fintech apps.
- **Currency Format:** All amounts are displayed in Nigerian Naira (N) with comma-separated thousands (e.g., N500,000). No decimal places for social payment amounts.
- **Performance:** Split creation and payment simulation should complete within 1 second. BVN verification may simulate a 2-3 second delay to mimic real API latency.

---

## 10. Out of Scope (v1.0)

- Real payment gateway integration (Paystack, Flutterwave).
- Push notifications (in-app notifications only).
- Multi-currency support.
- Receipt generation or PDF export.
- Bank account linking or direct debit.
- Group chat or messaging features within splits.

---

## Appendix: PM Annotation Index

This document contains PM annotations that highlight where product judgment was applied to correct, refine, or supplement AI-generated content. These annotations are embedded throughout the document at their relevant sections. For reference, the five core annotations address:

1. **Section 1 (Overview):** Reframed the product description from "bill-splitting utility" to a fintech product with a transactional settlement layer.
2. **US-1 (Registration):** Changed from email-first to phone-first registration, reflecting Nigerian user behavior and fintech onboarding norms.
3. **US-1 (BVN Errors):** Separated a generic BVN failure into two distinct error states (not found vs. flagged) matching NIBSS response codes.
4. **US-2 (Organizer as Participant):** Added the criterion that the organizer's share is auto-marked as paid, addressing the most common real-world use case.
5. **US-2 (Rounding):** Corrected percentage-based splitting to use whole Naira amounts -- Nigerians do not transact in kobo for social payments.
6. **US-4 (Reminder Copy):** Changed "Send Payment Demand" to "Send Friendly Reminder" to match the social dynamics of splitting expenses among friends in Nigeria.
7. **US-6 (AML Threshold):** Corrected the AML threshold from N1,000,000 to N500,000, aligning with CBN reporting thresholds and the product brief.
