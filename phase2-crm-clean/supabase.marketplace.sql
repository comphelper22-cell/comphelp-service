create table if not exists marketplace_leads (
  id text primary key,
  created_at timestamptz default now(),
  name text,
  phone text,
  email text,
  instagram text,
  tiktok text,
  service text,
  city text,
  address text,
  notes text,
  preferred_date text,
  message text,
  status text,
  qualification jsonb,
  source text
);

alter table marketplace_leads add column if not exists instagram text;
alter table marketplace_leads add column if not exists tiktok text;
alter table marketplace_leads add column if not exists city text;

create table if not exists marketplace_vendors (
  id text primary key,
  created_at timestamptz default now(),
  name text,
  category text,
  services jsonb,
  phone text,
  email text,
  website text,
  service_area text,
  commission_percent numeric,
  city text,
  distance_miles numeric,
  rating numeric,
  availability text,
  notes text,
  contact text,
  status text
);

alter table marketplace_vendors add column if not exists notes text;

create table if not exists marketplace_estimates (
  id text primary key,
  created_at timestamptz default now(),
  customer_name text,
  email text,
  service text,
  city text,
  job_size text,
  property_type text,
  units numeric,
  unit_label text,
  number_of_cameras_devices numeric,
  labor_hours numeric,
  labor_cost numeric,
  material_estimate numeric,
  material_cost numeric,
  profit_margin numeric,
  commission_percent numeric,
  commission numeric,
  internal_cost numeric,
  target_profit numeric,
  expected_profit numeric,
  urgency text,
  low numeric,
  high numeric,
  recommended numeric,
  range text,
  customer_quote_text text,
  internal_notes text,
  notes text,
  disclaimer text
);

alter table marketplace_estimates add column if not exists job_size text;
alter table marketplace_estimates add column if not exists number_of_cameras_devices numeric;
alter table marketplace_estimates add column if not exists material_cost numeric;

create table if not exists marketplace_quote_requests (
  id text primary key,
  created_at timestamptz default now(),
  lead_id text,
  project_id text,
  service text,
  category text,
  city text,
  scope text,
  status text,
  vendor_responses jsonb,
  vendor_options jsonb
);

create table if not exists marketplace_commissions (
  id text primary key,
  created_at timestamptz default now(),
  job_name text,
  vendor_name text,
  vendor_selected text,
  project_value numeric,
  revenue numeric,
  commission_rate numeric,
  commission_percent numeric,
  expected_commission numeric,
  paid_commission numeric,
  payment_status text,
  follow_up_date text,
  status text
);

create table if not exists marketplace_projects (
  id text primary key,
  created_at timestamptz default now(),
  customer_name text,
  service text,
  title text,
  city text,
  status text,
  completion_date text,
  follow_up_date text,
  notes text,
  before_after_notes text,
  customer_review text,
  gallery_items jsonb,
  media_plan jsonb,
  reminders jsonb
);

create table if not exists marketplace_marketing_ideas (
  id text primary key,
  created_at timestamptz default now(),
  service text,
  city text,
  competitors text,
  ideas jsonb
);

create table if not exists marketplace_media_reviews (
  id text primary key,
  created_at timestamptz default now(),
  service text,
  city text,
  media_type text,
  notes text,
  plan jsonb
);

create table if not exists marketplace_source_leads (
  id text primary key,
  created_at timestamptz default now(),
  source text,
  query text,
  city text,
  category text,
  service_need text,
  search_url text,
  status text,
  approved boolean default false,
  notes text
);

create table if not exists marketplace_dispatches (
  id text primary key,
  created_at timestamptz default now(),
  service text,
  customer_name text,
  city text,
  route_type text,
  selected_vendor_draft jsonb,
  top_vendors jsonb,
  vendor_quote_request_draft text,
  customer_price numeric,
  vendor_expected_price numeric,
  commission_percent numeric,
  expected_commission numeric,
  status text,
  owner_approval_required boolean default true,
  recommendation text
);

create table if not exists marketplace_followups (
  id text primary key,
  created_at timestamptz default now(),
  customer_name text,
  service text,
  recipient text,
  day numeric,
  label text,
  channel text,
  timing text,
  status text,
  message text
);
