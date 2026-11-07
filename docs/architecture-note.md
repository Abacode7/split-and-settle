# Split & Settle — Architecture Note

## How Money Moves

Split & Settle is a payment facilitator, not a wallet. We never hold funds directly. All money movement runs through Paystack as our primary payment processor.

**The settlement flow works as follows:**

1. **Organizer creates a split** — The organizer defines the expense, assigns participant shares, and triggers notifications via push and in-app messaging.
2. **Participants pay** — Each participant pays their share through Paystack's payment modal. Paystack supports card payments, bank transfers, and USSD -- covering the major ways Nigerians transact today.
3. **Funds land in a Paystack sub-account** — Each split maps to a dedicated Paystack sub-account that acts as an escrow-like holding layer. Funds are held here until settlement is triggered. This is not a wallet; it is Paystack's custody infrastructure.
4. **Settlement is triggered** — When all participants have paid (or the organizer manually triggers settlement), our backend calls the **Paystack Transfers API** to disburse the collected amount to the organizer's registered bank account. The transfer settles via **NIP (NIBSS Instant Payment)**, the real-time interbank rail operated by NIBSS, meaning the organizer receives funds within seconds.

**Partners and Rails:**

| Layer | Partner / Rail | Role |
|---|---|---|
| Collection | Paystack | Card, bank transfer, USSD processing |
| Holding | Paystack Sub-accounts | Escrow-like custody of in-flight funds |
| Disbursement | Paystack Transfers API | Payout to organizer's bank account |
| Interbank Settlement | NIP (NIBSS) | Real-time bank-to-bank transfer |
| Fallback Collection | Flutterwave | Alternative processor if Paystack is degraded |

**Future consideration:** Direct bank-to-bank collection via NIP and virtual accounts issued through a licensed banking partner (e.g., Providus or Wema) would reduce collection fees and remove Paystack as a single point of failure.

---

## Float and FX Exposure

**FX exposure is zero in the current architecture.** All transactions are denominated in NGN, and no cross-border movement occurs. If we expand to diaspora remittance splits in the future, FX risk would need to be addressed -- but that is out of scope today.

**Float risk exists in the gap between participant payment and organizer settlement.** When a participant pays but the organizer has not yet triggered (or all participants have not yet completed) settlement, funds sit idle in the Paystack sub-account. During this window:

- **Paystack owns the float risk.** Funds are in their custody, held within their CBN-regulated settlement infrastructure. Split & Settle has no direct access to those funds outside of the Transfers API.
- **Interest on float accrues to Paystack** per the standard merchant agreement. We do not earn yield on in-flight funds.
- **Our exposure is operational, not financial.** If Paystack experiences a liquidity event or regulatory action, disbursement could be delayed. We mitigate this by keeping settlement windows short (encouraging immediate settlement) and maintaining Flutterwave as a fallback rail.

**If we introduce a wallet feature**, the risk profile changes materially. We would need to partner with a licensed microfinance or commercial bank (Providus, Wema) to issue virtual accounts, and float management -- including reconciliation, interest allocation, and prudential reporting -- would shift to us as the wallet operator. That is a different regulatory posture entirely and would require a CBN approval pathway.

---

## What Happens When a Transaction Fails

**Technically:**

1. Paystack sends a `charge.failed` webhook to our backend.
2. Our server updates the transaction record to `failed`, stores the failure reason code and Paystack reference for audit and support resolution.
3. The participant's share status remains `pending` -- no state corruption occurs. There are no partial captures; a charge either succeeds fully or fails cleanly.
4. The split's overall status does not change. The organizer's settlement cannot be triggered until all shares are in a `paid` state.

**From the user's perspective:**

1. The Paystack payment modal displays a clear failure message (e.g., "Insufficient funds," "Card declined," "Bank unavailable").
2. The participant sees a **"Retry Payment"** button on their split detail screen, allowing them to attempt payment again immediately or with a different payment method.
3. If payment fails repeatedly, the participant can **"Raise a Dispute"**, which flags the split for the organizer and our support team.
4. The organizer sees the participant's status as **"Payment Failed"** in their dashboard and can send a payment reminder directly from the app.
5. **No money moves on failure.** The system returns to a clean state. There is no amount deducted, no phantom balance, and no reconciliation burden. This is a deliberate architectural choice: we rely on Paystack's atomic charge model to guarantee that funds either move completely or not at all.
