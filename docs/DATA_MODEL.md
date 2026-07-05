# Data Model

The Sprint 21 data model supports service businesses moving toward SaaS multi-tenancy.

## Required Base Fields

Every major table includes:

- `id`
- `organization_id`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`
- `status`
- `metadata`

Soft delete uses `deleted_at`.

## Core Tables

- `companies`
- `users`
- `roles`
- `permissions`
- `customers`
- `technicians`
- `jobs`
- `estimates`
- `invoices`
- `payments`
- `tasks`
- `notes`
- `activities`
- `files`
- `inventory`
- `ai_memory`

## Relationships

```mermaid
erDiagram
  companies ||--o{ users : has
  companies ||--o{ roles : has
  companies ||--o{ customers : has
  companies ||--o{ technicians : has
  customers ||--o{ jobs : requests
  customers ||--o{ estimates : receives
  customers ||--o{ invoices : receives
  jobs }o--|| technicians : assigned_to
  estimates }o--|| jobs : may_reference
  invoices }o--|| estimates : may_reference
  payments }o--|| invoices : pays
  notes }o--|| customers : may_attach
  activities }o--|| companies : tracks
  ai_memory }o--|| companies : belongs_to
```

## Tenant Isolation

Repositories validate `organization_id` for organization-scoped records. Future Supabase RLS policies must enforce the same boundary at the database level.
