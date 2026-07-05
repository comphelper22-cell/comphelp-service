# Database Foundation

Sprint 21 creates the database foundation for real SaaS usage while preserving JSON fallback and demo mode.

## Goals

- Prepare CompHelp AI for Supabase/PostgreSQL.
- Keep existing JSON fallback working.
- Define core SaaS tables and relationships.
- Add repositories with a consistent interface.
- Add validation for tenant isolation, status values, money, dates, email, and phone fields.
- Provide SQL migration drafts for manual review.

## Runtime Mode

The database layer uses JSON fallback by default. If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured later, the lower database client can use Supabase-ready paths while still falling back to JSON when needed.

No production Supabase project is connected by this sprint.

## Created Layers

- `database/core/`: configuration, client wrapper, validation, health, migrations, seed status, errors.
- `database/schema/`: table definitions and validation rules.
- `database/repositories/`: repository pattern over the database client.
- `database/sql/`: review-only SQL migration drafts.
- `supabase/`: readiness placeholders for client, auth, storage, and RLS.
- `agents/database-agent.js`: diagnostics and readiness reporting.

## API

Use `/api/system` with module `database`.

Supported actions:

- `database.status`
- `database.health`
- `database.schema`
- `database.repositories`
- `database.migrations`
- `database.seed`
- `database.supabaseReady`

## Safety

- No secrets are stored.
- No `.env` files are modified.
- No production database connection is required.
- SQL files are not executed automatically.
- RLS policies are examples only.
