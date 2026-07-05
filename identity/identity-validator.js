const { PERMISSIONS, ROLES } = require("./identity-service");

function validateRole(role) {
  return {
    ok: ROLES.includes(role),
    role,
    allowedRoles: ROLES
  };
}

function validatePermissions(permissions = []) {
  const missing = permissions.filter((permission) => !PERMISSIONS.includes(permission));
  return {
    ok: missing.length === 0,
    requested: permissions,
    unsupported: missing,
    supported: PERMISSIONS
  };
}

function validateIdentity(input = {}) {
  const errors = [];
  if (!input.email && !input.userId) errors.push("email_or_user_id_required");
  if (input.role && !ROLES.includes(input.role)) errors.push("unsupported_role");
  if (input.organizationId === "") errors.push("organization_id_invalid");
  return {
    ok: errors.length === 0,
    errors
  };
}

module.exports = {
  validateIdentity,
  validatePermissions,
  validateRole
};
