# Technical Debt

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
