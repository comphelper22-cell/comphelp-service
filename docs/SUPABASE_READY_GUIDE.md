# Supabase Ready Guide

Sprint 21 prepares the architecture for Supabase without connecting a production project.

## Required Future Variables

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not commit real values. Configure them only in the approved hosting environment.

## Readiness Checks

Run:

```powershell
node tests\supabase-ready.test.js
npm run check-project
```

Then call:

```json
{
  "module": "database",
  "action": "database.supabaseReady",
  "payload": {}
}
```

against `/api/system`.

## Migration Order

1. Review `database/sql/001_initial_schema.sql`.
2. Review `database/sql/002_indexes.sql`.
3. Review `database/sql/003_rls_policies.sql`.
4. Review `database/sql/004_seed_demo_data.sql`.
5. Apply only in a staging Supabase project first.
6. Verify RLS and tenant isolation before production.

## Current Limitations

- Supabase Auth is placeholder-only.
- Supabase Storage is placeholder-only.
- RLS policies are examples, not activated by the app.
- JSON fallback remains the active safe default.
