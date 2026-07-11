# Production Storage

Vercel serverless deployments run application code from a read-only bundle. Runtime code must not write to `/var/task`, project root, or checked-in `data/` files in production.

## Safe Storage Helper

Runtime writes should use `storage/safe-storage.js`.

Behavior:

- Local development: JSON fallback writes continue to use local files such as `data/marketplace.json`.
- Vercel production: file writes are disabled and data is stored temporarily in process memory.
- Production without a database: responses should stay successful and include this warning:

```text
Production file writes disabled; using temporary memory store.
```

## Current Safe Runtime Paths

- Shared JSON fallback through `database/json-store.js`.
- Workflow history: `data/workflow-history.json`.
- Decision history: `data/decision-history.json`.
- Recommendation history: `data/recommendation-history.json`.
- Brain memory: `data/brain-memory.json`.
- Marketplace JSON writes.
- Marketplace project upload metadata writes.
- Agent log appends.
- Outreach and social lead JSON writes.

## Important Limitation

Memory fallback is temporary. Serverless instances can restart at any time, so production data must eventually move to Supabase or another approved persistent database.

## Future Migration

Production persistence should move to:

- Supabase tables for CRM, jobs, estimates, invoices, workflows, history, and AI memory.
- Cloudinary or approved object storage for project media.
- Append-only audit logs in database-backed storage.

