const { rolesStatus, ROLE_PERMISSIONS } = require("./roles-engine");
const { permissionsStatus } = require("./permissions-engine");

function can(role, permission) {
  return Boolean(ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role].includes(permission));
}

function rbacStatus(input = {}) {
  return {
    ok: true,
    data: {
      status: "architecture_ready",
      roles: rolesStatus(input).data,
      permissions: permissionsStatus(input).data,
      sampleDecision: {
        role: input.role || "Guest",
        permission: input.permission || "View",
        allowed: can(input.role || "Guest", input.permission || "View")
      },
      enforcementActive: false,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  can,
  rbacStatus
};
