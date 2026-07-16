const assert = require("assert");
const fs = require("fs");
const path = require("path");

const inventoryPath = path.join(__dirname, "..", "docs", "DATABASE_INVENTORY.md");
assert.ok(fs.existsSync(inventoryPath), "DATABASE_INVENTORY.md must exist.");
const inventory = fs.readFileSync(inventoryPath, "utf8");

[
  "# CompHelp Database Inventory",
  "## Canonical migration source",
  "## Existing schema and repository layer",
  "## Data quality findings",
  "## Target normalized core",
  "## Migration order",
  "## Migration gates"
].forEach((section) => assert.ok(inventory.includes(section), `Missing section: ${section}`));

assert.match(inventory, /data\/marketplace\.json[^\n]*only canonical migration source/i);
assert.match(inventory, /16 schema/i);
assert.match(inventory, /101 customers/i);
assert.match(inventory, /51 jobs/i);
assert.match(inventory, /vendors[^\n]*technicians[^\n]*duplicate/i);
assert.match(inventory, /leads[^\n]*sourceLeads[^\n]*duplicate/i);
assert.match(inventory, /only 1\/101 customers[^\n]*organization_id/i);
assert.match(inventory, /UUID/i);
assert.match(inventory, /organization_memberships/i);
assert.match(inventory, /auth\.uid\(\)/i);
assert.match(inventory, /numeric\(12,2\)/i);
assert.match(inventory, /legacy-ID mapping/i);
assert.match(inventory, /dual-read/i);
assert.match(inventory, /archive JSON/i);

console.log(JSON.stringify({ ok: true, databaseInventory: "documented" }, null, 2));
