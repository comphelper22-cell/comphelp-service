# Migration Plan

Sprint 21 does not migrate production data. It creates the path.

## Phase 1: Foundation

- Create schema files.
- Create repositories.
- Create SQL migration drafts.
- Keep JSON fallback active.

## Phase 2: Staging Supabase

- Create a staging Supabase project.
- Configure environment variables outside git.
- Apply migration SQL in order.
- Verify schema, indexes, and RLS policies.
- Seed demo data only in staging.

## Phase 3: Data Import

- Export JSON fallback data.
- Map marketplace/demo collections to normalized tables.
- Import test data into staging.
- Verify relationships and tenant isolation.

## Phase 4: Production Readiness

- Enable auth and role middleware.
- Enable RLS with organization-scoped policies.
- Add backup and restore procedure.
- Perform rollback rehearsal.

## Phase 5: Production Cutover

- Freeze writes.
- Backup JSON data.
- Import reviewed production data.
- Smoke test all dashboards.
- Switch database mode only after owner approval.
