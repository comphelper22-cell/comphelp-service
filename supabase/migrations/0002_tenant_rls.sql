-- CompHelp tenant isolation, evidence integrity, and permission policies.
-- Client access is denied by default; policies target authenticated users only.
begin;

create or replace function public.is_org_member(_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    join public.profiles profile on profile.id = membership.profile_id
    join public.organizations organization on organization.id = membership.organization_id
    where membership.organization_id = _organization_id
      and membership.profile_id = auth.uid()
      and membership.status = 'active'
      and profile.status = 'active'
      and organization.status = 'active'
  );
$$;

create or replace function public.has_org_permission(_organization_id uuid, _permission_key text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    join public.profiles profile on profile.id = membership.profile_id
    join public.organizations organization on organization.id = membership.organization_id
    join public.membership_roles membership_role
      on membership_role.membership_id = membership.id
     and membership_role.organization_id = membership.organization_id
    join public.roles role
      on role.id = membership_role.role_id
     and role.organization_id = membership.organization_id
     and role.status = 'active'
    join public.role_permissions role_permission
      on role_permission.role_id = role.id
     and role_permission.organization_id = membership.organization_id
    join public.permissions permission on permission.id = role_permission.permission_id
    where membership.organization_id = _organization_id
      and membership.profile_id = auth.uid()
      and membership.status = 'active'
      and profile.status = 'active'
      and organization.status = 'active'
      and permission.key = _permission_key
  );
$$;

create or replace function public.prevent_organization_transfer()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if new.organization_id is distinct from old.organization_id then
    raise exception 'organization_id is immutable';
  end if;
  return new;
end;
$$;

create or replace function public.prevent_append_only_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  raise exception '% is append-only', tg_table_name;
end;
$$;

create or replace function public.stamp_client_evidence()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.occurred_at := now();
  new.created_at := now();
  new.updated_at := now();
  if auth.uid() is not null then
    new.actor_profile_id := auth.uid();
    new.actor_service := null;
  else
    new.actor_profile_id := null;
    new.actor_service := current_user;
  end if;
  return new;
end;
$$;

create or replace function public.protect_approval_request()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    if new.expires_at <= now() then raise exception 'approval request must expire in the future'; end if;
    new.created_at := now();
    new.updated_at := now();
    if auth.uid() is not null then
      new.requested_by := auth.uid();
      new.requested_by_service := null;
    else
      new.requested_by := null;
      new.requested_by_service := current_user;
    end if;
    new.decision := 'pending';
    new.decided_by := null;
    new.decided_by_service := null;
    new.decided_at := null;
    return new;
  end if;

  if new.organization_id is distinct from old.organization_id
     or new.action_key is distinct from old.action_key
     or new.context_hash is distinct from old.context_hash
     or new.context_snapshot is distinct from old.context_snapshot
     or new.requested_by is distinct from old.requested_by
     or new.requested_by_service is distinct from old.requested_by_service
     or new.expires_at is distinct from old.expires_at
     or new.created_at is distinct from old.created_at then
    raise exception 'approval request evidence is immutable';
  end if;
  if old.decision <> 'pending' then raise exception 'invalid approval decision transition'; end if;
  if new.decision = 'expired' then
    if auth.uid() is not null or old.expires_at > now() then raise exception 'only the service may expire an elapsed request'; end if;
  elsif new.decision in ('approved', 'rejected') then
    if old.expires_at <= now() then raise exception 'approval request has expired'; end if;
  else
    raise exception 'invalid approval decision transition';
  end if;
  if auth.uid() is not null then
    new.decided_by := auth.uid();
    new.decided_by_service := null;
  else
    new.decided_by := null;
    new.decided_by_service := current_user;
  end if;
  new.decided_at := now();
  return new;
end;
$$;

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.has_org_permission(uuid, text) from public;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_permission(uuid, text) to authenticated;

alter table public.organizations enable row level security;
alter table public.organizations force row level security;
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_memberships force row level security;
alter table public.roles enable row level security;
alter table public.roles force row level security;
alter table public.permissions enable row level security;
alter table public.permissions force row level security;
alter table public.role_permissions enable row level security;
alter table public.role_permissions force row level security;
alter table public.membership_roles enable row level security;
alter table public.membership_roles force row level security;
alter table public.customers enable row level security;
alter table public.customers force row level security;
alter table public.leads enable row level security;
alter table public.leads force row level security;
alter table public.vendors enable row level security;
alter table public.vendors force row level security;
alter table public.technician_profiles enable row level security;
alter table public.technician_profiles force row level security;
alter table public.projects enable row level security;
alter table public.projects force row level security;
alter table public.jobs enable row level security;
alter table public.jobs force row level security;
alter table public.job_assignments enable row level security;
alter table public.job_assignments force row level security;
alter table public.job_timeline_events enable row level security;
alter table public.job_timeline_events force row level security;
alter table public.estimates enable row level security;
alter table public.estimates force row level security;
alter table public.estimate_items enable row level security;
alter table public.estimate_items force row level security;
alter table public.invoices enable row level security;
alter table public.invoices force row level security;
alter table public.invoice_items enable row level security;
alter table public.invoice_items force row level security;
alter table public.payments enable row level security;
alter table public.payments force row level security;
alter table public.commissions enable row level security;
alter table public.commissions force row level security;
alter table public.approval_requests enable row level security;
alter table public.approval_requests force row level security;
alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;
alter table public.legacy_id_map enable row level security;
alter table public.legacy_id_map force row level security;
create trigger organization_memberships_organization_immutable before update on public.organization_memberships for each row execute function public.prevent_organization_transfer();
create trigger roles_organization_immutable before update on public.roles for each row execute function public.prevent_organization_transfer();
create trigger role_permissions_organization_immutable before update on public.role_permissions for each row execute function public.prevent_organization_transfer();
create trigger membership_roles_organization_immutable before update on public.membership_roles for each row execute function public.prevent_organization_transfer();
create trigger customers_organization_immutable before update on public.customers for each row execute function public.prevent_organization_transfer();
create trigger leads_organization_immutable before update on public.leads for each row execute function public.prevent_organization_transfer();
create trigger vendors_organization_immutable before update on public.vendors for each row execute function public.prevent_organization_transfer();
create trigger technician_profiles_organization_immutable before update on public.technician_profiles for each row execute function public.prevent_organization_transfer();
create trigger projects_organization_immutable before update on public.projects for each row execute function public.prevent_organization_transfer();
create trigger jobs_organization_immutable before update on public.jobs for each row execute function public.prevent_organization_transfer();
create trigger job_assignments_organization_immutable before update on public.job_assignments for each row execute function public.prevent_organization_transfer();
create trigger job_timeline_events_organization_immutable before update on public.job_timeline_events for each row execute function public.prevent_organization_transfer();
create trigger estimates_organization_immutable before update on public.estimates for each row execute function public.prevent_organization_transfer();
create trigger estimate_items_organization_immutable before update on public.estimate_items for each row execute function public.prevent_organization_transfer();
create trigger invoices_organization_immutable before update on public.invoices for each row execute function public.prevent_organization_transfer();
create trigger invoice_items_organization_immutable before update on public.invoice_items for each row execute function public.prevent_organization_transfer();
create trigger payments_organization_immutable before update on public.payments for each row execute function public.prevent_organization_transfer();
create trigger commissions_organization_immutable before update on public.commissions for each row execute function public.prevent_organization_transfer();
create trigger approval_requests_organization_immutable before update on public.approval_requests for each row execute function public.prevent_organization_transfer();
create trigger audit_logs_organization_immutable before update on public.audit_logs for each row execute function public.prevent_organization_transfer();
create trigger job_timeline_events_append_only before update or delete on public.job_timeline_events for each row execute function public.prevent_append_only_mutation();
create trigger payments_append_only before update or delete on public.payments for each row execute function public.prevent_append_only_mutation();
create trigger commissions_append_only before update or delete on public.commissions for each row execute function public.prevent_append_only_mutation();
create trigger audit_logs_append_only before update or delete on public.audit_logs for each row execute function public.prevent_append_only_mutation();
create trigger job_timeline_events_stamp before insert on public.job_timeline_events for each row execute function public.stamp_client_evidence();
create trigger audit_logs_stamp before insert on public.audit_logs for each row execute function public.stamp_client_evidence();
create trigger approval_requests_protect before insert or update on public.approval_requests for each row execute function public.protect_approval_request();

create policy profiles_self_select on public.profiles for select to authenticated using (id = auth.uid() and status = 'active');
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid() and status = 'active') with check (id = auth.uid() and status = 'active');
create policy organizations_member_select on public.organizations for select to authenticated using (public.is_org_member(id));
create policy permissions_authenticated_select on public.permissions for select to authenticated using (auth.uid() is not null);

create policy organization_memberships_authorized_select on public.organization_memberships for select to authenticated using (public.has_org_permission(organization_id, 'organization.manage_members'));

create policy roles_authorized_select on public.roles for select to authenticated using (public.has_org_permission(organization_id, 'organization.manage_roles'));

create policy role_permissions_authorized_select on public.role_permissions for select to authenticated using (public.has_org_permission(organization_id, 'organization.manage_roles'));

create policy membership_roles_authorized_select on public.membership_roles for select to authenticated using (public.has_org_permission(organization_id, 'organization.manage_roles'));

create policy customers_authorized_select on public.customers for select to authenticated using (public.has_org_permission(organization_id, 'crm.read'));
create policy customers_authorized_insert on public.customers for insert to authenticated with check (public.has_org_permission(organization_id, 'crm.manage'));
create policy customers_authorized_update on public.customers for update to authenticated using (public.has_org_permission(organization_id, 'crm.manage')) with check (public.has_org_permission(organization_id, 'crm.manage'));
create policy customers_authorized_delete on public.customers for delete to authenticated using (public.has_org_permission(organization_id, 'crm.manage'));

create policy leads_authorized_select on public.leads for select to authenticated using (public.has_org_permission(organization_id, 'crm.read'));
create policy leads_authorized_insert on public.leads for insert to authenticated with check (public.has_org_permission(organization_id, 'crm.manage'));
create policy leads_authorized_update on public.leads for update to authenticated using (public.has_org_permission(organization_id, 'crm.manage')) with check (public.has_org_permission(organization_id, 'crm.manage'));
create policy leads_authorized_delete on public.leads for delete to authenticated using (public.has_org_permission(organization_id, 'crm.manage'));

create policy vendors_authorized_select on public.vendors for select to authenticated using (public.has_org_permission(organization_id, 'operations.read'));
create policy vendors_authorized_insert on public.vendors for insert to authenticated with check (public.has_org_permission(organization_id, 'operations.manage'));
create policy vendors_authorized_update on public.vendors for update to authenticated using (public.has_org_permission(organization_id, 'operations.manage')) with check (public.has_org_permission(organization_id, 'operations.manage'));
create policy vendors_authorized_delete on public.vendors for delete to authenticated using (public.has_org_permission(organization_id, 'operations.manage'));

create policy technician_profiles_authorized_select on public.technician_profiles for select to authenticated using (public.has_org_permission(organization_id, 'operations.read'));
create policy technician_profiles_authorized_insert on public.technician_profiles for insert to authenticated with check (public.has_org_permission(organization_id, 'operations.manage'));
create policy technician_profiles_authorized_update on public.technician_profiles for update to authenticated using (public.has_org_permission(organization_id, 'operations.manage')) with check (public.has_org_permission(organization_id, 'operations.manage'));
create policy technician_profiles_authorized_delete on public.technician_profiles for delete to authenticated using (public.has_org_permission(organization_id, 'operations.manage'));

create policy projects_authorized_select on public.projects for select to authenticated using (public.has_org_permission(organization_id, 'operations.read'));
create policy projects_authorized_insert on public.projects for insert to authenticated with check (public.has_org_permission(organization_id, 'operations.manage'));
create policy projects_authorized_update on public.projects for update to authenticated using (public.has_org_permission(organization_id, 'operations.manage')) with check (public.has_org_permission(organization_id, 'operations.manage'));
create policy projects_authorized_delete on public.projects for delete to authenticated using (public.has_org_permission(organization_id, 'operations.manage'));

create policy jobs_authorized_select on public.jobs for select to authenticated using (public.has_org_permission(organization_id, 'operations.read'));
create policy jobs_authorized_insert on public.jobs for insert to authenticated with check (public.has_org_permission(organization_id, 'operations.manage'));
create policy jobs_authorized_update on public.jobs for update to authenticated using (public.has_org_permission(organization_id, 'operations.manage')) with check (public.has_org_permission(organization_id, 'operations.manage'));
create policy jobs_authorized_delete on public.jobs for delete to authenticated using (public.has_org_permission(organization_id, 'operations.manage'));

create policy job_assignments_authorized_select on public.job_assignments for select to authenticated using (public.has_org_permission(organization_id, 'operations.read'));
create policy job_assignments_authorized_insert on public.job_assignments for insert to authenticated with check (public.has_org_permission(organization_id, 'operations.manage'));
create policy job_assignments_authorized_update on public.job_assignments for update to authenticated using (public.has_org_permission(organization_id, 'operations.manage')) with check (public.has_org_permission(organization_id, 'operations.manage'));
create policy job_assignments_authorized_delete on public.job_assignments for delete to authenticated using (public.has_org_permission(organization_id, 'operations.manage'));

create policy job_timeline_events_authorized_select on public.job_timeline_events for select to authenticated using (public.has_org_permission(organization_id, 'operations.read'));
create policy job_timeline_events_authorized_insert on public.job_timeline_events for insert to authenticated with check (public.has_org_permission(organization_id, 'operations.manage'));

create policy estimates_authorized_select on public.estimates for select to authenticated using (public.has_org_permission(organization_id, 'finance.read'));
create policy estimates_authorized_insert on public.estimates for insert to authenticated with check (public.has_org_permission(organization_id, 'finance.manage'));
create policy estimates_authorized_update on public.estimates for update to authenticated using (public.has_org_permission(organization_id, 'finance.manage')) with check (public.has_org_permission(organization_id, 'finance.manage'));

create policy estimate_items_authorized_select on public.estimate_items for select to authenticated using (public.has_org_permission(organization_id, 'finance.read'));
create policy estimate_items_authorized_insert on public.estimate_items for insert to authenticated with check (public.has_org_permission(organization_id, 'finance.manage'));
create policy estimate_items_authorized_update on public.estimate_items for update to authenticated using (public.has_org_permission(organization_id, 'finance.manage')) with check (public.has_org_permission(organization_id, 'finance.manage'));

create policy invoices_authorized_select on public.invoices for select to authenticated using (public.has_org_permission(organization_id, 'finance.read'));
create policy invoices_authorized_insert on public.invoices for insert to authenticated with check (public.has_org_permission(organization_id, 'finance.manage'));
create policy invoices_authorized_update on public.invoices for update to authenticated using (public.has_org_permission(organization_id, 'finance.manage')) with check (public.has_org_permission(organization_id, 'finance.manage'));

create policy invoice_items_authorized_select on public.invoice_items for select to authenticated using (public.has_org_permission(organization_id, 'finance.read'));
create policy invoice_items_authorized_insert on public.invoice_items for insert to authenticated with check (public.has_org_permission(organization_id, 'finance.manage'));
create policy invoice_items_authorized_update on public.invoice_items for update to authenticated using (public.has_org_permission(organization_id, 'finance.manage')) with check (public.has_org_permission(organization_id, 'finance.manage'));

create policy payments_authorized_select on public.payments for select to authenticated using (public.has_org_permission(organization_id, 'finance.read'));

create policy commissions_authorized_select on public.commissions for select to authenticated using (public.has_org_permission(organization_id, 'finance.read'));

create policy approval_requests_authorized_select on public.approval_requests for select to authenticated using (public.has_org_permission(organization_id, 'approvals.read'));
create policy approval_requests_authorized_insert on public.approval_requests for insert to authenticated with check (public.has_org_permission(organization_id, 'approvals.request'));
create policy approval_requests_authorized_update on public.approval_requests for update to authenticated using (public.has_org_permission(organization_id, 'approvals.decide')) with check (public.has_org_permission(organization_id, 'approvals.decide'));

create policy audit_logs_authorized_select on public.audit_logs for select to authenticated using (public.has_org_permission(organization_id, 'audit.read'));

grant usage on schema public to authenticated;
revoke all on table public.organizations from anon, authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.organization_memberships from anon, authenticated;
revoke all on table public.roles from anon, authenticated;
revoke all on table public.permissions from anon, authenticated;
revoke all on table public.role_permissions from anon, authenticated;
revoke all on table public.membership_roles from anon, authenticated;
revoke all on table public.customers from anon, authenticated;
revoke all on table public.leads from anon, authenticated;
revoke all on table public.vendors from anon, authenticated;
revoke all on table public.technician_profiles from anon, authenticated;
revoke all on table public.projects from anon, authenticated;
revoke all on table public.jobs from anon, authenticated;
revoke all on table public.job_assignments from anon, authenticated;
revoke all on table public.job_timeline_events from anon, authenticated;
revoke all on table public.estimates from anon, authenticated;
revoke all on table public.estimate_items from anon, authenticated;
revoke all on table public.invoices from anon, authenticated;
revoke all on table public.invoice_items from anon, authenticated;
revoke all on table public.payments from anon, authenticated;
revoke all on table public.commissions from anon, authenticated;
revoke all on table public.approval_requests from anon, authenticated;
revoke all on table public.audit_logs from anon, authenticated;
revoke all on table public.legacy_id_map from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name, phone) on table public.profiles to authenticated;
grant select on table public.organizations to authenticated;
grant select on table public.permissions to authenticated;
grant select on table public.organization_memberships to authenticated;
grant select on table public.roles to authenticated;
grant select on table public.role_permissions to authenticated;
grant select on table public.membership_roles to authenticated;
grant select on table public.customers to authenticated;
grant insert, update, delete on table public.customers to authenticated;
grant select on table public.leads to authenticated;
grant insert, update, delete on table public.leads to authenticated;
grant select on table public.vendors to authenticated;
grant insert, update, delete on table public.vendors to authenticated;
grant select on table public.technician_profiles to authenticated;
grant insert, update, delete on table public.technician_profiles to authenticated;
grant select on table public.projects to authenticated;
grant insert, update, delete on table public.projects to authenticated;
grant select on table public.jobs to authenticated;
grant insert, update, delete on table public.jobs to authenticated;
grant select on table public.job_assignments to authenticated;
grant insert, update, delete on table public.job_assignments to authenticated;
grant select on table public.job_timeline_events to authenticated;
grant insert on table public.job_timeline_events to authenticated;
grant select on table public.estimates to authenticated;
grant insert, update on table public.estimates to authenticated;
grant select on table public.estimate_items to authenticated;
grant insert, update on table public.estimate_items to authenticated;
grant select on table public.invoices to authenticated;
grant insert, update on table public.invoices to authenticated;
grant select on table public.invoice_items to authenticated;
grant insert, update on table public.invoice_items to authenticated;
grant select on table public.payments to authenticated;
grant select on table public.commissions to authenticated;
grant select on table public.approval_requests to authenticated;
grant insert, update on table public.approval_requests to authenticated;
grant select on table public.audit_logs to authenticated;
revoke all on function public.prevent_organization_transfer() from public, authenticated;
revoke all on function public.prevent_append_only_mutation() from public, authenticated;
revoke all on function public.stamp_client_evidence() from public, authenticated;
revoke all on function public.protect_approval_request() from public, authenticated;

commit;
