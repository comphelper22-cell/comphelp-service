-- CompHelp AI Sprint 21 database foundation.
-- Review manually before running in Supabase or PostgreSQL.

create extension if not exists "pgcrypto";

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  name text not null,
  email text,
  phone text,
  service_area text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  name text not null,
  email text not null,
  phone text,
  role_id uuid,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  name text not null,
  permissions jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  key text not null,
  description text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  name text not null,
  email text,
  phone text,
  address text,
  city text,
  status text not null default 'lead',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists technicians (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  name text not null,
  email text,
  phone text,
  skills jsonb not null default '[]'::jsonb,
  availability text,
  status text not null default 'available',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  customer_id uuid not null references customers(id),
  technician_id uuid references technicians(id),
  title text not null,
  service text not null,
  scheduled_at timestamptz,
  completed_at timestamptz,
  status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists estimates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  customer_id uuid not null references customers(id),
  job_id uuid references jobs(id),
  service text not null,
  low_total numeric(12,2) default 0,
  high_total numeric(12,2) default 0,
  recommended_total numeric(12,2) default 0,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  customer_id uuid not null references customers(id),
  job_id uuid references jobs(id),
  estimate_id uuid references estimates(id),
  invoice_number text,
  total numeric(12,2) default 0,
  due_at timestamptz,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  invoice_id uuid not null references invoices(id),
  amount numeric(12,2) not null default 0,
  paid_at timestamptz,
  method text,
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  title text not null,
  assigned_to uuid,
  due_at timestamptz,
  priority text,
  status text not null default 'todo',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  attach_type text not null,
  attach_id uuid not null,
  body text not null,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  actor_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  status text not null default 'logged',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  owner_type text,
  owner_id uuid,
  file_name text not null,
  file_url text not null,
  mime_type text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  item_name text not null,
  sku text,
  quantity integer default 0,
  reorder_level integer default 0,
  unit_cost numeric(12,2) default 0,
  status text not null default 'in_stock',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists ai_memory (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references companies(id),
  module text not null,
  memory_type text not null,
  content text not null,
  confidence numeric(5,4),
  status text not null default 'needs_review',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);
