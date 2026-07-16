"use strict";

const fs = require("fs");
const path = require("path");
const { CORE_SCHEMA_VERSION, tables } = require("../database/contracts/core-schema-contract");

const tableByName = new Map(tables.map((table) => [table.name, table]));

function identifier(value) {
  if (!/^[a-z][a-z0-9_]*$/.test(value)) throw new Error(`Unsafe SQL identifier: ${value}`);
  return value;
}

function sqlDefault(value, type) {
  if (value === undefined) return "";
  if (["gen_random_uuid()", "now()"].includes(value)) return ` default ${value}`;
  if (type === "jsonb") return ` default '${String(value).replaceAll("'", "''")}'::jsonb`;
  return ` default '${String(value).replaceAll("'", "''")}'`;
}

function sqlCheck(columnName, expression) {
  if (!expression) return "";
  const clauses = String(expression).split(/\s+and\s+/i).map((part) => `${columnName} ${part.trim()}`);
  return ` check (${clauses.join(" and ")})`;
}

function isTenantReference(sourceTable, column) {
  if (!sourceTable.tenantScoped || !column.references) return false;
  const [targetName] = column.references.split(".");
  return Boolean(tableByName.get(targetName)?.tenantScoped);
}

function columnSql(sourceTable, name, column) {
  const safeName = identifier(name);
  let sql = `  ${safeName} ${column.type}`;
  if (column.primaryKey) sql += " primary key";
  if (column.nullable === false) sql += " not null";
  sql += sqlDefault(column.default, column.type);
  sql += sqlCheck(safeName, column.check);
  if (column.references && !isTenantReference(sourceTable, column)) {
    const parts = column.references.split(".");
    let target;
    if (parts.length === 3) target = `${identifier(parts[0])}.${identifier(parts[1])}(${identifier(parts[2])})`;
    else if (parts.length === 2) target = `public.${identifier(parts[0])}(${identifier(parts[1])})`;
    else throw new Error(`Invalid SQL reference: ${column.references}`);
    sql += ` references ${target} on delete ${String(column.onDelete || "restrict").toUpperCase()}`;
  }
  return sql;
}

function createNameRegistry() {
  const names = new Set();
  return (parts) => {
    const name = identifier(parts.join("_").replace(/_+/g, "_").slice(0, 60));
    if (names.has(name)) throw new Error(`Generated SQL identifier collision: ${name}`);
    names.add(name);
    return name;
  };
}

function financialFunctions() {
  return [`create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;`,
  `create or replace function public.validate_estimate_totals()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    if new.subtotal <> 0 or new.total <> new.tax_total then raise exception 'estimate totals must start at zero subtotal'; end if;
  elsif pg_trigger_depth() = 1 then
    if new.subtotal is distinct from old.subtotal or new.total <> old.subtotal + new.tax_total then
      raise exception 'estimate totals are system-maintained';
    end if;
  end if;
  return new;
end;
$$;`,
  `create or replace function public.validate_invoice_totals()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    if new.subtotal <> 0 or new.paid_total <> 0 or new.total <> new.tax_total then raise exception 'invoice totals must start at zero subtotal and paid total'; end if;
  elsif pg_trigger_depth() = 1 then
    if new.subtotal is distinct from old.subtotal
       or new.paid_total is distinct from old.paid_total
       or new.total <> old.subtotal + new.tax_total then
      raise exception 'invoice totals are system-maintained';
    end if;
  end if;
  return new;
end;
$$;`,
  `create or replace function public.validate_payment()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare invoice_total numeric(12,2);
begin
  if new.status is distinct from 'paid' then raise exception 'payments ledger accepts only paid records'; end if;
  new.paid_at := now();
  update public.invoices
     set paid_total = paid_total + new.amount
   where id = new.invoice_id
     and organization_id = new.organization_id
     and paid_total + new.amount <= total
  returning total into invoice_total;
  if invoice_total is null then raise exception 'payment exceeds invoice total or invoice not found'; end if;
  return new;
end;
$$;`,
  `create or replace function public.validate_commission()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare expected_amount numeric(12,2); invoice_job_id uuid;
begin
  select round(payment.amount * new.rate, 2), invoice.job_id
    into expected_amount, invoice_job_id
  from public.payments payment
  join public.invoices invoice on invoice.id = payment.invoice_id and invoice.organization_id = payment.organization_id
  where payment.id = new.payment_id
    and payment.organization_id = new.organization_id
    and payment.status = 'paid'
    and payment.paid_at is not null;
  if expected_amount is null or new.amount <> expected_amount then raise exception 'commission amount does not reconcile'; end if;
  if invoice_job_id is null or new.job_id <> invoice_job_id then raise exception 'commission job does not match payment invoice'; end if;
  return new;
end;
$$;`,
  `create or replace function public.sync_estimate_totals()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare delta numeric(12,2); target_id uuid; target_org uuid;
begin
  if tg_op = 'INSERT' then
    delta := new.line_total; target_id := new.estimate_id; target_org := new.organization_id;
  elsif tg_op = 'DELETE' then
    delta := -old.line_total; target_id := old.estimate_id; target_org := old.organization_id;
  else
    if new.estimate_id is distinct from old.estimate_id or new.organization_id is distinct from old.organization_id then
      raise exception 'estimate line ownership is immutable';
    end if;
    delta := new.line_total - old.line_total; target_id := new.estimate_id; target_org := new.organization_id;
  end if;
  update public.estimates set subtotal = subtotal + delta, total = total + delta where id = target_id and organization_id = target_org;
  if not found then raise exception 'estimate parent not found'; end if;
  return null;
end;
$$;`,
  `create or replace function public.sync_invoice_totals()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare delta numeric(12,2); target_id uuid; target_org uuid;
begin
  if tg_op = 'INSERT' then
    delta := new.line_total; target_id := new.invoice_id; target_org := new.organization_id;
  elsif tg_op = 'DELETE' then
    delta := -old.line_total; target_id := old.invoice_id; target_org := old.organization_id;
  else
    if new.invoice_id is distinct from old.invoice_id or new.organization_id is distinct from old.organization_id then
      raise exception 'invoice line ownership is immutable';
    end if;
    delta := new.line_total - old.line_total; target_id := new.invoice_id; target_org := new.organization_id;
  end if;
  update public.invoices set subtotal = subtotal + delta, total = total + delta where id = target_id and organization_id = target_org;
  if not found then raise exception 'invoice parent not found'; end if;
  return null;
end;
$$;`];
}

function generate() {
  const makeName = createNameRegistry();
  const lines = [
    `-- CompHelp core schema v${CORE_SCHEMA_VERSION}`,
    "-- Generated from database/contracts/core-schema-contract.js; review before applying.",
    "begin;",
    "",
    "create extension if not exists pgcrypto;",
    ""
  ];

  for (const table of tables) {
    const tableName = identifier(table.name);
    const definitions = Object.entries(table.columns).map(([name, column]) => columnSql(table, name, column));
    for (const check of table.checks || []) definitions.push(`  check (${check})`);
    lines.push(`create table public.${tableName} (`);
    lines.push(definitions.join(",\n"));
    lines.push(");", "");
  }

  for (const table of tables) {
    const tableName = identifier(table.name);
    if (table.tenantScoped) {
      lines.push(`create unique index ${makeName([tableName, "id", "organization_id", "uidx"])} on public.${tableName} (id, organization_id);`);
      if (table.columns.currency) {
        lines.push(`create unique index ${makeName([tableName, "id", "organization_id", "currency", "uidx"])} on public.${tableName} (id, organization_id, currency);`);
      }
    }
    for (const columns of table.unique || []) {
      const safeColumns = columns.map(identifier);
      lines.push(`create unique index ${makeName([tableName, ...safeColumns, "uidx"])} on public.${tableName} (${safeColumns.join(", ")});`);
    }
    for (const [columnName, column] of Object.entries(table.columns)) {
      if (!column.indexed) continue;
      const safeColumn = identifier(columnName);
      lines.push(`create index ${makeName([tableName, safeColumn, "idx"])} on public.${tableName} (${safeColumn});`);
    }
  }

  lines.push("");
  for (const table of tables.filter((item) => item.tenantScoped)) {
    for (const [columnName, column] of Object.entries(table.columns)) {
      if (!isTenantReference(table, column)) continue;
      const [targetTableName] = column.references.split(".");
      const target = tableByName.get(targetTableName);
      const withCurrency = Boolean(table.columns.currency && target.columns.currency);
      const sourceColumns = [identifier(columnName), "organization_id", ...(withCurrency ? ["currency"] : [])];
      const targetColumns = ["id", "organization_id", ...(withCurrency ? ["currency"] : [])];
      const deleteAction = String(column.onDelete || "restrict").toUpperCase();
      const deleteColumns = deleteAction === "SET NULL" ? ` (${identifier(columnName)})` : "";
      const constraintName = makeName([table.name, columnName, "tenant_fk"]);
      lines.push(`alter table public.${identifier(table.name)} add constraint ${constraintName} foreign key (${sourceColumns.join(", ")}) references public.${identifier(targetTableName)}(${targetColumns.join(", ")}) on delete ${deleteAction}${deleteColumns};`);
    }
  }

  lines.push("", ...financialFunctions().flatMap((sql) => [sql, ""]));
  for (const functionName of ["touch_updated_at", "validate_estimate_totals", "validate_invoice_totals", "validate_payment", "validate_commission", "sync_estimate_totals", "sync_invoice_totals"]) {
    lines.push(`revoke all on function public.${functionName}() from public;`);
  }
  for (const table of tables) {
    lines.push(`create trigger ${identifier(`${table.name}_touch_updated_at`)} before update on public.${identifier(table.name)} for each row execute function public.touch_updated_at();`);
  }
  lines.push("create trigger estimates_validate_totals before insert or update on public.estimates for each row execute function public.validate_estimate_totals();");
  lines.push("create trigger invoices_validate_totals before insert or update on public.invoices for each row execute function public.validate_invoice_totals();");
  lines.push("create trigger estimate_items_sync_totals after insert or update or delete on public.estimate_items for each row execute function public.sync_estimate_totals();");
  lines.push("create trigger invoice_items_sync_totals after insert or update or delete on public.invoice_items for each row execute function public.sync_invoice_totals();");
  lines.push("create trigger payments_validate before insert on public.payments for each row execute function public.validate_payment();");
  lines.push("create trigger commissions_validate before insert on public.commissions for each row execute function public.validate_commission();");

  lines.push("");
  for (const table of tables.filter((item) => item.appendOnly)) {
    lines.push(`comment on table public.${identifier(table.name)} is 'Append-only business record. Corrections require a reviewed reversal record.';`);
  }
  lines.push("", "commit;", "");
  return lines.join("\n");
}

function writeMigration() {
  const outputPath = path.join(__dirname, "..", "supabase", "migrations", "0001_core_schema.sql");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, generate(), "utf8");
  return outputPath;
}

if (require.main === module) {
  const outputPath = writeMigration();
  console.log(JSON.stringify({ ok: true, outputPath, tableCount: tables.length, schemaVersion: CORE_SCHEMA_VERSION }, null, 2));
}

module.exports = { columnSql, generate, writeMigration };
