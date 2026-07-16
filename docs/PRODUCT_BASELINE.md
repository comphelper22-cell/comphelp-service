# CompHelp Product Baseline

**Baseline date:** 2026-07-12
**Repository:** `comphelper22-cell/comphelp-service`
**Production branch:** `main`
**Production host:** Vercel

This document records verified product behavior. It deliberately separates production capabilities from beta/prototype code and disconnected scaffolding. A capability is not considered production merely because a module, dashboard card, agent, or passing unit test exists.

## Live production surfaces

- Public website: https://comphelp-service.vercel.app/
- Marketplace dashboard: https://comphelp-service.vercel.app/marketplace
- Public service and city landing pages are routed through `vercel.json`.
- Public lead intake and the deployed system/chat route are available through Vercel serverless APIs.
- The deployed Marketplace contains operational customer, job, estimate, project, vendor, marketing, analytics, and AI-center interfaces.

## Verified production capabilities

The following capabilities have direct code, automated regression coverage, and deployed behavior:

- Public lead validation and delivery, including the Website → Marketplace intake bridge.
- Protected `/api/system` GET and authenticated module POST routes use Marketplace session authentication and role checks. The public chat keeps a deliberately unauthenticated message-only POST path with separate validation; it does not authorize protected module operations.
- Marketplace access control with explicit demo-mode configuration; demo fallback is disabled unless `MARKETPLACE_DEMO_MODE=true`.
- Customer, job, estimate, vendor, and project workflows at the application/API layer.
- Dynamic Job Dispatch with service, urgency, schedule, technician, and duration choices; customer name, email, phone, and address are typed fields.
- Signed, expiring customer quote links that redact internal costs, profit, commission, and internal notes.
- Project upload limits, media signature verification, structured client errors, and safe file-count/size enforcement.
- Interactive Lead Source analytics with labeled demo mode, safe rendering, growth/trend integrity, and file/media deduplication.
- GitHub-based source control and Vercel production deployments.

These capabilities are production-deployed, but business data durability remains limited by the storage condition documented below.

## Beta and prototype capabilities

The repository includes working application-layer modules and tested dashboards for:

- CRM, customer timelines, notes, summaries, and financial views.
- Job scheduling, assignment, dispatch recommendations, and AI dispatch dashboards.
- Sales, finance, operations, customer success, analytics, marketing, inventory, and executive-intelligence centers.
- Workflow definitions, triggers, approvals, history, and agent recommendations.
- Multi-organization schemas, roles, subscription concepts, billing states, and repository interfaces.
- AI role modules for CEO/strategy, operations, sales, finance, marketing, support, dispatch, development, knowledge, security, reliability, and other internal reviewers.
- Beta, release-candidate, production-readiness, and demo-management reports.

These are beta/prototype capabilities until they use durable production data, real identity, external integrations, monitored background execution, and complete end-to-end business validation.

## Scaffolded or disconnected capabilities

The following areas have architecture, placeholders, simulated outputs, or readiness reports but are not complete production integrations:

- Real Supabase PostgreSQL connection, migrations, Row Level Security deployment, and database-backed repositories.
- Real Supabase Auth or another production user identity provider.
- Customer and vendor self-service portals with real accounts.
- Stripe Connect payments, vendor payouts, refunds, disputes, subscriptions, and immutable commission ledger.
- Durable 24/7 workflow queue with retries, dead-letter handling, idempotency, and resumable agent execution.
- OAuth publishing connections for Instagram, Facebook, TikTok, Google Business Profile, YouTube, Yelp, and other platforms.
- Fully automated Reels generation, owner approval, scheduling, publishing, and performance import.
- Real accounting, tax, calendar, messaging, and external CRM integrations.
- Production-grade mobile applications.

## Current storage and persistence

Production runs on Vercel serverless infrastructure. `storage/safe-storage.js` disables deployment-local file writes and stores mutations in temporary process memory. That memory can disappear after a new deployment, cold start, process recycle, or runtime replacement.

The Supabase production connection is not active. `supabase/supabase-config.js` reports `connectionMode: "readiness_only"` and `realProductionConnection: false` even when placeholder configuration values are present.

Consequences:

- The current product is suitable for controlled demos and application-flow validation.
- It must not promise durable Marketplace records until a production database is connected and migration/restore tests pass.
- Production JSON/memory behavior must be replaced before a real customer/vendor beta.

## Authentication and authorization

- Marketplace server routes enforce authentication and role-based access checks.
- Access credentials are held in browser `sessionStorage`, not persistent `localStorage`.
- Demo access requires explicit `MARKETPLACE_DEMO_MODE=true`.
- Internal authorization hardening and regression coverage exist for protected system and Marketplace routes.
- Real user authentication is not connected. `auth/auth-engine.js` reports `realAuthConnected: false`, `oauthConnected: false`, and architecture-only authentication readiness.
- There are no production customer/vendor accounts, password reset flow, organization invitations, MFA, or identity-provider-backed sessions yet.

## External integrations

### Connected or deployed

- GitHub repository and `main` branch deployment flow.
- Vercel hosting, static delivery, and serverless API routing.
- Google Sheets-compatible lead delivery where configured.
- AI-provider calls only where the relevant environment configuration is present.

### Not yet production-connected end to end

- Supabase database/auth/storage.
- Stripe Connect and Stripe Billing.
- Social publishing OAuth integrations.
- Vendor payout and financial reconciliation services.
- Durable background queue/worker platform.
- Full external accounting and business-system integrations.

Demo data is clearly labeled in interfaces that expose sample analytics or scenarios. Demo outputs must never be described as live customer, vendor, revenue, or marketing data.

## Quality baseline

At this baseline:

- The repository has 81 automated tests covering core modules, security hardening, API auth, quote access, uploads, vendor CRUD, Job Dispatch, Lead Source analytics, workflow, database contracts/migrations/RLS/integration security, release, and integration behavior.
- `node --test tests/*.test.js` passes.
- `npm run check-project` passes with known non-blocking repository warnings.
- `npm run lint` passes with existing long-line warnings and no lint errors.
- `git diff --check` is required before review or release.
- Multi-file security, financial, authentication, and workflow changes require independent review.

Passing tests demonstrate covered code behavior; they do not by themselves prove that a placeholder external service is connected or that a dashboard module is ready for real financial/customer operations.

## Known production blockers

1. No durable production database connection.
2. No deployed tenant-isolation/RLS policy enforcement.
3. No real user/vendor/customer identity system.
4. No Stripe Connect payment, commission, refund, dispute, or payout lifecycle.
5. No complete customer → vendor bid → approved quote → payment → fulfillment → commission workflow using real accounts and durable records.
6. No monitored, durable 24/7 agent queue with retries, idempotency, budgets, and emergency stop.
7. No production social-media OAuth publishing pipeline.
8. Legal, accounting, vendor, privacy, refund, media-consent, and marketplace agreements require qualified professional review.
9. Backup creation and real restore drills are not complete for production business data.
10. Closed beta metrics with real vendors and customers have not yet validated business reliability or unit economics.

## Release and approval rules

- GitHub push requires Hovo’s explicit approval.
- Vercel production deployment requires Hovo’s explicit approval.
- Production database migration, payment activation, vendor payout, public posting, customer price commitments, refunds, discounts, and legal-facing claims require owner approval until a reviewed policy explicitly allows bounded automation.
- Secrets must remain outside the repository and must never appear in responses, logs, tests, or commits.

## Evidence sources

- `storage/safe-storage.js`
- `supabase/supabase-config.js`
- `supabase/supabase-client.js`
- `auth/auth-engine.js`
- `api/marketplace.js`
- `api/system.js`
- `api/marketplace-quote.js`
- `api/marketplace-project-upload.js`
- `assets/marketplace-manager.js`
- `marketplace.html`
- `vercel.json`
- `AGENTS.md`
- `package.json`
- `tests/*.test.js`
- Stable production URL and the latest verified Vercel deployment
