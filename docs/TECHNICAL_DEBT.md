# Technical Debt

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
