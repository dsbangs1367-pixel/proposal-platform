# 1. Document Control

| Field | Value |
|---|---|
| Product | ProposalFlow — AI proposal generation with e-sign and payments |
| Version | 1.1 |
| Last updated | 2026-08-02 — implementation-status refresh |
| Status | Deployed on Vercel — pre-launch (no custom domain yet) |
| Owner | Daniel Solomon Bangura |
| Brand | Digital Solution Builders (DSB) |
| Classification | Confidential — Digital Solution Builders |
| Governance | T2 (Limited-risk). Profile: `AI Governance/profiles/proposalplatform.md` |

> ProposalFlow is a DSB product. This document records what is built today and the gaps that must close before public launch.

---

# 2. Executive Summary

**What it is.** A SaaS that takes a consultant or agency from blank page to paid contract in one place: it **generates** a structured proposal with AI, lets the client **sign** it on a public page, and **collects payment** — with email and status tracking throughout. Tagline: *Create. Send. Close.*

**Why it exists.** For small consultancies and digital teams in Africa and other emerging markets, the proposal-to-payment journey is fragmented across a word processor, an e-signature tool, an invoicing tool and email. ProposalFlow collapses that into a single flow, with the first draft written by Claude.

**Current status (2026-08-02).** Deployed on Vercel with the core flow working — AI generation, account management, proposal management and e-signature. Two pieces of the arc are not live: the client-page payment section was removed on 2026-04-06 (the payment rail was not available in Sierra Leone; the Flutterwave backend integration remains in the repo) and email sending was stubbed to no-ops the same day (Resend not installed). Sentry error tracking shipped 2026-04-29; Amplitude wiring is in progress in the working tree, uncommitted. The RLS hardening fix (DIG-11, 2026-06-05) is code-complete on branch `fix/dig-11-rls-hardening` but not yet merged to `main`. It is pre-launch: there is no custom domain yet, and two governance items (Supabase Row-Level Security hardening; a published privacy notice with sub-processor disclosure) must close before onboarding real customers.

**The single ask.** Authorise the pre-launch hardening sprint — confirm RLS isolation across all tenant tables and publish the privacy notice — then attach a custom domain and open a private beta.

---

# 3. Problem & Context

**The problem.** A consultant who wins work still loses days to mechanics: drafting a credible proposal, getting it signed, and getting paid. Each step lives in a different tool, none of them talk to each other, and the client experience is disjointed.

**Why now.** Two shifts make a single integrated flow viable in emerging markets: LLMs can draft a genuinely usable 15-section proposal in seconds, and pan-African payment rails (Flutterwave — card, bank transfer, mobile money) make collecting payment inside the same product practical.

**The approach.** One product that owns the whole arc — generate, send, sign, pay — multi-tenant from day one, with payment data kept entirely out of the AI path.

---

# 4. Users & Personas

**Independent consultant / small agency owner (primary).** Wins a client, needs a professional proposal fast, and wants to be paid without chasing. Often serving NGOs, ministries of health, or donor-funded programmes (WHO, USAID/Gates grantees, EHR/LMIS implementers).

**The client (recipient).** Receives a link, reviews the proposal, signs on a public page, and pays — no account required.

**Team member.** Invited into a workspace to collaborate on proposals and templates.

---

# 5. Scope

| In scope (v1.0) | Out of scope (v1.0) | Later |
|---|---|---|
| AI proposal generation (15 sections) | Multi-currency tax/VAT handling | Custom domain + public launch |
| Accounts, dashboard, team, templates | CRM / pipeline management | Proposal analytics (open/sign funnels) |
| E-signature on public client pages | Offline mode | Additional payment providers |
| Payments (Flutterwave) | White-label theming | Published privacy + sub-processor notice (pre-launch gate) |
| Transactional email (Resend) | — | RLS hardening verification (pre-launch gate) |

---

# 6. Functional Requirements & Feature Set

### 6.1 AI proposal generation — **Shipped**
- Claude (Haiku) generates a structured proposal from client inputs (client name, project type, scope, amount, timeline, tone).
- Produces 15 sections: executive summary, problem statement, core challenges, solution, implementation, phased delivery, milestones, team, budget breakdown, payment schedule, terms, next steps and more.

### 6.2 Authentication & accounts — **Shipped**
- Supabase Auth (email/password) sign-in / sign-up; multi-tenant user isolation.
- Dashboard with proposal history; settings; team management and colleague invites.

### 6.3 Proposal management — **Shipped**
- Draft, edit, delete and duplicate proposals; rich-text editing via TipTap.
- Status tracking: draft → sent → viewed → signed → paid.
- Reusable proposal templates.

### 6.4 E-signature & client pages — **Shipped**
- Public, token-addressed proposal pages (`/p/{public_token}`) where clients view, sign (signature canvas) and pay.

### 6.5 Payments & email — **Partially built, not live**
- Flutterwave integration (card, bank transfer, mobile money) with currency/amount validation; payment status pending → completed. Payment data is never sent to the AI.
- Resend for transactional email.
- Status note (2026-08-02): the Flutterwave backend (`lib/flutterwave.ts`, `/api/payments/initialize` + webhook, with tests) is in the repo, but the payment section was removed from the public client page on 2026-04-06 because the rail was not available in Sierra Leone — clients currently cannot pay in-product. Email sending was disabled the same day: every function in `lib/email.ts` is a no-op stub and the Resend SDK is not installed. Both remain requirements for launch.

### 6.6 Analytics — **In progress**
- Amplitude product telemetry.
- Status note (2026-08-02): Sentry error tracking and Vitest test infrastructure shipped 2026-04-29. Amplitude (`@amplitude/unified` + an `AmplitudeProvider` in the root layout) exists only as uncommitted working-tree changes — not yet committed or deployed.

### 6.7 Implementation status (as of 2026-08-02)

| Item | Status | Date / location |
|---|---|---|
| AI proposal generation (Claude Haiku, 15 sections) | Shipped | initial build 2026-04-06 |
| Accounts, dashboard, team, templates (Supabase Auth) | Shipped | initial build 2026-04-06 |
| Proposal management (TipTap editing, status tracking, duplicate/delete) | Shipped | initial build 2026-04-06 |
| E-signature on public token pages (`/p/{token}`) | Shipped | initial build 2026-04-06 |
| In-product payment collection (client-facing) | Removed from client page — rail unavailable in Sierra Leone; backend retained | 2026-04-06 |
| Transactional email (Resend) | Stubbed no-op; SDK not installed | disabled 2026-04-06 |
| Sentry error tracking + Vitest infra | Shipped | 2026-04-29 |
| CI: Anti-Pattern Check + Weekly Code Health Sweep workflows | Shipped (last commit on `main`) | 2026-05-11 |
| RLS enumeration + IDOR fix on public proposal flow (DIG-11) | Code-complete on `fix/dig-11-rls-hardening`; not merged to `main`, not deployed | 2026-06-05 |
| Amplitude telemetry | Uncommitted working-tree changes only | in progress |
| Custom domain, privacy/sub-processor notice, private beta | Not started | pre-launch gates open |

---

# 7. Non-Functional Requirements

- **Tenant isolation (P0, pre-launch gate).** Supabase Row-Level Security must be verified across every tenant-scoped table before real customer data lands. *Status 2026-08-02: the DIG-11 fix (RLS enumeration + IDOR on the public proposal flow) is committed on `fix/dig-11-rls-hardening` (2026-06-05) but not merged or deployed; full-table verification is still open.*
- **AI trust boundary.** Payment and financial data are excluded from prompts sent to Claude; the model only ever sees proposal content inputs.
- **Privacy & compliance (P1 — the top priority after the P0 RLS gap).** A privacy notice — including disclosure of Anthropic as an AI sub-processor — must be published before launch.
- **Performance.** Next.js 16 App Router on Vercel; AI generation returns within a few seconds for a standard proposal.
- **Reliability.** Email and payment callbacks are idempotent against status transitions.

---

# 8. Technical Architecture

- **Frontend / framework.** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4. Note: Next.js 16 has breaking changes from older training data — consult the in-repo docs before changing framework code.
- **Backend.** Supabase (Postgres + Auth), with RLS as the isolation boundary.
- **AI.** Anthropic Claude API (`claude-haiku-4-5`) for generation.
- **Payments.** Flutterwave (backend integration + webhook only as of 2026-08-02; the client-facing payment UI was removed 2026-04-06). **Email.** Resend (planned; current `lib/email.ts` is a no-op stub, SDK not installed). **Analytics.** Amplitude (uncommitted work-in-progress). **Observability.** Sentry (wired 2026-04-29).
- **Hosting.** Vercel. **Brand.** Indigo primary; Geist/Inter typography; FileText wordmark.

---

# 9. Success Metrics & KPIs

| Metric | Target |
|---|---|
| Proposal generation latency | < 5 s for a standard 15-section proposal |
| Generation cost per proposal | Low single-digit cents (Haiku) |
| Funnel completion (sent → signed → paid) | Establish baseline in private beta |
| Tenant data isolation | 100% of tables RLS-verified (pre-launch gate) |
| Payment success rate | ≥ 99% of initiated payments resolve cleanly |

---

# 10. Risks, Roadmap & Appendix

### 10.1 Risks & mitigations

| Risk | Mitigation |
|---|---|
| Cross-tenant data exposure | Verify RLS on all tables before launch (P0 gate) |
| Undisclosed AI sub-processor | Publish privacy notice naming Anthropic before launch (P1 gate) |
| Sensitive data in prompts | Payment/financial data excluded from the AI path by design |
| Generated content quality variance | Structured 15-section template + human edit (TipTap) before send |

### 10.2 Roadmap & milestones
- **Now (shipped, as of 2026-08-02):** generation, accounts/team/templates, proposal management, e-sign — deployed on Vercel. Sentry error tracking + CI health workflows on `main`.
- **Not yet live:** in-product payment collection (client UI removed 2026-04-06; backend retained), transactional email (stubbed), Amplitude analytics (uncommitted).
- **Pre-launch gate:** merge + deploy the DIG-11 RLS fix, then full RLS verification; published privacy/sub-processor notice.
- **Next:** custom domain, private beta, proposal analytics.
- **Later:** additional payment providers, white-label theming.

### 10.3 Appendix
- **Glossary.** RLS = Supabase Row-Level Security; public token = the unguessable identifier on a client proposal page; sub-processor = a third party (here, Anthropic) processing data on the controller's behalf.
- **Source docs.** Project `CLAUDE.md`; governance profile `AI Governance/profiles/proposalplatform.md`.
