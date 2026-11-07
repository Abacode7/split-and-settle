# Split & Settle -- MVP Retrospective

## What Isn't Working

Honest assessment: the MVP demonstrates the core concept of splitting expenses among friends, but several critical gaps exist between what we built and what a production-ready product requires.

**No real payment processing.** All payments in the MVP are mocked. The Paystack modal is simulated, and payment state transitions are driven by `setTimeout()` rather than webhook-driven confirmations. In a real product, we would need server-side webhook listeners to confirm payment status, handle idempotency, and guard against race conditions. A user refreshing the page mid-payment would break the current flow entirely.

**No real notifications.** The "Send Reminder" button shows a toast message and nothing more. In production, this feature needs integration with WhatsApp Business API or SMS providers like Termii or Africa's Talking. WhatsApp is not optional -- it is the primary communication channel for Nigerian friend groups, and a split-expense product that cannot reach participants where they already are will not drive action. Email and push notifications are secondary channels at best.

**No real multi-user support.** The profile switcher in the MVP is a demo-only affordance. There is no authentication, no user sessions, and no persistent identity. Real multi-user support requires phone-based OTP authentication (via Termii or similar), proper session management, and a server-side database. Without this, the app is fundamentally single-player.

**localStorage is not production-ready.** All data lives in the browser's localStorage. It does not sync across devices, it is lost if the user clears browser data, and it cannot be shared between users. A production system needs a proper database -- PostgreSQL via Supabase or PlanetScale -- with a real API layer.

**No shareable payment links.** The most important viral mechanic -- sharing a split link via WhatsApp so that participants can view and pay their share -- is not implemented. Currently, a participant would need to have the app open on the same device to see their obligations. Without shareable links, the product has no organic distribution channel.

**Split calculation edge cases.** Equal splits with amounts that do not divide evenly (e.g., NGN 10,000 split three ways yields NGN 3,333.33) are rounded to the nearest Naira. This means the total may be off by NGN 1-2. Production needs a deliberate "remainder" allocation strategy -- typically assigning the extra kobo to the organizer or distributing it round-robin across participants.

---

## Next Sprint Priorities

If this product were to continue beyond the capstone, the following three priorities would define the next sprint, in this order.

**Priority 1: Real authentication and shareable payment links.** Without authentication, there is no real product. And without shareable links, there is no viral loop. The organizer needs to be able to share a link on WhatsApp that anyone can open and pay, even without creating an account. This is the single most important feature for growth. Guest checkout (pay without signing up) lowers the barrier to entry for participants, while the organizer's account provides the anchor for tracking and history. These two features are coupled because a shareable link is meaningless without some form of identity resolution on the receiving end.

**Priority 2: Paystack integration.** Move from mocked payments to real money movement. This means implementing server-side webhook handlers for payment confirmation, handling edge cases such as duplicate payments, partial captures, and refunds, and building a reconciliation layer that can detect and surface discrepancies. Without real money movement, the product is a demo, not a tool. Paystack was chosen because of its dominance in the Nigerian fintech ecosystem and its well-documented API.

**Priority 3: WhatsApp notifications.** Integrate WhatsApp Business API for payment reminders and settlement confirmations. This is where Nigerian users live. The notification flow should be: organizer creates a split, participants receive a WhatsApp message with the amount and a payment link, and both parties receive confirmation when payment is completed. This closes the loop and eliminates the need for the organizer to manually chase payments -- which is the core pain point the product exists to solve.

---

## Where AI Fell Short

AI was a significant accelerator during this build, but it made specific mistakes that required human correction.

**Dead imports that broke the build.** AI initially generated a `store.ts` file that imported `generateId` but never used it. The production build failed because ESLint flagged the unused import as an error. This is a minor but real example of a pattern where AI generates code that looks plausible in isolation but does not survive the build pipeline. I caught it during the build step and removed the import manually.

**Data model did not account for the organizer as a participant.** The initial data model AI proposed had `createdBy` as a separate field but did not include the organizer in the `participants` array. This meant the organizer's payment status was not tracked -- a significant logic gap, because the organizer typically fronts the money and should be auto-marked as "paid." I corrected this: the organizer is always the first entry in the participants array and is automatically marked as paid on creation.

**Wrong config file name.** AI suggested modifications to `next.config.js`, but `create-next-app@14` generates `next.config.mjs` (ES module format). The scaffolding step had to adapt to the actual file name. This is a small friction point, but it illustrates a broader issue: AI works from assumptions about tooling defaults that may not match the versions currently in use. Developers cannot blindly trust AI-generated file paths.

**Over-engineering tendency.** AI's first architectural proposal included API routes, server-side state management, and a level of infrastructure complexity that was unnecessary for an MVP demo. I pushed back and simplified to localStorage with static export. This decision saved hours of build time, and the result is functionally identical for the purpose of a capstone defense. AI tends to default to "best practice" architectures without weighing them against the actual constraints of the project -- in this case, a demo that needs to be built in days, not weeks.

---

## The Compliance Risk You Didn't See Coming

**The escrow and float risk was not obvious at the start.**

When I began building Split & Settle, I conceptualized it as a straightforward "split and pay" utility. The mental model was simple: calculate who owes what, collect payments, and forward the total to the organizer. But during the architecture phase, I realized that between the moment a participant pays and the moment the organizer receives settlement, the money sits somewhere. That "somewhere" has serious regulatory implications.

If we hold the funds ourselves -- even briefly, even in a pooled account -- we are effectively operating an escrow service. In Nigeria, this triggers additional licensing requirements, potentially including a Microfinance Bank licence or a formal trust arrangement under CBN guidelines. The compliance burden is substantial and the penalties for non-compliance are severe.

The mitigation strategy is to route payments through Paystack's sub-accounts feature, which means Paystack (as the licensed Payment Service Provider) holds the float, not us. We never touch the money. But this creates a secondary problem: Paystack's standard bank transfer settlement is T+1, meaning the organizer does not receive funds until the next business day. This directly contradicts any "instant settlement" promise we might make to users.

This tension -- between the user expectation of instant settlement and the technical reality of T+1 bank transfers -- is a product-compliance gap that requires honest messaging. The MVP sidesteps this entirely with mocked instant settlement, but a production product would need to choose one of three paths: (a) be transparent about settlement timing and set correct expectations in the UI, (b) use Paystack's instant transfer feature, which carries higher per-transaction fees that eat into margins, or (c) maintain a pre-funded settlement pool to front payments to organizers immediately, which creates its own capital requirements and float management complexity.

None of these options are free. The first costs user trust. The second costs margin. The third costs capital. This is the kind of trade-off that was invisible at the whiteboard stage but became unavoidable once we got into the details of how money actually moves through the Nigerian payments infrastructure.
