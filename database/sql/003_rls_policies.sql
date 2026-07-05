-- RLS examples only. Review before enabling in production.

alter table companies enable row level security;
alter table users enable row level security;
alter table roles enable row level security;
alter table permissions enable row level security;
alter table customers enable row level security;
alter table technicians enable row level security;
alter table jobs enable row level security;
alter table estimates enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table tasks enable row level security;
alter table notes enable row level security;
alter table activities enable row level security;
alter table files enable row level security;
alter table inventory enable row level security;
alter table ai_memory enable row level security;

-- Example policy pattern:
-- create policy tenant_select_customers on customers
-- for select using (organization_id = current_setting('app.organization_id')::uuid);
--
-- create policy tenant_write_customers on customers
-- for all using (organization_id = current_setting('app.organization_id')::uuid)
-- with check (organization_id = current_setting('app.organization_id')::uuid);
