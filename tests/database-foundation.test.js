const assert = require("assert");
const databaseAgent = require("../agents/database-agent");
const { databaseHealth } = require("../database/core/database-health");
const { databaseConfig } = require("../database/core/database-config");
const { validateSchema } = require("../database/core/database-validator");

const schemas = [
  require("../database/schema/companies.schema"),
  require("../database/schema/users.schema"),
  require("../database/schema/roles.schema"),
  require("../database/schema/permissions.schema"),
  require("../database/schema/customers.schema"),
  require("../database/schema/technicians.schema"),
  require("../database/schema/jobs.schema"),
  require("../database/schema/estimates.schema"),
  require("../database/schema/invoices.schema"),
  require("../database/schema/payments.schema"),
  require("../database/schema/tasks.schema"),
  require("../database/schema/notes.schema"),
  require("../database/schema/activities.schema"),
  require("../database/schema/files.schema"),
  require("../database/schema/inventory.schema"),
  require("../database/schema/ai-memory.schema")
];

const config = databaseConfig({});
assert.strictEqual(config.jsonFallbackEnabled, true);
assert.strictEqual(config.supabaseConfigured, false);

const health = databaseHealth();
assert.ok(["ready", "needs_attention"].includes(health.status));
assert.strictEqual(health.productionConnectionActive, false);

schemas.forEach((schema) => {
  const result = validateSchema(schema);
  assert.strictEqual(result.ok, true, `${schema.table} schema should include base fields`);
});

const report = databaseAgent.run();
assert.strictEqual(report.ok, true);
assert.ok(report.data.schemas.count >= 16);
assert.ok(report.data.repositories.count >= 16);

console.log(JSON.stringify({
  ok: true,
  schemas: report.data.schemas.count,
  repositories: report.data.repositories.count,
  mode: report.data.config.mode
}, null, 2));
