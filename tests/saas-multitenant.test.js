const assert = require("assert");
const saasEngine = require("../saas/tenant-engine");

function run() {
  const input = { data: sampleData() };
  const status = saasEngine.status();
  const organizations = saasEngine.organizations(input);
  const teams = saasEngine.teams(input);
  const permissions = saasEngine.permissions(input);
  const settings = saasEngine.settings(input);
  const dashboard = saasEngine.dashboard(input);

  assert.strictEqual(status.ok, true, "SaaS status should return ok.");
  assert.strictEqual(status.supabaseConnected, false, "Supabase must not be connected in Sprint 15.");
  assert.strictEqual(organizations.ok, true, "Organizations should return ok.");
  assert.strictEqual(teams.ok, true, "Teams should return ok.");
  assert.strictEqual(permissions.ok, true, "Permissions should return ok.");
  assert.strictEqual(settings.ok, true, "Settings should return ok.");
  assert.strictEqual(dashboard.ok, true, "Dashboard should return ok.");
  assert.ok(dashboard.data.tenantHealth.score >= 0, "Tenant health score should exist.");
  assert.strictEqual(dashboard.data.jsonFallbackOnly, true, "Dashboard should be JSON fallback only.");
  assert.strictEqual(dashboard.data.tenantContext.supabaseConnected, false, "Dashboard should not connect Supabase.");

  return {
    ok: true,
    organizations: organizations.data.organizations.length,
    teams: teams.data.users.length,
    roles: permissions.data.roleCount,
    permissions: permissions.data.permissionCount,
    tenantHealth: dashboard.data.tenantHealth.score
  };
}

function sampleData() {
  return {
    organizations: [
      { id: "org_1", tenantId: "tenant_1", name: "CompHelp Service", slug: "comphelp-service", industry: "tech services", city: "Los Angeles", status: "active" }
    ],
    users: [
      { id: "user_1", name: "Owner", email: "owner@example.com", role: "admin", organizationId: "org_1", status: "active" },
      { id: "user_2", name: "Dispatcher", email: "dispatch@example.com", role: "dispatcher", organizationId: "org_1", status: "active" }
    ],
    roles: ["admin", "manager", "dispatcher", "technician", "customer", "viewer"].map((name) => ({ name, scope: "tenant", status: "active" })),
    permissions: [
      { role: "admin", resource: "*", action: "*", effect: "allow", status: "active" },
      { role: "dispatcher", resource: "dispatch", action: "manage", effect: "allow", status: "active" },
      { role: "viewer", resource: "*", action: "read", effect: "allow", status: "active" }
    ],
    settings: [
      { key: "tenant_slug", value: "comphelp-service", scope: "tenant", status: "active" }
    ]
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
