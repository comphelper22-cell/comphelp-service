"use strict";

const fs = require("fs");
const path = require("path");
const { tables } = require("../database/contracts/core-schema-contract");

const readPermissions = Object.freeze({
  organization_memberships: "organization.manage_members",
  roles: "organization.manage_roles",
  role_permissions: "organization.manage_roles",
  membership_roles: "organization.manage_roles",
  customers: "crm.read",
  leads: "crm.read",
  vendors: "operations.read",
  technician_profiles: "operations.read",
  projects: "operations.read",
  jobs: "operations.read",
  job_assignments: "operations.read",
  job_timeline_events: "operations.read",
  estimates: "finance.read",
  estimate_items: "finance.read",
  invoices: "finance.read",
  invoice_items: "finance.read",
  payments: "finance.read",
  commissions: "finance.read",
  approval_requests: "approvals.read",
  audit_logs: "audit.read"
});

const writePermissions = Object.freeze({
  customers: "crm.manage",
  leads: "crm.manage",
  vendors: "operations.manage",
  technician_profiles: "operations.manage",
  projects: "operations.manage",
  jobs: "operations.manage",
  job_assignments: "operations.manage",
  job_timeline_events: "operations.manage",
  estimates: "finance.manage",
  estimate_items: "finance.manage",
  invoices: "finance.manage",
  invoice_items: "finance.manage",
  approval_requests: "approvals.request"
});

const serverOnlyMutationTables = new Set([
  "organization_memberships",
  "roles",
  "role_permissions",
  "membership_roles",
  "payments",
  "commissions",
  "audit_logs"
]);

function identifier(value) {
  if (!/^[a-z][a-z0-9_]*$/.test(value)) throw new Error(`Unsafe SQL identifier: ${value}`);
  return value;
}

function literal(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function policy(name, table, operation, usingExpression, checkExpression) {
  const parts = [`create policy ${identifier(name)} on public.${identifier(table)} for ${operation} to authenticated`];
  if (usingExpression) parts.push(`using (${usingExpression})`);
  if (checkExpression) parts.push(`with check (${checkExpression})`);
  return `${parts.join(" ")};`;
}

function securityFunctions() {
  return [`create or replace function public.is_org_member(_organization_id uuid)
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
$$;`,
  `create or replace function public.has_org_permission(_organization_id uuid, _permission_key text)
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
$$;`,
  `create or replace function public.prevent_organization_transfer()
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
$$;`,
  `create or replace function public.prevent_append_only_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  raise exception '% is append-only', tg_table_name;
end;
$$;`,
  `create or replace function public.stamp_client_evidence()
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
$$;`,
  `create or replace function public.protect_approval_request()
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
$$;`];
}

function generate() {
  const lines = [
    "-- CompHelp tenant isolation, evidence integrity, and permission policies.",
    "-- Client access is denied by default; policies target authenticated users only.",
    "begin;",
    "",
    ...securityFunctions().flatMap((sql) => [sql, ""]),
    "revoke all on function public.is_org_member(uuid) from public;",
    "revoke all on function public.has_org_permission(uuid, text) from public;",
    "grant execute on function public.is_org_member(uuid) to authenticated;",
    "grant execute on function public.has_org_permission(uuid, text) to authenticated;",
    ""
  ];

  for (const table of tables) {
    lines.push(`alter table public.${identifier(table.name)} enable row level security;`);
    lines.push(`alter table public.${identifier(table.name)} force row level security;`);
  }

  for (const table of tables.filter((item) => item.tenantScoped)) {
    lines.push(`create trigger ${identifier(`${table.name}_organization_immutable`)} before update on public.${identifier(table.name)} for each row execute function public.prevent_organization_transfer();`);
  }
  for (const tableName of ["job_timeline_events", "payments", "commissions", "audit_logs"]) {
    lines.push(`create trigger ${tableName}_append_only before update or delete on public.${tableName} for each row execute function public.prevent_append_only_mutation();`);
  }
  lines.push("create trigger job_timeline_events_stamp before insert on public.job_timeline_events for each row execute function public.stamp_client_evidence();");
  lines.push("create trigger audit_logs_stamp before insert on public.audit_logs for each row execute function public.stamp_client_evidence();");
  lines.push("create trigger approval_requests_protect before insert or update on public.approval_requests for each row execute function public.protect_approval_request();");

  lines.push("", policy("profiles_self_select", "profiles", "select", "id = auth.uid() and status = 'active'"));
  lines.push(policy("profiles_self_update", "profiles", "update", "id = auth.uid() and status = 'active'", "id = auth.uid() and status = 'active'"));
  lines.push(policy("organizations_member_select", "organizations", "select", "public.is_org_member(id)"));
  lines.push(policy("permissions_authenticated_select", "permissions", "select", "auth.uid() is not null"));

  for (const table of tables.filter((item) => item.tenantScoped)) {
    const tableName = table.name;
    const readPermission = readPermissions[tableName];
    if (!readPermission) throw new Error(`Missing read permission for ${tableName}`);
    lines.push("");
    lines.push(policy(`${tableName}_authorized_select`, tableName, "select", `public.has_org_permission(organization_id, ${literal(readPermission)})`));

    if (serverOnlyMutationTables.has(tableName)) continue;
    const writePermission = writePermissions[tableName];
    if (!writePermission) throw new Error(`Missing write permission for ${tableName}`);
    lines.push(policy(`${tableName}_authorized_insert`, tableName, "insert", null, `public.has_org_permission(organization_id, ${literal(writePermission)})`));
    if (!table.appendOnly) {
      const updatePermission = tableName === "approval_requests" ? "approvals.decide" : writePermission;
      lines.push(policy(`${tableName}_authorized_update`, tableName, "update", `public.has_org_permission(organization_id, ${literal(updatePermission)})`, `public.has_org_permission(organization_id, ${literal(updatePermission)})`));
      if (!table.financial && tableName !== "approval_requests") {
        lines.push(policy(`${tableName}_authorized_delete`, tableName, "delete", `public.has_org_permission(organization_id, ${literal(writePermission)})`));
      }
    }
  }

  lines.push("", "grant usage on schema public to authenticated;");
  for (const table of tables) {
    lines.push(`revoke all on table public.${identifier(table.name)} from anon, authenticated;`);
  }
  lines.push("grant select on table public.profiles to authenticated;");
  lines.push("grant update (display_name, phone) on table public.profiles to authenticated;");
  lines.push("grant select on table public.organizations to authenticated;");
  lines.push("grant select on table public.permissions to authenticated;");
  for (const table of tables.filter((item) => item.tenantScoped)) {
    const tableName = identifier(table.name);
    lines.push(`grant select on table public.${tableName} to authenticated;`);
    if (serverOnlyMutationTables.has(table.name)) continue;
    const privileges = ["insert"];
    if (!table.appendOnly) privileges.push("update");
    if (!table.appendOnly && !table.financial && table.name !== "approval_requests") privileges.push("delete");
    lines.push(`grant ${privileges.join(", ")} on table public.${tableName} to authenticated;`);
  }
  for (const functionSignature of [
    "prevent_organization_transfer()",
    "prevent_append_only_mutation()",
    "stamp_client_evidence()",
    "protect_approval_request()"
  ]) {
    lines.push(`revoke all on function public.${functionSignature} from public, authenticated;`);
  }
  lines.push("", "commit;", "");
  return lines.join("\n");
}

function writeMigration() {
  const outputPath = path.join(__dirname, "..", "supabase", "migrations", "0002_tenant_rls.sql");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, generate(), "utf8");
  return outputPath;
}

if (require.main === module) {
  const outputPath = writeMigration();
  console.log(JSON.stringify({ ok: true, outputPath, protectedTables: tables.length }, null, 2));
}

module.exports = { generate, readPermissions, serverOnlyMutationTables, writeMigration, writePermissions };
