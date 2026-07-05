const assert = require("assert");
const organizationEngine = require("../organizations/organization-engine");

const status = organizationEngine.status({ name: "Demo Company", status: "active" });
assert.strictEqual(status.ok, true);
assert.strictEqual(status.data.model.isolation.organizationIdRequired, true);
assert.strictEqual(status.data.model.isolation.crossTenantAccessAllowed, false);
assert.strictEqual(status.data.jsonFallbackCompatible, true);

const invalid = organizationEngine.validateOrganization({ status: "unknown" });
assert.strictEqual(invalid.ok, false);
assert.ok(invalid.errors.includes("organization_name_or_id_required"));

console.log(JSON.stringify({
  ok: true,
  organizationIsolation: "ready",
  jsonFallbackCompatible: true
}, null, 2));
