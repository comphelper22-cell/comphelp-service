"use strict";

const CORE_SCHEMA_VERSION = "1.0.0";

const generatedId = () => ({ type: "uuid", primaryKey: true, default: "gen_random_uuid()" });
const createdAt = () => ({ type: "timestamptz", nullable: false, default: "now()" });
const updatedAt = () => ({ type: "timestamptz", nullable: false, default: "now()" });
const organizationId = () => ({ type: "uuid", nullable: false, references: "organizations.id", onDelete: "restrict", indexed: true });
const text = (nullable = false) => ({ type: "text", nullable });
const uuidRef = (references, onDelete = "restrict", nullable = false) => ({ type: "uuid", nullable, references, onDelete, indexed: true });
const money = () => ({ type: "numeric(12,2)", nullable: false, check: ">= 0" });
const positiveMoney = () => ({ type: "numeric(12,2)", nullable: false, check: "> 0" });
const currency = () => ({ type: "char(3)", nullable: false, default: "USD", check: "= 'USD'" });

function deepFreeze(value) {
  if (!value || typeof value !== "object") return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.isFrozen(value) ? value : Object.freeze(value);
}

function define(name, columns = {}, options = {}) {
  const baseId = name === "profiles"
    ? { type: "uuid", primaryKey: true, references: "auth.users.id", onDelete: "cascade" }
    : generatedId();
  return deepFreeze({
    name,
    tenantScoped: options.tenantScoped === true,
    financial: options.financial === true,
    appendOnly: options.appendOnly === true,
    sensitive: options.sensitive === true,
    checks: options.checks || [],
    unique: options.unique || [],
    columns: Object.freeze({
      id: baseId,
      ...(options.tenantScoped ? { organization_id: organizationId() } : {}),
      ...columns,
      created_at: createdAt(),
      updated_at: updatedAt()
    })
  });
}

const tables = Object.freeze([
  define("organizations", {
    name: text(),
    slug: text(),
    status: { type: "text", nullable: false, default: "active", check: "in ('active','suspended','archived')" },
    metadata: { type: "jsonb", nullable: false, default: "{}" }
  }, { unique: [["slug"]] }),

  define("profiles", {
    display_name: text(),
    email: text(),
    phone: text(true),
    status: { type: "text", nullable: false, default: "active", check: "in ('active','invited','suspended','archived')" }
  }, { sensitive: true, unique: [["email"]] }),

  define("organization_memberships", {
    profile_id: uuidRef("profiles.id", "cascade"),
    status: { type: "text", nullable: false, default: "active", check: "in ('invited','active','suspended','revoked')" },
    joined_at: { type: "timestamptz", nullable: true }
  }, { tenantScoped: true, unique: [["organization_id", "profile_id"]] }),

  define("roles", {
    name: text(),
    description: text(true),
    system_key: text(true),
    status: { type: "text", nullable: false, default: "active" }
  }, { tenantScoped: true, unique: [["organization_id", "name"]] }),

  define("permissions", {
    key: text(),
    description: text(true),
    risk_level: { type: "text", nullable: false, default: "medium" }
  }, { unique: [["key"]] }),

  define("role_permissions", {
    role_id: uuidRef("roles.id", "cascade"),
    permission_id: uuidRef("permissions.id", "restrict")
  }, { tenantScoped: true, unique: [["role_id", "permission_id"]] }),

  define("membership_roles", {
    membership_id: uuidRef("organization_memberships.id", "cascade"),
    role_id: uuidRef("roles.id", "restrict")
  }, { tenantScoped: true, unique: [["membership_id", "role_id"]] }),

  define("customers", {
    name: text(),
    email: text(true),
    phone: text(true),
    address_line1: text(true),
    address_line2: text(true),
    city: text(true),
    region: text(true),
    postal_code: text(true),
    status: { type: "text", nullable: false, default: "lead" },
    metadata: { type: "jsonb", nullable: false, default: "{}" },
    deleted_at: { type: "timestamptz", nullable: true }
  }, { tenantScoped: true, sensitive: true }),

  define("leads", {
    customer_id: uuidRef("customers.id", "set null", true),
    name: text(),
    email: text(true),
    phone: text(true),
    service: text(true),
    source: text(true),
    status: { type: "text", nullable: false, default: "new" },
    consent: { type: "jsonb", nullable: false, default: "{}" },
    metadata: { type: "jsonb", nullable: false, default: "{}" }
  }, { tenantScoped: true, sensitive: true }),

  define("vendors", {
    legal_name: text(),
    display_name: text(),
    email: text(true),
    phone: text(true),
    onboarding_status: { type: "text", nullable: false, default: "pending" },
    verification_status: { type: "text", nullable: false, default: "unverified" },
    metadata: { type: "jsonb", nullable: false, default: "{}" }
  }, { tenantScoped: true, sensitive: true }),

  define("technician_profiles", {
    profile_id: uuidRef("profiles.id", "set null", true),
    vendor_id: uuidRef("vendors.id", "set null", true),
    display_name: text(),
    skills: { type: "jsonb", nullable: false, default: "[]" },
    availability: { type: "jsonb", nullable: false, default: "{}" },
    status: { type: "text", nullable: false, default: "active" }
  }, { tenantScoped: true, sensitive: true }),

  define("projects", {
    customer_id: uuidRef("customers.id", "restrict"),
    lead_id: uuidRef("leads.id", "set null", true),
    title: text(),
    service: text(),
    status: { type: "text", nullable: false, default: "new" },
    metadata: { type: "jsonb", nullable: false, default: "{}" }
  }, { tenantScoped: true }),

  define("jobs", {
    project_id: uuidRef("projects.id", "set null", true),
    customer_id: uuidRef("customers.id", "restrict"),
    title: text(),
    service: text(),
    priority: { type: "text", nullable: false, default: "normal" },
    scheduled_at: { type: "timestamptz", nullable: true },
    completed_at: { type: "timestamptz", nullable: true },
    status: { type: "text", nullable: false, default: "new" },
    metadata: { type: "jsonb", nullable: false, default: "{}" }
  }, { tenantScoped: true }),

  define("job_assignments", {
    job_id: uuidRef("jobs.id", "cascade"),
    technician_profile_id: uuidRef("technician_profiles.id", "restrict"),
    vendor_id: uuidRef("vendors.id", "set null", true),
    assigned_at: { type: "timestamptz", nullable: false, default: "now()" },
    ended_at: { type: "timestamptz", nullable: true },
    status: { type: "text", nullable: false, default: "assigned" }
  }, { tenantScoped: true }),

  define("job_timeline_events", {
    job_id: uuidRef("jobs.id", "cascade"),
    actor_profile_id: uuidRef("profiles.id", "set null", true),
    actor_service: text(true),
    event_type: text(),
    details: { type: "jsonb", nullable: false, default: "{}" },
    occurred_at: { type: "timestamptz", nullable: false, default: "now()" }
  }, { tenantScoped: true, appendOnly: true, sensitive: true, checks: ["(actor_profile_id is null) <> (actor_service is null)"] }),

  define("estimates", {
    customer_id: uuidRef("customers.id", "restrict"),
    job_id: uuidRef("jobs.id", "set null", true),
    estimate_number: text(),
    status: { type: "text", nullable: false, default: "draft" },
    currency: currency(),
    subtotal: money(),
    tax_total: money(),
    total: money(),
    expires_at: { type: "timestamptz", nullable: true }
  }, { tenantScoped: true, financial: true, unique: [["organization_id", "estimate_number"]], checks: ["total = subtotal + tax_total"] }),

  define("estimate_items", {
    estimate_id: uuidRef("estimates.id", "cascade"),
    description: text(),
    quantity: { type: "numeric(12,3)", nullable: false, check: "> 0" },
    unit_price: money(),
    line_total: money(),
    currency: currency()
  }, { tenantScoped: true, financial: true, checks: ["line_total = round(quantity * unit_price, 2)"] }),

  define("invoices", {
    customer_id: uuidRef("customers.id", "restrict"),
    job_id: uuidRef("jobs.id", "set null", true),
    estimate_id: uuidRef("estimates.id", "set null", true),
    invoice_number: text(),
    status: { type: "text", nullable: false, default: "draft" },
    currency: currency(),
    subtotal: money(),
    tax_total: money(),
    total: money(),
    paid_total: { ...money(), default: "0" },
    due_at: { type: "timestamptz", nullable: true }
  }, { tenantScoped: true, financial: true, unique: [["organization_id", "invoice_number"]], checks: ["total = subtotal + tax_total", "paid_total <= total"] }),

  define("invoice_items", {
    invoice_id: uuidRef("invoices.id", "restrict"),
    description: text(),
    quantity: { type: "numeric(12,3)", nullable: false, check: "> 0" },
    unit_price: money(),
    line_total: money(),
    currency: currency()
  }, { tenantScoped: true, financial: true, checks: ["line_total = round(quantity * unit_price, 2)"] }),

  define("payments", {
    invoice_id: uuidRef("invoices.id", "restrict"),
    provider: text(),
    provider_payment_id: text(),
    amount: positiveMoney(),
    currency: currency(),
    method: text(true),
    status: { type: "text", nullable: false, check: "= 'paid'" },
    paid_at: { type: "timestamptz", nullable: false },
    metadata: { type: "jsonb", nullable: false, default: "{}" }
  }, { tenantScoped: true, financial: true, appendOnly: true, unique: [["provider", "provider_payment_id"]] }),

  define("commissions", {
    job_id: uuidRef("jobs.id", "restrict"),
    vendor_id: uuidRef("vendors.id", "restrict"),
    payment_id: uuidRef("payments.id", "restrict"),
    amount: positiveMoney(),
    currency: currency(),
    rate: { type: "numeric(7,4)", nullable: false, check: ">= 0 and <= 1" },
    status: { type: "text", nullable: false, default: "pending" }
  }, { tenantScoped: true, financial: true, appendOnly: true }),

  define("approval_requests", {
    action_key: text(),
    context_hash: { type: "text", nullable: false },
    context_snapshot: { type: "jsonb", nullable: false },
    requested_by: uuidRef("profiles.id", "restrict", true),
    requested_by_service: text(true),
    decided_by: uuidRef("profiles.id", "restrict", true),
    decided_by_service: text(true),
    decision: { type: "text", nullable: false, default: "pending", check: "in ('pending','approved','rejected','expired')" },
    expires_at: { type: "timestamptz", nullable: false },
    decided_at: { type: "timestamptz", nullable: true },
    reason: text(true)
  }, { tenantScoped: true, sensitive: true, checks: [
    "(requested_by is null) <> (requested_by_service is null)",
    "(decision = 'pending' and decided_by is null and decided_by_service is null and decided_at is null) or (decision <> 'pending' and ((decided_by is null) <> (decided_by_service is null)) and decided_at is not null)"
  ] }),

  define("audit_logs", {
    actor_profile_id: uuidRef("profiles.id", "set null", true),
    actor_service: text(true),
    action: text(),
    entity_type: text(),
    entity_id: { type: "uuid", nullable: true },
    outcome: text(),
    context_hash: text(true),
    metadata: { type: "jsonb", nullable: false, default: "{}" },
    occurred_at: { type: "timestamptz", nullable: false, default: "now()" }
  }, { tenantScoped: true, appendOnly: true, sensitive: true, checks: ["(actor_profile_id is null) <> (actor_service is null)"] }),

  define("legacy_id_map", {
    source_collection: text(),
    legacy_id: text(),
    target_table: text(),
    target_id: { type: "uuid", nullable: false },
    source_checksum: text(),
    migration_batch: text()
  }, { unique: [["source_collection", "legacy_id"], ["target_table", "target_id"]] })
]);

const tableMap = new Map(tables.map((table) => [table.name, table]));

function getTable(name) {
  return tableMap.get(name) || null;
}

module.exports = { CORE_SCHEMA_VERSION, getTable, tables };
