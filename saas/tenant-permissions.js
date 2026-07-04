const { readTenantData } = require("./tenant-context");

function permissions(input = {}) {
  const data = readTenantData(input);
  const roles = data.roles.map((role) => ({
    name: role.name || role.role || "viewer",
    scope: role.scope || "tenant",
    status: role.status || "active"
  }));
  const permissionRows = data.permissions.map((permission) => ({
    role: permission.role || "viewer",
    resource: permission.resource || "*",
    action: permission.action || "read",
    effect: permission.effect || "allow",
    status: permission.status || "active"
  }));
  return {
    ok: true,
    data: {
      roles,
      permissions: permissionRows,
      roleCount: roles.length,
      permissionCount: permissionRows.length,
      defaultRolesReady: hasDefaultRoles(roles),
      tenantScoped: roles.every((role) => role.scope === "tenant"),
      generatedAt: new Date().toISOString()
    }
  };
}

function hasDefaultRoles(roles) {
  const names = new Set(roles.map((role) => role.name));
  return ["admin", "manager", "dispatcher", "technician", "customer", "viewer"].every((role) => names.has(role));
}

module.exports = { permissions };
