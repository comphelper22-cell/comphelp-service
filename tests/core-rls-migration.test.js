const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { tables } = require("../database/contracts/core-schema-contract");

const rlsPath = path.join(__dirname, "..", "supabase", "migrations", "0002_tenant_rls.sql");
assert.ok(fs.existsSync(rlsPath), "Tenant RLS migration must exist.");
const sql = fs.readFileSync(rlsPath, "utf8");

assert.match(sql, /create or replace function public\.is_org_member\s*\(/i);
assert.match(sql, /create or replace function public\.has_org_permission\s*\(/i);
assert.match(sql, /security definer/i);
assert.match(sql, /set search_path\s*=\s*pg_catalog\s*,\s*public/i);
assert.match(sql, /auth\.uid\(\)/i);
assert.match(sql, /organization_memberships/i);
assert.match(sql, /join public\.profiles[\s\S]*?profile\.status = 'active'/i);
assert.match(sql, /join public\.organizations[\s\S]*?organization\.status = 'active'/i);
assert.match(sql, /create or replace function public\.prevent_organization_transfer/i);
assert.match(sql, /create or replace function public\.prevent_append_only_mutation/i);
assert.match(sql, /create or replace function public\.protect_approval_request/i);
assert.match(sql, /create or replace function public\.stamp_client_evidence/i);
assert.doesNotMatch(sql, /current_setting\s*\(/i);
assert.doesNotMatch(sql, /to\s+anon\b/i);
assert.match(sql, /revoke all on function public\.is_org_member\(uuid\) from public/i);
assert.match(sql, /revoke all on function public\.has_org_permission\(uuid, text\) from public/i);

for (const table of tables) {
  assert.match(sql, new RegExp(`alter table public\\.${table.name} enable row level security`, "i"), `${table.name} must enable RLS.`);
  assert.match(sql, new RegExp(`alter table public\\.${table.name} force row level security`, "i"), `${table.name} must force RLS.`);
}

const readPermissions = {
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
};

for (const table of tables.filter((item) => item.tenantScoped)) {
  assert.match(sql, new RegExp(`create policy ${table.name}_authorized_select[\\s\\S]*?on public\\.${table.name}[\\s\\S]*?for select[\\s\\S]*?has_org_permission\\(organization_id, '${readPermissions[table.name]}'\\)`, "i"), `${table.name} requires permission-bound SELECT.`);
  assert.doesNotMatch(sql, new RegExp(`create policy ${table.name}_member_select`, "i"), `${table.name} must not expose all records to every member.`);
}

for (const tableName of ["organization_memberships", "roles", "role_permissions", "membership_roles"]) {
  assert.doesNotMatch(sql, new RegExp(`create policy ${tableName}_(authorized|member)_(insert|update|delete)`, "i"), `${tableName} mutations must be server-controlled to prevent self-escalation.`);
}
for (const tableName of ["payments", "commissions", "audit_logs"]) {
  assert.doesNotMatch(sql, new RegExp(`create policy ${tableName}_[a-z_]+_insert`, "i"), `${tableName} inserts must be server-controlled evidence writes.`);
}

assert.match(sql, /create policy approval_requests_authorized_insert[\s\S]*?has_org_permission\(organization_id, 'approvals\.request'\)/i);
assert.match(sql, /create policy approval_requests_authorized_update[\s\S]*?has_org_permission\(organization_id, 'approvals\.decide'\)/i);

assert.match(sql, /create policy profiles_self_select[\s\S]*?id = auth\.uid\(\)/i);
assert.match(sql, /create policy profiles_self_update[\s\S]*?id = auth\.uid\(\) and status = 'active'[\s\S]*?with check \(id = auth\.uid\(\) and status = 'active'\)/i);
assert.match(sql, /create policy organizations_member_select[\s\S]*?is_org_member\(id\)/i);
assert.match(sql, /create policy permissions_authenticated_select[\s\S]*?to authenticated/i);
assert.match(sql, /revoke all on table public\.legacy_id_map from anon, authenticated/i);
for (const table of tables) {
  assert.match(sql, new RegExp(`revoke all on table public\\.${table.name} from anon, authenticated`, "i"), `${table.name} privileges must start from deny-all.`);
}
for (const table of tables.filter((item) => item.tenantScoped)) {
  assert.match(sql, new RegExp(`grant select on table public\\.${table.name} to authenticated`, "i"), `${table.name} requires explicit authenticated SELECT grant governed by RLS.`);
}
for (const tableName of ["organization_memberships", "roles", "role_permissions", "membership_roles", "payments", "commissions", "audit_logs"]) {
  assert.doesNotMatch(sql, new RegExp(`grant (?:[^;]*, )?insert[^;]* on table public\\.${tableName}`, "i"), `${tableName} must not grant direct INSERT.`);
}
assert.match(sql, /grant insert, update on table public\.approval_requests to authenticated/i);
assert.match(sql, /grant insert, update on table public\.estimates to authenticated/i);
assert.match(sql, /grant insert, update on table public\.invoices to authenticated/i);

for (const table of tables.filter((item) => item.tenantScoped)) {
  assert.match(sql, new RegExp(`create trigger ${table.name}_organization_immutable[\\s\\S]*?before update on public\\.${table.name}[\\s\\S]*?prevent_organization_transfer`, "i"), `${table.name} must prevent tenant transfer.`);
}

for (const tableName of ["job_timeline_events", "payments", "commissions", "audit_logs"]) {
  assert.match(sql, new RegExp(`create trigger ${tableName}_append_only[\\s\\S]*?before update or delete on public\\.${tableName}[\\s\\S]*?prevent_append_only_mutation`, "i"), `${tableName} must be database-enforced append-only.`);
  assert.match(sql, new RegExp(`revoke all on table public\\.${tableName} from anon, authenticated`, "i"), `${tableName} must start deny-all for clients.`);
  assert.doesNotMatch(sql, new RegExp(`create policy ${tableName}_[a-z_]+_(update|delete)`, "i"), `${tableName} must not expose update/delete policies.`);
}

assert.match(sql, /create trigger approval_requests_protect[\s\S]*?before insert or update on public\.approval_requests[\s\S]*?protect_approval_request/i);
assert.match(sql, /create trigger job_timeline_events_stamp[\s\S]*?before insert on public\.job_timeline_events[\s\S]*?stamp_client_evidence/i);
assert.match(sql, /create trigger audit_logs_stamp[\s\S]*?before insert on public\.audit_logs[\s\S]*?stamp_client_evidence/i);
assert.match(sql, /new\.actor_service := current_user/i);
assert.match(sql, /new\.requested_by_service := current_user/i);
assert.match(sql, /new\.decided_by_service := current_user/i);
assert.match(sql, /new\.decision = 'expired'/i);

assert.match(sql, /begin;[\s\S]*commit;/i);
console.log(JSON.stringify({ ok: true, migration: "0002_tenant_rls.sql", protectedTables: tables.length }, null, 2));
