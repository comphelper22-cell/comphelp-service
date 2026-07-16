const assert = require("assert");
const { CORE_SCHEMA_VERSION, tables, getTable } = require("../database/contracts/core-schema-contract");

assert.strictEqual(CORE_SCHEMA_VERSION, "1.0.0");
assert.ok(Array.isArray(tables));
assert.ok(tables.length >= 24, "Core contract must cover identity, marketplace, finance, approvals, audit, and migration mapping.");

const names = tables.map((table) => table.name);
assert.strictEqual(new Set(names).size, names.length, "Table names must be unique.");
[
  "organizations", "profiles", "organization_memberships", "roles", "permissions", "role_permissions", "membership_roles",
  "customers", "leads", "vendors", "technician_profiles", "projects", "jobs", "job_assignments", "job_timeline_events",
  "estimates", "estimate_items", "invoices", "invoice_items", "payments", "commissions", "approval_requests", "audit_logs", "legacy_id_map"
].forEach((name) => assert.ok(getTable(name), `Missing core table: ${name}`));

for (const table of tables) {
  assert.ok(table.columns && typeof table.columns === "object", `${table.name} must define columns.`);
  if (table.name === "profiles") {
    assert.deepStrictEqual(table.columns.id, { type: "uuid", primaryKey: true, references: "auth.users.id", onDelete: "cascade" }, "profiles.id must share the Supabase Auth user ID.");
  } else {
    assert.deepStrictEqual(table.columns.id, { type: "uuid", primaryKey: true, default: "gen_random_uuid()" }, `${table.name}.id must be a generated UUID.`);
  }
  assert.strictEqual(table.columns.created_at.type, "timestamptz");
  assert.strictEqual(table.columns.created_at.nullable, false);
  if (table.tenantScoped) {
    assert.deepStrictEqual(table.columns.organization_id, { type: "uuid", nullable: false, references: "organizations.id", onDelete: "restrict", indexed: true }, `${table.name} must enforce organization ownership.`);
  }
  for (const column of Object.values(table.columns)) {
    if (!column.references || column.references === "auth.users.id") continue;
    const [targetTable, targetColumn] = column.references.split(".");
    assert.ok(getTable(targetTable), `${table.name} references missing table ${targetTable}.`);
    assert.ok(getTable(targetTable).columns[targetColumn], `${table.name} references missing column ${column.references}.`);
  }
}

["estimates", "estimate_items", "invoices", "invoice_items", "payments", "commissions"].forEach((name) => {
  const table = getTable(name);
  assert.strictEqual(table.financial, true, `${name} must be marked financial.`);
  assert.strictEqual(table.columns.currency.type, "char(3)", `${name} must include currency.`);
});

["estimate_items", "invoice_items", "payments", "commissions"].forEach((name) => {
  const moneyColumn = Object.values(getTable(name).columns).find((column) => column.type === "numeric(12,2)");
  assert.ok(moneyColumn, `${name} must contain numeric(12,2) money.`);
});

assert.strictEqual(getTable("payments").appendOnly, true);
assert.strictEqual(getTable("commissions").appendOnly, true);
assert.strictEqual(getTable("audit_logs").appendOnly, true);
assert.strictEqual(getTable("approval_requests").columns.context_hash.type, "text");
assert.strictEqual(getTable("approval_requests").columns.expires_at.type, "timestamptz");
assert.strictEqual(getTable("profiles").columns.id.references, "auth.users.id");
assert.strictEqual(getTable("legacy_id_map").tenantScoped, false);
assert.deepStrictEqual(getTable("estimates").checks, ["total = subtotal + tax_total"]);
assert.deepStrictEqual(getTable("invoices").checks, ["total = subtotal + tax_total", "paid_total <= total"]);
assert.deepStrictEqual(getTable("estimate_items").checks, ["line_total = round(quantity * unit_price, 2)"]);
assert.deepStrictEqual(getTable("invoice_items").checks, ["line_total = round(quantity * unit_price, 2)"]);
assert.strictEqual(getTable("payments").columns.amount.check, "> 0");
assert.strictEqual(getTable("commissions").columns.amount.check, "> 0");
assert.deepStrictEqual(getTable("payments").unique, [["provider", "provider_payment_id"]]);
assert.strictEqual(getTable("payments").columns.provider_payment_id.nullable, false);
assert.strictEqual(getTable("payments").columns.status.check, "= 'paid'");
assert.strictEqual(getTable("payments").columns.status.default, undefined);
assert.strictEqual(getTable("payments").columns.paid_at.nullable, false);
assert.strictEqual(getTable("invoices").columns.paid_total.default, "0");
assert.doesNotMatch(getTable("approval_requests").columns.decision.check, /revoked/);
assert.ok(getTable("approval_requests").columns.requested_by_service);
assert.ok(getTable("audit_logs").columns.actor_service);

function assertDeepFrozen(value, path = "contract") {
  if (!value || typeof value !== "object") return;
  assert.strictEqual(Object.isFrozen(value), true, `${path} must be deeply frozen.`);
  for (const [key, child] of Object.entries(value)) assertDeepFrozen(child, `${path}.${key}`);
}
assertDeepFrozen(tables);

console.log(JSON.stringify({ ok: true, schemaVersion: CORE_SCHEMA_VERSION, tableCount: tables.length }, null, 2));
