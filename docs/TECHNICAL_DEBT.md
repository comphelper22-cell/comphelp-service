# Technical Debt

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
