# Known Issues

## Current V1 RC Issues

- Large backup ZIP warning appears in production hardening checks.
- Security keyword scan produces review warnings for placeholder/env documentation.
- Authentication is still internal admin-code based.
- Some modules use demo or JSON fallback data.
- External integrations are architecture-only.
- Billing does not process payments.

## Required Review

Review all `npm run check-project` warnings before commit, push, or deployment.
