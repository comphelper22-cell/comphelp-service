# CompHelp AI Database Schema

The database layer must support Supabase in production and JSON fallback locally. The JSON fallback file is `data/marketplace.json`.

## Core Tables

### customers

Stores people or businesses that have become active customers.

Fields: `id`, `tenant_id`, `name`, `phone`, `email`, `address`, `city`, `notes`, `status`, `created_at`, `updated_at`, `deleted_at`.

Relationships: one customer can have many leads, projects, estimates, invoices, messages, and activity logs.

### leads

Stores inbound and owner-approved prospect records.

Fields: `id`, `tenant_id`, `customer_id`, `name`, `phone`, `email`, `instagram`, `tiktok`, `source`, `service`, `city`, `address`, `notes`, `status`, `preferred_date`, `created_at`, `updated_at`, `deleted_at`.

Relationships: a lead can convert into a customer and can generate estimates, projects, tasks, and messages.

### vendors

Stores subcontractors and partner service providers.

Fields: `id`, `tenant_id`, `name`, `category`, `phone`, `email`, `website`, `city`, `service_area`, `rating`, `availability`, `commission_percent`, `notes`, `status`, `created_at`, `updated_at`, `deleted_at`.

Relationships: vendors can receive quote requests, be assigned to projects, and generate commission records.

### projects

Stores jobs and operational work.

Fields: `id`, `tenant_id`, `customer_id`, `lead_id`, `vendor_id`, `title`, `service`, `city`, `address`, `status`, `scheduled_date`, `completion_date`, `description`, `customer_review`, `media`, `notes`, `created_at`, `updated_at`, `deleted_at`.

Relationships: projects can have estimates, invoices, tasks, activity logs, media, messages, and commissions.

### estimates

Stores quote drafts and approved estimates.

Fields: `id`, `tenant_id`, `customer_id`, `lead_id`, `project_id`, `service`, `city`, `labor`, `materials`, `travel`, `tax`, `markup`, `commission`, `profit`, `margin`, `low`, `high`, `recommended`, `customer_quote_text`, `internal_notes`, `status`, `created_at`, `updated_at`, `deleted_at`.

Relationships: estimates can become invoices and projects.

### invoices

Stores billing records.

Fields: `id`, `tenant_id`, `customer_id`, `project_id`, `estimate_id`, `invoice_number`, `amount`, `tax`, `balance_due`, `status`, `due_date`, `paid_at`, `created_at`, `updated_at`, `deleted_at`.

Relationships: invoices connect customer, project, estimate, and payment activity.

### tasks

Stores operational work items.

Fields: `id`, `tenant_id`, `related_type`, `related_id`, `title`, `owner`, `priority`, `status`, `due_date`, `notes`, `created_at`, `updated_at`, `deleted_at`.

Relationships: tasks can relate to leads, customers, projects, vendors, estimates, invoices, and campaigns.

### activity_logs

Stores timeline events.

Fields: `id`, `tenant_id`, `actor`, `type`, `message`, `metadata`, `status`, `created_at`, `deleted_at`.

Relationships: activity can reference any entity by `related_type` and `related_id`.

### users

Stores SaaS users.

Fields: `id`, `tenant_id`, `organization_id`, `name`, `email`, `phone`, `role`, `status`, `auth_provider`, `supabase_user_id`, `created_at`, `updated_at`, `deleted_at`.

Relationships: users have roles and create audit log entries.

### roles

Stores role definitions.

Fields: `id`, `tenant_id`, `name`, `description`, `created_at`, `updated_at`, `deleted_at`.

Recommended roles: `admin`, `manager`, `dispatcher`, `technician`, `customer`, `viewer`.

### permissions

Stores role capabilities.

Fields: `id`, `tenant_id`, `organization_id`, `role_id`, `role`, `resource`, `action`, `effect`, `status`, `created_at`, `updated_at`, `deleted_at`.

### organizations

Stores tenant and business account records.

Fields: `id`, `tenant_id`, `name`, `slug`, `industry`, `city`, `owner_email`, `status`, `created_at`, `updated_at`, `deleted_at`.

Relationships: organizations own users, roles, permissions, sessions, notifications, preferences, customers, leads, projects, estimates, invoices, and audit logs.

### sessions

Stores user session records.

Fields: `id`, `tenant_id`, `organization_id`, `user_id`, `role`, `token_hash`, `status`, `expires_at`, `revoked_at`, `created_at`, `updated_at`, `deleted_at`.

Raw session tokens must never be stored.

### audit_logs

Stores security-sensitive events.

Fields: `id`, `tenant_id`, `user_id`, `action`, `resource`, `resource_id`, `ip_hash`, `user_agent`, `metadata`, `created_at`.

### messages

Stores SMS, email, chat, and call transcript events.

Fields: `id`, `tenant_id`, `customer_id`, `lead_id`, `project_id`, `channel`, `direction`, `body`, `status`, `approved_by`, `sent_at`, `created_at`, `deleted_at`.

### marketing_campaigns

Stores campaigns and content plans.

Fields: `id`, `tenant_id`, `name`, `channel`, `city`, `service`, `status`, `content`, `schedule`, `metrics`, `created_at`, `updated_at`, `deleted_at`.

### inventory

Stores parts, equipment, and materials.

Fields: `id`, `tenant_id`, `sku`, `name`, `category`, `quantity`, `unit_cost`, `reorder_level`, `vendor_id`, `status`, `created_at`, `updated_at`, `deleted_at`.

### notifications

Stores in-app and future email/SMS notification records.

Fields: `id`, `tenant_id`, `organization_id`, `user_id`, `type`, `title`, `message`, `status`, `created_at`, `updated_at`, `deleted_at`.

### preferences

Stores user and organization settings.

Fields: `id`, `tenant_id`, `organization_id`, `user_id`, `key`, `value`, `scope`, `status`, `created_at`, `updated_at`, `deleted_at`.

## Relationships

- `tenants` own all SaaS records.
- `customers` have many `projects`, `estimates`, `invoices`, `messages`, and `activity_logs`.
- `leads` can become `customers`.
- `vendors` can be assigned to `projects`.
- `projects` can have many `tasks`, `messages`, `activity_logs`, and media records.
- `estimates` can convert into `projects` and `invoices`.
- `roles` define `permissions`; users receive roles per tenant.

## Soft Delete Strategy

All business tables use `deleted_at`. Application reads should ignore rows where `deleted_at` is not null. Destructive hard deletes are reserved for explicit owner-approved maintenance, privacy compliance, or test data cleanup.

## Audit Logging

Audit logs are append-only. They should record authentication changes, role changes, estimate approval, message sending, deployment actions, vendor dispatch, payment changes, and data export.

## Multi-Tenant SaaS Strategy

Every production table should include `tenant_id`. Row-level security should scope reads and writes by tenant and role. Shared service templates can live in global tables, but customer, lead, project, invoice, message, and audit data must remain tenant isolated.
