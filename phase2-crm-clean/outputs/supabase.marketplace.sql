create table if not exists marketplace_leads (
  id text primary key,
  created_at timestamptz default now(),
  name text,
  phone text,
  email text,
  service text,
  address text,
  notes text,
  preferred_date text,
  message text,
  status text,
  qualification jsonb,
  source text
);

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
  contact text,
  status text
);

create table if not exists marketplace_estimates (
  id text primary key,
  created_at timestamptz default now(),
  customer_name text,
  email text,
  service text,
  city text,
  property_type text,
  units numeric,
  unit_label text,
  labor_hours numeric,
  material_estimate numeric,
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
