# Technical Debt

## Epic 4 Real Revenue Flow

- Payment records are manual placeholders; no payment processor is connected.
- Tax is placeholder-only and not jurisdiction-aware.
- Invoice delivery is not implemented.
- Estimate-to-job conversion is functional but should later preserve richer estimate/job relationship metadata.
- Customer financials depend on normalized customer names or IDs until database migration.

## Epic 3 Real Job Dispatch & Scheduling

- Dispatch uses JSON fallback until database migration.
- Calendar slots are simple fixed windows and should later support business hours, holidays, travel time, and technician-specific availability.
- Invoice generation is placeholder-only.
- AI Dispatch is rules-based and does not connect external AI or maps.
- Attachments remain placeholders until storage integration is approved.

## Epic 2 Real Customer CRM

- CRM uses JSON fallback storage until an approved database migration.
- Customer notes support add, edit, delete, and pin in the API; UI currently focuses on add/list/pinned visibility.
- Customer timeline derives events from available local records and should be expanded when estimates, jobs, invoices, and payments use normalized customer IDs.
- Revenue and average response time remain placeholder/dashboard values until production finance/activity data is connected.

## Epic 2.1 CRM Integration & Cleanup

- Customer API response envelopes are now consistent, but broader `/api/system` modules still use mixed envelope shapes.
- CRM integration tests use temporary JSON files and should later be mirrored with browser-level UI tests.
- Note edit/delete controls are still API-first and should be added to the UI when permissions are enforced.

## Phase 2 Epic 1 Identity & Authentication

- Real authentication provider is not connected.
- OAuth is not connected.
- Password storage and reset delivery are placeholder-only.
- JWT signing is disabled until secrets management and provider choice are approved.
- RBAC decisions are advisory and not yet enforced as middleware.
- Session persistence and revocation are architecture-only.

## Sprint 21.5 Hardening

- Archived/generated folders such as `outputs` and `phase2-crm-clean` still contain keyword scan noise and should be reviewed before a production repository cleanup sprint.
- Lightweight linting checks syntax and obvious file hygiene only; a future sprint should add ESLint with agreed rules.
- Security audit is regex-based and should be paired with GitHub secret scanning or an approved secret scanner before public release.
- Repository methods are interface-complete, but UI/API consumers do not yet use all repositories.

## Sprint 21 Database Foundation

- Supabase Auth remains placeholder-only.
- Supabase Storage remains placeholder-only.
- RLS policies are examples and require staging verification before activation.
- JSON fallback remains the active default and needs a future migration/export tool.
- Repository validation is schema-driven but not yet connected to UI form-level errors.
- SQL migrations are not executed automatically and require manual review.

## V1 RC Technical Debt

- Split large dashboard JavaScript into smaller modules.
- Add automated browser smoke tests.
- Add real authentication before SaaS launch.
- Move long-running or integration work to queue-backed workers.
- Add stronger permission enforcement around all write actions.
- Replace JSON fallback with tenant-scoped database tables where appropriate.
- Add structured test runner instead of standalone Node tests.
- Reduce large backup artifacts in the repository workspace.

## Policy

Technical debt should be reviewed every sprint and prioritized by customer impact, security risk, and deployment risk.
