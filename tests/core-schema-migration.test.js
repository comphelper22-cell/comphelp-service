const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { tables } = require("../database/contracts/core-schema-contract");

const migrationPath = path.join(__dirname, "..", "supabase", "migrations", "0001_core_schema.sql");
assert.ok(fs.existsSync(migrationPath), "Core SQL migration must exist.");
const sql = fs.readFileSync(migrationPath, "utf8");

assert.match(sql, /create extension if not exists pgcrypto/i);
for (const table of tables) {
  assert.match(sql, new RegExp(`create table(?: if not exists)? public\\.${table.name}\\b`, "i"), `Missing SQL table ${table.name}.`);
}
assert.match(sql, /references auth\.users\s*\(id\)/i);
assert.match(sql, /numeric\s*\(12\s*,\s*2\)/i);
assert.match(sql, /char\s*\(3\)/i);
assert.match(sql, /check\s*\(currency = 'USD'\)/i);
assert.match(sql, /create unique index[^;]+organizations[^;]+slug/is);
assert.match(sql, /create unique index[^;]+organization_memberships[^;]+organization_id[^;]+profile_id/is);
assert.match(sql, /create index[^;]+customers[^;]+organization_id/is);
assert.match(sql, /create index[^;]+jobs[^;]+organization_id/is);
assert.match(sql, /create index[^;]+payments[^;]+invoice_id/is);

for (const table of tables.filter((item) => item.tenantScoped)) {
  assert.match(sql, new RegExp(`create unique index ${table.name}_id_organization_id_uidx on public\\.${table.name} \\(id, organization_id\\)`, "i"), `${table.name} requires a composite tenant identity key.`);
  for (const [columnName, column] of Object.entries(table.columns)) {
    if (!column.references || column.references === "organizations.id" || column.references === "auth.users.id") continue;
    const [targetTable] = column.references.split(".");
    const target = tables.find((item) => item.name === targetTable);
    if (!target || !target.tenantScoped) continue;
    const sourceHasCurrency = Boolean(table.columns.currency);
    const targetHasCurrency = Boolean(target.columns.currency);
    const sourceColumns = sourceHasCurrency && targetHasCurrency ? `${columnName}, organization_id, currency` : `${columnName}, organization_id`;
    const targetColumns = sourceHasCurrency && targetHasCurrency ? "id, organization_id, currency" : "id, organization_id";
    assert.match(sql, new RegExp(`foreign key \\(${sourceColumns}\\) references public\\.${targetTable}\\(${targetColumns}\\)`, "i"), `${table.name}.${columnName} must enforce same-organization and currency references.`);
    assert.doesNotMatch(sql, new RegExp(`${columnName} uuid[^,\\n]*references public\\.${targetTable}\\(id\\)`, "i"), `${table.name}.${columnName} must not rely on a redundant scalar tenant FK.`);
    if (column.onDelete === "set null") {
      assert.match(sql, new RegExp(`foreign key \\(${sourceColumns}\\)[^;]+on delete set null \\(${columnName}\\)`, "i"), `${table.name}.${columnName} must null only the nullable reference column.`);
    }
  }
}
assert.match(sql, /on delete restrict/i);
assert.doesNotMatch(sql, /on delete cascade[^;]+payments/i);
assert.match(sql, /comment on table public\.payments is 'append-only/i);
assert.match(sql, /comment on table public\.audit_logs is 'append-only/i);
assert.match(sql, /check \(total = subtotal \+ tax_total\)/i);
assert.match(sql, /check \(line_total = round\(quantity \* unit_price, 2\)\)/i);
assert.match(sql, /amount numeric\(12,2\) not null check \(amount > 0\)/i);
assert.match(sql, /create unique index payments_provider_provider_payment_id_uidx/i);
assert.match(sql, /create or replace function public\.touch_updated_at/i);
assert.match(sql, /create trigger invoices_touch_updated_at/i);
assert.match(sql, /create or replace function public\.sync_estimate_totals/i);
assert.match(sql, /create trigger estimate_items_sync_totals/i);
assert.match(sql, /create or replace function public\.sync_invoice_totals/i);
assert.match(sql, /create trigger invoice_items_sync_totals/i);
assert.match(sql, /create or replace function public\.validate_payment/i);
assert.match(sql, /create trigger payments_validate/i);
assert.match(sql, /new\.status is distinct from 'paid'/i);
assert.match(sql, /new\.paid_at := now\(\)/i);
assert.match(sql, /payment\.status = 'paid'[\s\S]*?payment\.paid_at is not null/i);
assert.match(sql, /create or replace function public\.validate_commission/i);
assert.match(sql, /create trigger commissions_validate/i);
assert.match(sql, /paid_total numeric\(12,2\) not null default '0'/i);
assert.match(sql, /update public\.invoices\s+set paid_total = paid_total \+ new\.amount/i);
assert.doesNotMatch(sql, /sum\(amount\)[\s\S]{0,200}from public\.payments/i);
assert.match(sql, /update public\.estimates set subtotal = subtotal \+ delta, total = total \+ delta/i);
assert.match(sql, /update public\.invoices set subtotal = subtotal \+ delta, total = total \+ delta/i);
for (const functionName of ["touch_updated_at", "validate_estimate_totals", "validate_invoice_totals", "validate_payment", "validate_commission", "sync_estimate_totals", "sync_invoice_totals"]) {
  assert.match(sql, new RegExp(`revoke all on function public\\.${functionName}\\(\\) from public`, "i"), `${functionName} must not retain default PUBLIC EXECUTE.`);
}
assert.match(sql, /begin;[\s\S]*commit;/i);
assert.doesNotMatch(sql, /service_role|anon key|secret/i);

console.log(JSON.stringify({ ok: true, migration: "0001_core_schema.sql", tableCount: tables.length }, null, 2));
