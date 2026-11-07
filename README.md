# Split & Settle

Group expense splitting with instant settlement for Nigerian friend groups.

One person always pays first — for the Airbnb, the food order, the Bolt ride. Then spends days chasing everyone on WhatsApp. Split & Settle fixes that. Create a split, share it, and everyone pays their share. No awkward follow-ups, no missing money.

## Live Demo

[View deployed app](https://split-and-settle.netlify.app)

**Demo users:** Switch between profiles in the Profile tab to see different perspectives.

| Profile | Role | What to test |
|---------|------|-------------|
| Tunde | Organizer | Creates splits, views reconciliation, sends reminders |
| Amaka | Participant | Sees splits she owes, makes payments |
| Chidi | Edge cases | Triggers payment failures, AML flags |

## Features

- **KYC/BVN Verification** — Compliance gate before accessing the app. Try BVN `00000000000` for a failure.
- **Create Splits** — Equal, custom, or percentage-based splitting with validation.
- **Mocked Payments** — Simulated Paystack integration with success, failure, and AML flag states.
- **Settlement Tracking** — Real-time progress bars, reconciliation view for organizers.
- **Transaction History** — Filterable log with expandable details and audit references.
- **AML Flagging** — Transactions over N500,000 are automatically held for review.
- **Profile Switcher** — Toggle between organizer and participant views for demo.

## Tech Stack

- **Framework:** Next.js 14 (App Router, static export)
- **Styling:** Tailwind CSS with custom design system
- **Typography:** Plus Jakarta Sans + Bricolage Grotesque
- **Data:** localStorage (no backend)
- **Deploy:** Netlify (static)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & Deploy

```bash
npm run build    # outputs to /out
```

Deploy the `out/` directory to Netlify, or any static host.

## Project Structure

```
src/
  app/              # Next.js app router (layout, page, globals)
  components/       # UI components
    onboarding/     # KYC/BVN verification flow
    dashboard/      # Home screen with summary cards
    create-split/   # Multi-step split creation form
    split-detail/   # Split view with participant list
    payment/        # Mocked Paystack payment modal
    history/        # Transaction log with filters
    profile/        # User info + demo switcher
  lib/
    types.ts        # TypeScript interfaces
    store.ts        # localStorage CRUD + seed data
    utils.ts        # Currency formatting, BVN verification, helpers
docs/
  product-brief.md       # Problem, hypothesis, success metrics
  requirements.md        # User stories with PM annotations
  architecture-note.md   # Money movement, float, failure handling
  compliance-summary.md  # Licensing, data protection, AML, regulatory response
  retrospective.md       # What's not working, next priorities, AI shortcomings
```

## Deliverables

This project was built as a capstone for a Fintech Product Management program. The full deliverable set:

1. **Product Brief** — Problem definition, target user, core hypothesis, 5 success metrics
2. **Requirements Document** — 7 user stories with acceptance criteria and PM annotations
3. **Working Prototype** — This app, with end-to-end flows and visible compliance gates
4. **Architecture Note** — Money movement via Paystack, float/FX analysis, failure handling
5. **Compliance Summary** — CBN licensing, NDPA data protection, AML/CFT, 48-hour response plan
6. **Retrospective** — Honest assessment of gaps, next sprint priorities, where AI fell short
