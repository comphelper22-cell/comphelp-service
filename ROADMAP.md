# CompHelp AI Roadmap

## v0.6 Database Foundation

Goal: complete the reusable database layer.

Scope:

- Supabase client using native `fetch`.
- JSON fallback using `data/marketplace.json`.
- Soft deletes with `deleted_at`.
- Database health reports.
- Developer Center database status.

Exit criteria:

- `npm run check-project` passes.
- All database modules expose `create`, `list`, `getById`, `update`, `remove`, and `search`.
- Supabase absence does not crash the app.

## v0.7 CRM v2

Goal: turn leads, customers, vendors, projects, estimates, invoices, tasks, notes, and activity into one operational CRM.

Scope:

- Core platform foundation: organizations, users, roles, permissions, sessions, audit logs, notifications, and preferences.
- CRM pipeline stages.
- Search and filtering.
- Customer timeline.
- Lead to customer conversion.
- Task assignment and reminders.
- Activity logging.

## v0.8 AI Estimate Engine

Goal: generate accurate, explainable estimate drafts.

Scope:

- Labor, materials, travel, tax, markup, commission, profit, and margin.
- Service templates.
- PDF-ready quote output.
- Internal notes and customer-facing quote copy.
- Owner approval before customer delivery.

## v0.9 Dispatcher and Scheduling

Goal: route jobs to the best provider or internal technician.

Scope:

- Vendor matching.
- Arrival estimates.
- Quote request drafts.
- Availability tracking.
- Commission tracking.
- Dispatch status pipeline.

## v1.0 Business OS MVP

Goal: run CompHelp AI operations from one dashboard.

Scope:

- Lead manager.
- CRM.
- Estimates.
- Vendor network.
- Project manager.
- Gallery manager.
- Follow-up queue.
- SMM drafts.
- SEO planning.
- Developer Center.

## v2.0 Multi-Tenant SaaS

Goal: support multiple service businesses.

Scope:

- Tenant isolation.
- Tenant roles and permissions.
- Industry templates.
- Billing plans.
- Usage limits.
- Audit logs.
- Tenant-level integrations.

## v3.0 AI Agent Marketplace

Goal: let businesses install specialized agents.

Scope:

- Agent catalog.
- Permission-scoped tools.
- Agent metrics.
- Marketplace billing.
- Industry-specific agent packs.
- Approval workflows for autonomous actions.
