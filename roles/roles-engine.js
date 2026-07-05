const { ROLES } = require("../identity/identity-service");
const { validateRole } = require("../identity/identity-validator");

const ROLE_PERMISSIONS = {
  "Super Admin": ["View", "Create", "Update", "Delete", "Approve", "Assign", "Export", "Billing", "Administration", "Analytics", "AI"],
  "Company Owner": ["View", "Create", "Update", "Delete", "Approve", "Assign", "Export", "Billing", "Administration", "Analytics", "AI"],
  "Office Manager": ["View", "Create", "Update", "Approve", "Assign", "Export", "Analytics"],
  Dispatcher: ["View", "Create", "Update", "Assign", "Analytics"],
  Technician: ["View", "Update"],
  Sales: ["View", "Create", "Update", "Export", "Analytics"],
  Marketing: ["View", "Create", "Update", "Export", "Analytics", "AI"],
  Customer: ["View"],
  Guest: ["View"]
};

function rolesStatus(input = {}) {
  return {
    ok: true,
    data: {
      roles: ROLES,
      rolePermissions: ROLE_PERMISSIONS,
      validation: input.role ? validateRole(input.role) : { ok: true, role: null },
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  ROLE_PERMISSIONS,
  rolesStatus
};
