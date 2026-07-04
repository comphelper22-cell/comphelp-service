const { tenantContext } = require("./tenant-context");
const { organizations } = require("./organization-manager");
const { teams } = require("./team-manager");
const { permissions } = require("./tenant-permissions");
const { settings } = require("./tenant-settings");

function dashboard(input = {}) {
  const context = tenantContext(input).data;
  const orgData = organizations(input).data;
  const teamData = teams(input).data;
  const permissionData = permissions(input).data;
  const settingData = settings(input).data;
  const tenantHealth = scoreTenantHealth(context, orgData, teamData, permissionData);
  return {
    ok: true,
    data: {
      organizations: orgData.organizations,
      teams: teamData.users,
      roles: permissionData.roles,
      permissions: permissionData.permissions,
      settings: settingData.settings,
      tenantContext: context,
      tenantHealth,
      jsonFallbackOnly: true,
      supabasePrepared: true,
      generatedAt: new Date().toISOString()
    }
  };
}

function scoreTenantHealth(context, orgData, teamData, permissionData) {
  let score = 40;
  if (orgData.organizations.length) score += 15;
  if (teamData.users.length) score += 15;
  if (permissionData.defaultRolesReady) score += 15;
  if (permissionData.permissionCount) score += 10;
  if (context.mode === "json_fallback") score += 5;
  score = Math.max(0, Math.min(100, score));
  return {
    score,
    status: score >= 80 ? "ready_for_next_foundation_step" : "needs_more_tenant_records",
    checks: {
      organizations: orgData.organizations.length,
      teams: teamData.users.length,
      roles: permissionData.roleCount,
      permissions: permissionData.permissionCount,
      jsonFallback: true,
      supabaseConnected: false
    }
  };
}

module.exports = { dashboard };
