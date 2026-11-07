# Split & Settle — Product Brief

**Document Type:** Internal Alignment Document
**Author:** Product Manager
**Status:** Pre-Development

---

## The Problem

In every Nigerian friend group, there is one person who always pays first. They book the Airbnb for the Calabar trip. They place the Chicken Republic order for the office. They pay the Bolt driver when five people pile into an XL. They don't mind fronting the money — whatthey mind is the aftermath.

The aftermath looks like this: they open WhatsApp, send individual messages with their Access Bank account number, and wait. Some friends pay immediately. Some say "I'll send it tonight" and go silent for three days. Some transfer N3,000 instead of N3,500 and claim they "rounded down." Some send to the wrong account entirely. The organizer — already out of pocket — now has to track who has paid, who has not, and who underpaid, all in a group chat that has moved on to talking about Davido's new album. Over time, this erodes trust, breeds resentment, and occasionally ends friendships over N5,000.

This isn't hypothetical. It's a lived experience for millions of young Nigerians who split expenses informally every week.

## Who Exactly Has This Problem

Our target user is the organizer — the responsible friend. They are typically 22-35, banked, digitally literate, and earn enough to front N20,000-N100,000 for a group expense. They use Paystack or Flutterwave-powered apps daily. They're not looking for a budgeting tool or a savings app. They want one thing: a way to collect money from friends without becoming a debt collector.

We're not initially targeting businesses, event planners, or strangers splitting a restaurant bill. We're targeting existing friend groups who already trust each other enough to share expenses but lack a structured way to settle up.

## Our Core Hypothesis

We believe the reason people "forget" to pay isn't malice — it is friction and ambiguity. A WhatsApp message saying "send me your share" is easy to ignore because it is informal, the amount is sometimes unclear, and there is no visible accountability.

If we give the organizer a simple tool to create a structured split with a clear breakdown and a payment link, participants will pay promptly rather than "forgetting" — because the social friction of ignoring a structured request with visible status tracking (where everyone can see who has paid and who has not) is significantly higher than ignoring a WhatsApp message. The transparency creates gentle social pressure without the organizer having to say a word.

## What the MVP Does

Split & Settle is a web application that lets an organizer create a split, share it, and track settlement in real time. The MVP includes:

1. **Split Creation.** The organizer enters a title (e.g., "Lekki Airbnb Weekend"), total amount, participant names, and chooses a split method: equal, custom amounts, or percentage-based.
2. **Payment Links.** Each participant receives a link showing their specific share and a payment button powered by a mocked Paystack integration.
3. **Real-Time Status Tracking.** A dashboard shows who has paid and who has not. This is visible to all participants — creating social accountability.
4. **Auto-Settlement.** When all participants have paid, the organizer is notified and the split is marked as settled.
5. **KYC/BVN Verification Gate.** Before any transaction, users must complete identity verification via BVN — a requirement for CBN compliance in Nigeria.
6. **AML Flagging.** Any transaction exceeding N500,000 is automatically flagged for review, in line with anti-money laundering regulations.
7. **Demo Profile Switcher.** For demonstration purposes, reviewers can toggle between the organizer and participant perspectives without creating multiple accounts.

## Success Metrics

We will evaluate the MVP against five metrics that span activation, transaction health, speed, compliance, and retention:

| # | Metric | Definition | Target |
|---|--------|-----------|--------|
| 1 | **Activation** | Percentage of registered users who complete KYC and create their first split within 24 hours of signup | >50% |
| 2 | **Transaction Volume** | Number of successful settlements per split (i.e., how many participants actually pay) | >80% of participants pay per split |
| 3 | **Settlement Speed** | Average elapsed time from split creation to full settlement | <48 hours |
| 4 | **Compliance** | Percentage of AML-flagged transactions (>N500,000) reviewed within SLA | 100% reviewed within 24 hours |
| 5 | **Retention** | Percentage of organizers who create a second split within 7 days of their first | >30% |

Activation tells us whether the onboarding flow (including the KYC gate) is too heavy. Transaction volume tells us whether the core hypothesis holds — do people actually pay when presented with a structured request? Settlement speed tells us whether we are genuinely faster than the WhatsApp-and-prayer method. The compliance metric is non-negotiable — the CBN doesn't grade on a curve. Retention tells us whether this is a one-time novelty or a habit-forming tool.

## What This Document Does Not Cover

This brief is deliberately scoped to alignment on the problem, hypothesis, and success criteria. Architecture decisions, technical stack, go-to-market strategy, and competitive analysis are separate documents. We're not trying to solve expense tracking, budgeting, or peer-to-peer lending. We're solving one problem — collecting money from friends — and solving it well.

---

*This document is intended for internal alignment before development begins. It should be revisited after the first round of user testing.*
