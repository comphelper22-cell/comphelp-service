const { tenantContext } = require("./tenant-context");
const { organizations } = require("./organization-manager");
const { teams } = require("./team-manager");
const { permissions } = require("./tenant-permissions");
const { settings } = require("./tenant-settings");
const { dashboard } = require("./tenant-dashboard");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "SaaS Multi-Tenant Foundation",
    modules: ["organizations", "teams", "permissions", "settings", "dashboard", "tenantContext"],
    storage: "json_fallback_only",
    supabaseConnected: false,
    postgresReadyLater: true,
    secretsExposed: false,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  dashboard,
  organizations,
  permissions,
  settings,
  status,
  teams,
  tenantContext
};
