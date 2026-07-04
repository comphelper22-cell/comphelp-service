const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MARKETPLACE_FILE = path.join(ROOT, "data", "marketplace.json");

function readTenantData(input = {}) {
  if (input.data) return normalize(input.data, false);
  try {
    const parsed = JSON.parse(fs.readFileSync(MARKETPLACE_FILE, "utf8").replace(/^\uFEFF/, ""));
    return normalize(parsed, false);
  } catch (_) {
    return normalize({}, true);
  }
}

function normalize(data = {}, forcedDemo = false) {
  const organizations = arr(data.organizations);
  const users = arr(data.users);
  const roles = arr(data.roles);
  const permissions = arr(data.permissions);
  const settings = arr(data.settings);
  const preferences = arr(data.preferences);
  const sessions = arr(data.sessions);
  const hasTenantData = organizations.length || users.length || roles.length || permissions.length || settings.length || preferences.length;
  if (forcedDemo || !hasTenantData) return demoData();
  return { organizations, users, roles, permissions, settings, preferences, sessions, demoMode: false };
}

function tenantContext(input = {}) {
  const data = readTenantData(input);
  const organization = data.organizations[0] || demoOrganization();
  return {
    ok: true,
    data: {
      tenantId: organization.tenantId || organization.tenant_id || organization.id || "tenant_comphelp_service",
      organizationId: organization.id || "org_comphelp_service",
      organizationName: organization.name || "CompHelp Service",
      mode: "json_fallback",
      supabaseConnected: false,
      tenantIsolationReady: data.organizations.length > 0,
      roleCount: data.roles.length,
      permissionCount: data.permissions.length,
      userCount: data.users.length,
      generatedAt: new Date().toISOString()
    }
  };
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function demoOrganization() {
  return {
    id: "org_comphelp_service",
    tenantId: "tenant_comphelp_service",
    name: "CompHelp Service",
    slug: "comphelp-service",
    industry: "local technology services",
    city: "Los Angeles",
    status: "active"
  };
}

function demoData() {
  return {
    demoMode: true,
    organizations: [demoOrganization()],
    users: [
      { id: "user_owner", name: "Owner", email: "owner@example.com", role: "admin", organizationId: "org_comphelp_service", status: "active" }
    ],
    roles: ["admin", "manager", "dispatcher", "technician", "customer", "viewer"].map((name) => ({ name, scope: "tenant", status: "active" })),
    permissions: [
      { role: "admin", resource: "*", action: "*", effect: "allow", status: "active" },
      { role: "manager", resource: "*", action: "manage", effect: "allow", status: "active" },
      { role: "dispatcher", resource: "dispatch", action: "manage", effect: "allow", status: "active" },
      { role: "technician", resource: "projects", action: "update", effect: "allow", status: "active" },
      { role: "viewer", resource: "*", action: "read", effect: "allow", status: "active" }
    ],
    settings: [{ key: "tenant_mode", value: "json_fallback", scope: "tenant", status: "active" }],
    preferences: [],
    sessions: []
  };
}

module.exports = {
  readTenantData,
  tenantContext
};
