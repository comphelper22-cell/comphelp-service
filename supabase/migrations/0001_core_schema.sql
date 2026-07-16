-- CompHelp core schema v1.0.0
-- Generated from database/contracts/core-schema-contract.js; review before applying.
begin;

create extension if not exists pgcrypto;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  status text not null default 'active' check (status in ('active','suspended','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete CASCADE,
  display_name text not null,
  email text not null,
  phone text,
  status text not null default 'active' check (status in ('active','invited','suspended','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  profile_id uuid not null references public.profiles(id) on delete CASCADE,
  status text not null default 'active' check (status in ('invited','active','suspended','revoked')),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  name text not null,
  description text,
  system_key text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  description text,
  risk_level text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  role_id uuid not null,
  permission_id uuid not null references public.permissions(id) on delete RESTRICT,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.membership_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  membership_id uuid not null,
  role_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  name text not null,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  status text not null default 'lead',
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  customer_id uuid,
  name text not null,
  email text,
  phone text,
  service text,
  source text,
  status text not null default 'new',
  consent jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  legal_name text not null,
  display_name text not null,
  email text,
  phone text,
  onboarding_status text not null default 'pending',
  verification_status text not null default 'unverified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.technician_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  profile_id uuid references public.profiles(id) on delete SET NULL,
  vendor_id uuid,
  display_name text not null,
  skills jsonb not null default '[]'::jsonb,
  availability jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  customer_id uuid not null,
  lead_id uuid,
  title text not null,
  service text not null,
  status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  project_id uuid,
  customer_id uuid not null,
  title text not null,
  service text not null,
  priority text not null default 'normal',
  scheduled_at timestamptz,
  completed_at timestamptz,
  status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  job_id uuid not null,
  technician_profile_id uuid not null,
  vendor_id uuid,
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'assigned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_timeline_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  job_id uuid not null,
  actor_profile_id uuid references public.profiles(id) on delete SET NULL,
  actor_service text,
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((actor_profile_id is null) <> (actor_service is null))
);

create table public.estimates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  customer_id uuid not null,
  job_id uuid,
  estimate_number text not null,
  status text not null default 'draft',
  currency char(3) not null default 'USD' check (currency = 'USD'),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  tax_total numeric(12,2) not null check (tax_total >= 0),
  total numeric(12,2) not null check (total >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total = subtotal + tax_total)
);

create table public.estimate_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  estimate_id uuid not null,
  description text not null,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  currency char(3) not null default 'USD' check (currency = 'USD'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (line_total = round(quantity * unit_price, 2))
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  customer_id uuid not null,
  job_id uuid,
  estimate_id uuid,
  invoice_number text not null,
  status text not null default 'draft',
  currency char(3) not null default 'USD' check (currency = 'USD'),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  tax_total numeric(12,2) not null check (tax_total >= 0),
  total numeric(12,2) not null check (total >= 0),
  paid_total numeric(12,2) not null default '0' check (paid_total >= 0),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total = subtotal + tax_total),
  check (paid_total <= total)
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  invoice_id uuid not null,
  description text not null,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  currency char(3) not null default 'USD' check (currency = 'USD'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (line_total = round(quantity * unit_price, 2))
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  invoice_id uuid not null,
  provider text not null,
  provider_payment_id text not null,
  amount numeric(12,2) not null check (amount > 0),
  currency char(3) not null default 'USD' check (currency = 'USD'),
  method text,
  status text not null check (status = 'paid'),
  paid_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  job_id uuid not null,
  vendor_id uuid not null,
  payment_id uuid not null,
  amount numeric(12,2) not null check (amount > 0),
  currency char(3) not null default 'USD' check (currency = 'USD'),
  rate numeric(7,4) not null check (rate >= 0 and rate <= 1),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  action_key text not null,
  context_hash text not null,
  context_snapshot jsonb not null,
  requested_by uuid references public.profiles(id) on delete RESTRICT,
  requested_by_service text,
  decided_by uuid references public.profiles(id) on delete RESTRICT,
  decided_by_service text,
  decision text not null default 'pending' check (decision in ('pending','approved','rejected','expired')),
  expires_at timestamptz not null,
  decided_at timestamptz,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((requested_by is null) <> (requested_by_service is null)),
  check ((decision = 'pending' and decided_by is null and decided_by_service is null and decided_at is null) or (decision <> 'pending' and ((decided_by is null) <> (decided_by_service is null)) and decided_at is not null))
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete RESTRICT,
  actor_profile_id uuid references public.profiles(id) on delete SET NULL,
  actor_service text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  outcome text not null,
  context_hash text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((actor_profile_id is null) <> (actor_service is null))
);

create table public.legacy_id_map (
  id uuid primary key default gen_random_uuid(),
  source_collection text not null,
  legacy_id text not null,
  target_table text not null,
  target_id uuid not null,
  source_checksum text not null,
  migration_batch text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index organizations_slug_uidx on public.organizations (slug);
create unique index profiles_email_uidx on public.profiles (email);
create unique index organization_memberships_id_organization_id_uidx on public.organization_memberships (id, organization_id);
create unique index organization_memberships_organization_id_profile_id_uidx on public.organization_memberships (organization_id, profile_id);
create index organization_memberships_organization_id_idx on public.organization_memberships (organization_id);
create index organization_memberships_profile_id_idx on public.organization_memberships (profile_id);
create unique index roles_id_organization_id_uidx on public.roles (id, organization_id);
create unique index roles_organization_id_name_uidx on public.roles (organization_id, name);
create index roles_organization_id_idx on public.roles (organization_id);
create unique index permissions_key_uidx on public.permissions (key);
create unique index role_permissions_id_organization_id_uidx on public.role_permissions (id, organization_id);
create unique index role_permissions_role_id_permission_id_uidx on public.role_permissions (role_id, permission_id);
create index role_permissions_organization_id_idx on public.role_permissions (organization_id);
create index role_permissions_role_id_idx on public.role_permissions (role_id);
create index role_permissions_permission_id_idx on public.role_permissions (permission_id);
create unique index membership_roles_id_organization_id_uidx on public.membership_roles (id, organization_id);
create unique index membership_roles_membership_id_role_id_uidx on public.membership_roles (membership_id, role_id);
create index membership_roles_organization_id_idx on public.membership_roles (organization_id);
create index membership_roles_membership_id_idx on public.membership_roles (membership_id);
create index membership_roles_role_id_idx on public.membership_roles (role_id);
create unique index customers_id_organization_id_uidx on public.customers (id, organization_id);
create index customers_organization_id_idx on public.customers (organization_id);
create unique index leads_id_organization_id_uidx on public.leads (id, organization_id);
create index leads_organization_id_idx on public.leads (organization_id);
create index leads_customer_id_idx on public.leads (customer_id);
create unique index vendors_id_organization_id_uidx on public.vendors (id, organization_id);
create index vendors_organization_id_idx on public.vendors (organization_id);
create unique index technician_profiles_id_organization_id_uidx on public.technician_profiles (id, organization_id);
create index technician_profiles_organization_id_idx on public.technician_profiles (organization_id);
create index technician_profiles_profile_id_idx on public.technician_profiles (profile_id);
create index technician_profiles_vendor_id_idx on public.technician_profiles (vendor_id);
create unique index projects_id_organization_id_uidx on public.projects (id, organization_id);
create index projects_organization_id_idx on public.projects (organization_id);
create index projects_customer_id_idx on public.projects (customer_id);
create index projects_lead_id_idx on public.projects (lead_id);
create unique index jobs_id_organization_id_uidx on public.jobs (id, organization_id);
create index jobs_organization_id_idx on public.jobs (organization_id);
create index jobs_project_id_idx on public.jobs (project_id);
create index jobs_customer_id_idx on public.jobs (customer_id);
create unique index job_assignments_id_organization_id_uidx on public.job_assignments (id, organization_id);
create index job_assignments_organization_id_idx on public.job_assignments (organization_id);
create index job_assignments_job_id_idx on public.job_assignments (job_id);
create index job_assignments_technician_profile_id_idx on public.job_assignments (technician_profile_id);
create index job_assignments_vendor_id_idx on public.job_assignments (vendor_id);
create unique index job_timeline_events_id_organization_id_uidx on public.job_timeline_events (id, organization_id);
create index job_timeline_events_organization_id_idx on public.job_timeline_events (organization_id);
create index job_timeline_events_job_id_idx on public.job_timeline_events (job_id);
create index job_timeline_events_actor_profile_id_idx on public.job_timeline_events (actor_profile_id);
create unique index estimates_id_organization_id_uidx on public.estimates (id, organization_id);
create unique index estimates_id_organization_id_currency_uidx on public.estimates (id, organization_id, currency);
create unique index estimates_organization_id_estimate_number_uidx on public.estimates (organization_id, estimate_number);
create index estimates_organization_id_idx on public.estimates (organization_id);
create index estimates_customer_id_idx on public.estimates (customer_id);
create index estimates_job_id_idx on public.estimates (job_id);
create unique index estimate_items_id_organization_id_uidx on public.estimate_items (id, organization_id);
create unique index estimate_items_id_organization_id_currency_uidx on public.estimate_items (id, organization_id, currency);
create index estimate_items_organization_id_idx on public.estimate_items (organization_id);
create index estimate_items_estimate_id_idx on public.estimate_items (estimate_id);
create unique index invoices_id_organization_id_uidx on public.invoices (id, organization_id);
create unique index invoices_id_organization_id_currency_uidx on public.invoices (id, organization_id, currency);
create unique index invoices_organization_id_invoice_number_uidx on public.invoices (organization_id, invoice_number);
create index invoices_organization_id_idx on public.invoices (organization_id);
create index invoices_customer_id_idx on public.invoices (customer_id);
create index invoices_job_id_idx on public.invoices (job_id);
create index invoices_estimate_id_idx on public.invoices (estimate_id);
create unique index invoice_items_id_organization_id_uidx on public.invoice_items (id, organization_id);
create unique index invoice_items_id_organization_id_currency_uidx on public.invoice_items (id, organization_id, currency);
create index invoice_items_organization_id_idx on public.invoice_items (organization_id);
create index invoice_items_invoice_id_idx on public.invoice_items (invoice_id);
create unique index payments_id_organization_id_uidx on public.payments (id, organization_id);
create unique index payments_id_organization_id_currency_uidx on public.payments (id, organization_id, currency);
create unique index payments_provider_provider_payment_id_uidx on public.payments (provider, provider_payment_id);
create index payments_organization_id_idx on public.payments (organization_id);
create index payments_invoice_id_idx on public.payments (invoice_id);
create unique index commissions_id_organization_id_uidx on public.commissions (id, organization_id);
create unique index commissions_id_organization_id_currency_uidx on public.commissions (id, organization_id, currency);
create index commissions_organization_id_idx on public.commissions (organization_id);
create index commissions_job_id_idx on public.commissions (job_id);
create index commissions_vendor_id_idx on public.commissions (vendor_id);
create index commissions_payment_id_idx on public.commissions (payment_id);
create unique index approval_requests_id_organization_id_uidx on public.approval_requests (id, organization_id);
create index approval_requests_organization_id_idx on public.approval_requests (organization_id);
create index approval_requests_requested_by_idx on public.approval_requests (requested_by);
create index approval_requests_decided_by_idx on public.approval_requests (decided_by);
create unique index audit_logs_id_organization_id_uidx on public.audit_logs (id, organization_id);
create index audit_logs_organization_id_idx on public.audit_logs (organization_id);
create index audit_logs_actor_profile_id_idx on public.audit_logs (actor_profile_id);
create unique index legacy_id_map_source_collection_legacy_id_uidx on public.legacy_id_map (source_collection, legacy_id);
create unique index legacy_id_map_target_table_target_id_uidx on public.legacy_id_map (target_table, target_id);

alter table public.role_permissions add constraint role_permissions_role_id_tenant_fk foreign key (role_id, organization_id) references public.roles(id, organization_id) on delete CASCADE;
alter table public.membership_roles add constraint membership_roles_membership_id_tenant_fk foreign key (membership_id, organization_id) references public.organization_memberships(id, organization_id) on delete CASCADE;
alter table public.membership_roles add constraint membership_roles_role_id_tenant_fk foreign key (role_id, organization_id) references public.roles(id, organization_id) on delete RESTRICT;
alter table public.leads add constraint leads_customer_id_tenant_fk foreign key (customer_id, organization_id) references public.customers(id, organization_id) on delete SET NULL (customer_id);
alter table public.technician_profiles add constraint technician_profiles_vendor_id_tenant_fk foreign key (vendor_id, organization_id) references public.vendors(id, organization_id) on delete SET NULL (vendor_id);
alter table public.projects add constraint projects_customer_id_tenant_fk foreign key (customer_id, organization_id) references public.customers(id, organization_id) on delete RESTRICT;
alter table public.projects add constraint projects_lead_id_tenant_fk foreign key (lead_id, organization_id) references public.leads(id, organization_id) on delete SET NULL (lead_id);
alter table public.jobs add constraint jobs_project_id_tenant_fk foreign key (project_id, organization_id) references public.projects(id, organization_id) on delete SET NULL (project_id);
alter table public.jobs add constraint jobs_customer_id_tenant_fk foreign key (customer_id, organization_id) references public.customers(id, organization_id) on delete RESTRICT;
alter table public.job_assignments add constraint job_assignments_job_id_tenant_fk foreign key (job_id, organization_id) references public.jobs(id, organization_id) on delete CASCADE;
alter table public.job_assignments add constraint job_assignments_technician_profile_id_tenant_fk foreign key (technician_profile_id, organization_id) references public.technician_profiles(id, organization_id) on delete RESTRICT;
alter table public.job_assignments add constraint job_assignments_vendor_id_tenant_fk foreign key (vendor_id, organization_id) references public.vendors(id, organization_id) on delete SET NULL (vendor_id);
alter table public.job_timeline_events add constraint job_timeline_events_job_id_tenant_fk foreign key (job_id, organization_id) references public.jobs(id, organization_id) on delete CASCADE;
alter table public.estimates add constraint estimates_customer_id_tenant_fk foreign key (customer_id, organization_id) references public.customers(id, organization_id) on delete RESTRICT;
alter table public.estimates add constraint estimates_job_id_tenant_fk foreign key (job_id, organization_id) references public.jobs(id, organization_id) on delete SET NULL (job_id);
alter table public.estimate_items add constraint estimate_items_estimate_id_tenant_fk foreign key (estimate_id, organization_id, currency) references public.estimates(id, organization_id, currency) on delete CASCADE;
alter table public.invoices add constraint invoices_customer_id_tenant_fk foreign key (customer_id, organization_id) references public.customers(id, organization_id) on delete RESTRICT;
alter table public.invoices add constraint invoices_job_id_tenant_fk foreign key (job_id, organization_id) references public.jobs(id, organization_id) on delete SET NULL (job_id);
alter table public.invoices add constraint invoices_estimate_id_tenant_fk foreign key (estimate_id, organization_id, currency) references public.estimates(id, organization_id, currency) on delete SET NULL (estimate_id);
alter table public.invoice_items add constraint invoice_items_invoice_id_tenant_fk foreign key (invoice_id, organization_id, currency) references public.invoices(id, organization_id, currency) on delete RESTRICT;
alter table public.payments add constraint payments_invoice_id_tenant_fk foreign key (invoice_id, organization_id, currency) references public.invoices(id, organization_id, currency) on delete RESTRICT;
alter table public.commissions add constraint commissions_job_id_tenant_fk foreign key (job_id, organization_id) references public.jobs(id, organization_id) on delete RESTRICT;
alter table public.commissions add constraint commissions_vendor_id_tenant_fk foreign key (vendor_id, organization_id) references public.vendors(id, organization_id) on delete RESTRICT;
alter table public.commissions add constraint commissions_payment_id_tenant_fk foreign key (payment_id, organization_id, currency) references public.payments(id, organization_id, currency) on delete RESTRICT;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.validate_estimate_totals()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    if new.subtotal <> 0 or new.total <> new.tax_total then raise exception 'estimate totals must start at zero subtotal'; end if;
  elsif pg_trigger_depth() = 1 then
    if new.subtotal is distinct from old.subtotal or new.total <> old.subtotal + new.tax_total then
      raise exception 'estimate totals are system-maintained';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.validate_invoice_totals()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    if new.subtotal <> 0 or new.paid_total <> 0 or new.total <> new.tax_total then raise exception 'invoice totals must start at zero subtotal and paid total'; end if;
  elsif pg_trigger_depth() = 1 then
    if new.subtotal is distinct from old.subtotal
       or new.paid_total is distinct from old.paid_total
       or new.total <> old.subtotal + new.tax_total then
      raise exception 'invoice totals are system-maintained';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.validate_payment()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare invoice_total numeric(12,2);
begin
  if new.status is distinct from 'paid' then raise exception 'payments ledger accepts only paid records'; end if;
  new.paid_at := now();
  update public.invoices
     set paid_total = paid_total + new.amount
   where id = new.invoice_id
     and organization_id = new.organization_id
     and paid_total + new.amount <= total
  returning total into invoice_total;
  if invoice_total is null then raise exception 'payment exceeds invoice total or invoice not found'; end if;
  return new;
end;
$$;

create or replace function public.validate_commission()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare expected_amount numeric(12,2); invoice_job_id uuid;
begin
  select round(payment.amount * new.rate, 2), invoice.job_id
    into expected_amount, invoice_job_id
  from public.payments payment
  join public.invoices invoice on invoice.id = payment.invoice_id and invoice.organization_id = payment.organization_id
  where payment.id = new.payment_id
    and payment.organization_id = new.organization_id
    and payment.status = 'paid'
    and payment.paid_at is not null;
  if expected_amount is null or new.amount <> expected_amount then raise exception 'commission amount does not reconcile'; end if;
  if invoice_job_id is null or new.job_id <> invoice_job_id then raise exception 'commission job does not match payment invoice'; end if;
  return new;
end;
$$;

create or replace function public.sync_estimate_totals()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare delta numeric(12,2); target_id uuid; target_org uuid;
begin
  if tg_op = 'INSERT' then
    delta := new.line_total; target_id := new.estimate_id; target_org := new.organization_id;
  elsif tg_op = 'DELETE' then
    delta := -old.line_total; target_id := old.estimate_id; target_org := old.organization_id;
  else
    if new.estimate_id is distinct from old.estimate_id or new.organization_id is distinct from old.organization_id then
      raise exception 'estimate line ownership is immutable';
    end if;
    delta := new.line_total - old.line_total; target_id := new.estimate_id; target_org := new.organization_id;
  end if;
  update public.estimates set subtotal = subtotal + delta, total = total + delta where id = target_id and organization_id = target_org;
  if not found then raise exception 'estimate parent not found'; end if;
  return null;
end;
$$;

create or replace function public.sync_invoice_totals()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare delta numeric(12,2); target_id uuid; target_org uuid;
begin
  if tg_op = 'INSERT' then
    delta := new.line_total; target_id := new.invoice_id; target_org := new.organization_id;
  elsif tg_op = 'DELETE' then
    delta := -old.line_total; target_id := old.invoice_id; target_org := old.organization_id;
  else
    if new.invoice_id is distinct from old.invoice_id or new.organization_id is distinct from old.organization_id then
      raise exception 'invoice line ownership is immutable';
    end if;
    delta := new.line_total - old.line_total; target_id := new.invoice_id; target_org := new.organization_id;
  end if;
  update public.invoices set subtotal = subtotal + delta, total = total + delta where id = target_id and organization_id = target_org;
  if not found then raise exception 'invoice parent not found'; end if;
  return null;
end;
$$;

revoke all on function public.touch_updated_at() from public;
revoke all on function public.validate_estimate_totals() from public;
revoke all on function public.validate_invoice_totals() from public;
revoke all on function public.validate_payment() from public;
revoke all on function public.validate_commission() from public;
revoke all on function public.sync_estimate_totals() from public;
revoke all on function public.sync_invoice_totals() from public;
create trigger organizations_touch_updated_at before update on public.organizations for each row execute function public.touch_updated_at();
create trigger profiles_touch_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
create trigger organization_memberships_touch_updated_at before update on public.organization_memberships for each row execute function public.touch_updated_at();
create trigger roles_touch_updated_at before update on public.roles for each row execute function public.touch_updated_at();
create trigger permissions_touch_updated_at before update on public.permissions for each row execute function public.touch_updated_at();
create trigger role_permissions_touch_updated_at before update on public.role_permissions for each row execute function public.touch_updated_at();
create trigger membership_roles_touch_updated_at before update on public.membership_roles for each row execute function public.touch_updated_at();
create trigger customers_touch_updated_at before update on public.customers for each row execute function public.touch_updated_at();
create trigger leads_touch_updated_at before update on public.leads for each row execute function public.touch_updated_at();
create trigger vendors_touch_updated_at before update on public.vendors for each row execute function public.touch_updated_at();
create trigger technician_profiles_touch_updated_at before update on public.technician_profiles for each row execute function public.touch_updated_at();
create trigger projects_touch_updated_at before update on public.projects for each row execute function public.touch_updated_at();
create trigger jobs_touch_updated_at before update on public.jobs for each row execute function public.touch_updated_at();
create trigger job_assignments_touch_updated_at before update on public.job_assignments for each row execute function public.touch_updated_at();
create trigger job_timeline_events_touch_updated_at before update on public.job_timeline_events for each row execute function public.touch_updated_at();
create trigger estimates_touch_updated_at before update on public.estimates for each row execute function public.touch_updated_at();
create trigger estimate_items_touch_updated_at before update on public.estimate_items for each row execute function public.touch_updated_at();
create trigger invoices_touch_updated_at before update on public.invoices for each row execute function public.touch_updated_at();
create trigger invoice_items_touch_updated_at before update on public.invoice_items for each row execute function public.touch_updated_at();
create trigger payments_touch_updated_at before update on public.payments for each row execute function public.touch_updated_at();
create trigger commissions_touch_updated_at before update on public.commissions for each row execute function public.touch_updated_at();
create trigger approval_requests_touch_updated_at before update on public.approval_requests for each row execute function public.touch_updated_at();
create trigger audit_logs_touch_updated_at before update on public.audit_logs for each row execute function public.touch_updated_at();
create trigger legacy_id_map_touch_updated_at before update on public.legacy_id_map for each row execute function public.touch_updated_at();
create trigger estimates_validate_totals before insert or update on public.estimates for each row execute function public.validate_estimate_totals();
create trigger invoices_validate_totals before insert or update on public.invoices for each row execute function public.validate_invoice_totals();
create trigger estimate_items_sync_totals after insert or update or delete on public.estimate_items for each row execute function public.sync_estimate_totals();
create trigger invoice_items_sync_totals after insert or update or delete on public.invoice_items for each row execute function public.sync_invoice_totals();
create trigger payments_validate before insert on public.payments for each row execute function public.validate_payment();
create trigger commissions_validate before insert on public.commissions for each row execute function public.validate_commission();

comment on table public.job_timeline_events is 'Append-only business record. Corrections require a reviewed reversal record.';
comment on table public.payments is 'Append-only business record. Corrections require a reviewed reversal record.';
comment on table public.commissions is 'Append-only business record. Corrections require a reviewed reversal record.';
comment on table public.audit_logs is 'Append-only business record. Corrections require a reviewed reversal record.';

commit;
