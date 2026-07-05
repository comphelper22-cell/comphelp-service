const assert = require("assert");
const { ROLES, PERMISSIONS } = require("../identity/identity-service");
const { rbacStatus, can } = require("../roles/rbac-engine");

["Super Admin", "Company Owner", "Office Manager", "Dispatcher", "Technician", "Sales", "Marketing", "Customer", "Guest"].forEach((role) => {
  assert.ok(ROLES.includes(role));
});

["View", "Create", "Update", "Delete", "Approve", "Assign", "Export", "Billing", "Administration", "Analytics", "AI"].forEach((permission) => {
  assert.ok(PERMISSIONS.includes(permission));
});

assert.strictEqual(can("Company Owner", "Billing"), true);
assert.strictEqual(can("Guest", "Delete"), false);

const status = rbacStatus({ role: "Guest", permission: "View" });
assert.strictEqual(status.ok, true);
assert.strictEqual(status.data.sampleDecision.allowed, true);

console.log(JSON.stringify({
  ok: true,
  roles: ROLES.length,
  permissions: PERMISSIONS.length
}, null, 2));
