-- Indexes for CompHelp AI database foundation.

create index if not exists idx_users_org on users(organization_id) where deleted_at is null;
create index if not exists idx_customers_org_status on customers(organization_id, status) where deleted_at is null;
create index if not exists idx_customers_search on customers using gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(email,'') || ' ' || coalesce(phone,'')));
create index if not exists idx_technicians_org_status on technicians(organization_id, status) where deleted_at is null;
create index if not exists idx_jobs_org_status on jobs(organization_id, status) where deleted_at is null;
create index if not exists idx_jobs_customer on jobs(customer_id) where deleted_at is null;
create index if not exists idx_estimates_org_status on estimates(organization_id, status) where deleted_at is null;
create index if not exists idx_invoices_org_status on invoices(organization_id, status) where deleted_at is null;
create index if not exists idx_payments_invoice on payments(invoice_id) where deleted_at is null;
create index if not exists idx_tasks_org_status on tasks(organization_id, status) where deleted_at is null;
create index if not exists idx_notes_attachment on notes(attach_type, attach_id) where deleted_at is null;
create index if not exists idx_activities_org_created on activities(organization_id, created_at desc) where deleted_at is null;
create index if not exists idx_files_owner on files(owner_type, owner_id) where deleted_at is null;
create index if not exists idx_inventory_org_status on inventory(organization_id, status) where deleted_at is null;
create index if not exists idx_ai_memory_org_module on ai_memory(organization_id, module, memory_type) where deleted_at is null;
