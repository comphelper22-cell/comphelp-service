-- Demo seed data only. Do not run against production without review.

insert into companies (id, name, email, phone, service_area, status)
values ('00000000-0000-0000-0000-000000000001', 'CompHelp AI Demo Company', 'demo@example.com', '+1-747-295-1440', 'Los Angeles County', 'active')
on conflict (id) do nothing;

insert into roles (id, organization_id, name, permissions, status)
values ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Owner', '["admin"]'::jsonb, 'active')
on conflict (id) do nothing;

insert into customers (id, organization_id, name, email, phone, city, status)
values ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Demo Customer', 'customer@example.com', '+1-555-000-0000', 'Los Angeles', 'lead')
on conflict (id) do nothing;

insert into jobs (id, organization_id, customer_id, title, service, status)
values ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', 'Demo camera installation', 'Security Camera Installation', 'new')
on conflict (id) do nothing;
