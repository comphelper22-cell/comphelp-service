# CompHelp AI Security

## Authentication

Admin dashboard access currently uses secret-code headers for internal operation. SaaS expansion should move to a proper identity provider with user accounts, sessions, MFA support, and tenant-scoped roles.

## Authorization

Use role-based access control.

Roles:

- Admin: full access.
- Manager: create and edit leads, vendors, projects, estimates, and campaigns.
- Dispatcher: dispatch and project operations.
- Technician: assigned tasks and project updates.
- Customer: customer-facing estimate and project views.
- Viewer: read-only dashboards.

Every API route should verify role permissions before writes.

The v0.7 platform foundation stores roles and permissions in the database layer. Default roles are admin, manager, dispatcher, technician, customer, and viewer. Future SaaS authorization must evaluate tenant, role, resource, action, and explicit permission effect before allowing writes.

## Session Management

Sessions must store hashed token values, not raw tokens. Sessions should include user, organization, role, status, expiration time, creation time, and optional revocation time. Expired or revoked sessions must not authorize requests.

## Secrets Management

- Never commit `.env` or `.env.local`.
- Never print secret values to logs.
- Store production secrets in Vercel environment variables.
- Use service role keys only in server-side routes.
- Never expose Supabase service role keys in browser JavaScript.

## API Safety

APIs must return JSON only:

```json
{ "ok": true, "data": {} }
```

or:

```json
{ "ok": false, "error": "safe_message" }
```

Errors should be useful but must not expose secrets, tokens, database URLs, stack traces, or private customer data.

## Customer Data Protection

- Collect only data needed to deliver service.
- Hide private data in public galleries.
- Blur faces, addresses, passwords, serial numbers, license plates, and documents before publishing media.
- Do not contact opted-out customers.
- Keep approval queues for outreach.

## Backups

Use `scripts/backup-project.js` before deployment. Backups must exclude `node_modules`, `.git`, `.env`, `.env.local`, and backup outputs. Production database backups should be managed through Supabase backup tooling.

## Audit Logs

Audit logs should track sensitive actions:

- Login attempts.
- Role changes.
- Estimate approval.
- Message sending.
- Vendor dispatch.
- Invoice changes.
- Deployment actions.
- Data export.

The platform foundation writes audit records for organization creation, user creation, session creation, session revocation, notification creation, preference updates, RBAC default creation, and manual audit events.

## Security Rules

- Do not mass-send messages.
- Do not scrape private personal data.
- Do not bypass platform limits.
- Do not invent reviews or false claims.
- Do not deploy without approval.
- Do not push without approval.

## Project Titan Safety

Project Titan reports are internal. Titan Alpha must not connect to external APIs, scrape competitors, send outreach, publish social posts, push GitHub changes, or trigger Vercel deployments. Titan outputs are advisory until the owner approves a future automation policy.
