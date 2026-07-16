const assert = require("assert");
const registry = require("../product/capability-registry");

const allowedStatuses = ["production", "beta", "prototype", "scaffold", "blocked"];
const allowedRisks = ["low", "medium", "high", "critical"];

assert.deepStrictEqual(registry.STATUSES, allowedStatuses);
assert.ok(Array.isArray(registry.capabilities));
assert.ok(registry.capabilities.length >= 20, "Registry must cover the major product capabilities.");

const ids = new Set();
registry.capabilities.forEach((capability) => {
  assert.match(capability.id, /^[a-z0-9.-]+$/);
  assert.ok(!ids.has(capability.id), `Duplicate capability id: ${capability.id}`);
  ids.add(capability.id);
  assert.ok(capability.name);
  assert.ok(allowedStatuses.includes(capability.status), `Invalid status for ${capability.id}`);
  assert.ok(allowedRisks.includes(capability.risk), `Invalid risk for ${capability.id}`);
  assert.ok(capability.ownerAgent);
  assert.ok(capability.dataDependency);
  assert.ok(Array.isArray(capability.externalDependencies));
  assert.ok(capability.approvalPolicy);
  assert.ok(capability.definitionOfDone);
  assert.ok(Array.isArray(capability.evidence));
  assert.ok(capability.evidence.length > 0);
});

assert.strictEqual(registry.getCapability("storage.durable-database").status, "blocked");
assert.strictEqual(registry.getCapability("identity.real-auth").status, "scaffold");
assert.strictEqual(registry.getCapability("marketplace.job-dispatch").status, "beta");
assert.strictEqual(registry.getCapability("platform.production-hosting").status, "production");
assert.strictEqual(registry.getCapability("leads.public-intake").status, "beta", "Lead intake is not production-ready until storage is durable.");
assert.strictEqual(registry.getCapability("payments.stripe-connect").status, "scaffold");
assert.strictEqual(registry.getCapability("social.auto-publishing").status, "scaffold");
assert.strictEqual(registry.getCapability("missing"), null);

const summary = registry.summary();
assert.strictEqual(summary.total, registry.capabilities.length);
assert.strictEqual(Object.values(summary.byStatus).reduce((total, count) => total + count, 0), summary.total);
allowedStatuses.forEach((status) => assert.ok(Number.isInteger(summary.byStatus[status])));

console.log(JSON.stringify({ ok: true, capabilities: summary }, null, 2));
