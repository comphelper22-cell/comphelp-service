# CompHelp Database Inventory

**Inventory date:** 2026-07-15
**Scope:** existing JavaScript schemas, generic repositories, JSON stores, organization/RBAC models, workflows, and Supabase readiness files.

This document is the evidence-backed starting point for the PostgreSQL/Supabase migration. It does not claim that a production database is connected.

## Canonical migration source

`data/marketplace.json` is the only canonical migration source unless a later owner-approved data freeze explicitly replaces it.

The following are legacy or generated copies and must never be selected automatically for migration:

- `phase2-crm-clean/data/marketplace.json`
- `outputs/data/marketplace.json`
- `phase2-crm-clean/outputs/data/marketplace.json`

Before importing, the canonical file must be copied to a timestamped, checksummed, read-only migration snapshot. The importer must reject an unapproved path or changed checksum.

## Existing schema and repository layer

The repository has 16 schema descriptions and 16 entity repositories plus the repository factory. The schemas cover:

- companies, users, roles, permissions
- customers, technicians, jobs
- estimates, invoices, payments
- tasks, notes, activities, files
- inventory and AI memory

All entity repositories are thin wrappers over `database/repositories/repository-factory.js`. They do not add database foreign keys, joins, uniqueness, SQL types, tenant-aware reads, or entity-specific integrity rules.

Current risks include:

- Prefixed timestamp/random string IDs instead of database UUIDs.
- Reads, updates, deletes, searches, and pagination do not enforce tenant isolation.
- Updates to missing IDs can create records.
- Deletes use fields not declared consistently in schemas.
- Snake-case and camel-case timestamps coexist.
- Roles embed permissions while legacy permission models use different shapes.
- `companies`, `organizations`, and `tenants` overlap without one authoritative model.

## Current JSON data

The canonical aggregate currently contains approximately:

- 101 customers
- 51 jobs
- 50 projects
- 31 estimates
- 27 invoices
- 20 payments
- 20 dispatches
- 18 follow-ups
- 15 leads and 15 source leads
- 12 commissions
- 10 vendors and 10 technicians
- 137 customer timeline records
- 116 job timeline records
- 61 customer notes
- 51 job assignments
- 30 activity logs
- 6 roles, 8 permissions, and 1 audit log

These are mixed demo/test records and must not be represented as verified live business records.

## Data quality findings

- `vendors` and `technicians` are duplicate arrays and require an explicit merge rule.
- `leads` and `sourceLeads` are duplicate arrays and require an explicit merge rule.
- Only 1/101 customers has `organization_id`; nearly all customer rows are currently unscoped.
- Only 1/51 jobs has an organization identifier.
- Technician relationships commonly store names instead of IDs; one technician name does not resolve.
- IDs mix seeded IDs and timestamp-generated IDs.
- Customers use both `name` and `fullName`.
- Timestamps mix camelCase, snake_case, date-only strings, and generic timestamps.
- Money concepts are duplicated across `value`, `projectValue`, `revenue`, `total`, `amount`, `paidAmount`, and `outstandingBalance`.
- Estimate and invoice line items need relational child tables.
- Projects duplicate customer and technician names instead of relying on foreign keys.
- Notes, files, and activities use polymorphic references that have no foreign-key integrity.
- Workflow input/action payloads may contain PII or secrets and cannot be migrated wholesale without filtering.

No current row may receive an organization automatically unless the mapping is deterministic, documented, counted, and owner-approved.

## Sensitive-data classification

RLS, logging, retention, and export/delete controls must cover:

- Customer, lead, vendor, technician, and user names, email, phone, address, city, and ZIP.
- Notes, completion details, workflow payloads, and AI memory.
- Invoice/payment amounts, methods, and statuses. Raw card data must never be stored.
- Private file URLs and file metadata.
- Session, device, browser, IP, and location attributes.
- Audit metadata and organization-owner details.

## Target normalized core

The initial PostgreSQL core should include:

1. `organizations`
2. `profiles` with PK/FK to `auth.users.id`
3. `organization_memberships`
4. `roles`, `permissions`, `role_permissions`, `membership_roles`
5. `customers`, with normalized contact/address fields where needed
6. `leads`, optionally linked to a converted customer
7. `vendors`, `technician_profiles`, and explicit vendor/user/technician relationships
8. `projects`, `jobs`, `job_assignments`, `job_timeline_events`
9. `estimates`, `estimate_items`
10. `invoices`, `invoice_items`
11. `payments`, `commissions`, and later payout/refund/dispute ledger tables
12. `tasks`, `notes`, `files`, `inventory_items`
13. `activities`, append-only `audit_logs`
14. `workflow_definitions`, `workflow_triggers`, `workflow_actions`, `workflow_executions`, `workflow_execution_steps`, `approval_requests`, `workflow_events`
15. `user_settings`, `notifications`, `sessions`
16. `ai_memories`, `decision_history`
17. Temporary `legacy_id_map` for deterministic legacy-ID mapping

### Type and integrity conventions

- Primary keys: UUID generated by PostgreSQL.
- Tenant-owned rows: non-null UUID `organization_id` with a foreign key and index.
- Time: `timestamptz`, using consistent `created_at`, `updated_at`, and optional `deleted_at`.
- Money: integer minor units for external provider ledgers where appropriate; otherwise `numeric(12,2)` plus an explicit three-letter currency.
- Foreign keys: explicit delete behavior; financial and audit data must not cascade-delete silently.
- Statuses: constrained text or reviewed enums/check constraints.
- Metadata: JSONB only for genuinely flexible, non-relational attributes.
- Tenant RLS: resolve access through `auth.uid()` and active `organization_memberships`; never trust a caller-supplied organization setting alone.

## Migration order

1. Freeze the canonical JSON and record its SHA-256 checksum, size, timestamp, and owner approval.
2. Classify records as demo, test, or approved business data.
3. Create organizations and `legacy_id_map`.
4. Create profiles, organization_memberships, RBAC tables, and RLS helper functions.
5. Import organizations, users, roles, and permissions.
6. Import customers, leads, vendors, and technicians; merge only deterministic duplicates.
7. Import projects, jobs, assignments, and timelines.
8. Import estimates, invoices, line items, payments, and commissions.
9. Import notes, files, tasks, inventory, activities, and audit records.
10. Import filtered workflow history and AI memory only after sensitive-data review.
11. Reconcile source/target counts, references, money totals, tenant ownership, and rejected rows.
12. Run a dual-read comparison against the frozen source.
13. Cut over writes only after owner approval, rollback rehearsal, and independent security review.
14. Archive JSON stores read-only only after successful production verification; do not delete the frozen snapshot.

## Migration gates

The migration cannot proceed to production until all gates pass:

- Canonical source path and checksum are owner-approved.
- Demo/test/business classification is complete.
- Every imported tenant-owned row has a documented organization mapping.
- Every legacy ID has one deterministic UUID mapping.
- Duplicate merge rules are tested and produce a reconciliation report.
- Invalid/unresolved records are quarantined, never silently discarded.
- Source and target record counts are reconciled per collection.
- Financial totals reconcile exactly by currency.
- Foreign-key orphan count is zero for accepted rows.
- RLS tests prove cross-organization denial using authenticated membership and `auth.uid()`.
- Service-role access is isolated to server-only code.
- Backup and restore drill passes.
- Dual-read output matches for the approved sample set.
- Rollback steps are tested.
- Hovo explicitly approves production migration and write cutover.

Until these gates pass, JSON fallback remains a development/demo compatibility path and must not be described as durable production storage.
