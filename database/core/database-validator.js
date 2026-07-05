const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-\s0-9]{7,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}|^\d{4}-\d{2}-\d{2}T/;

function validateRecord(schema, record = {}) {
  const errors = [];
  const fields = schema.fields || {};
  Object.entries(fields).forEach(([name, rules]) => {
    const value = record[name];
    if (rules.required && (value === undefined || value === null || value === "")) errors.push(`${name}_required`);
    if (value === undefined || value === null || value === "") return;
    if (rules.type === "email" && !EMAIL_RE.test(String(value))) errors.push(`${name}_invalid_email`);
    if (rules.type === "phone" && !PHONE_RE.test(String(value))) errors.push(`${name}_invalid_phone`);
    if (rules.type === "date" && !DATE_RE.test(String(value))) errors.push(`${name}_invalid_date`);
    if (rules.type === "money" && Number(value) < 0) errors.push(`${name}_invalid_money`);
    if (rules.allowed && !rules.allowed.includes(value)) errors.push(`${name}_invalid_status`);
  });
  if (schema.organizationScoped && !record.organization_id && !record.organizationId) errors.push("organization_id_required");
  return { ok: errors.length === 0, errors };
}

function validateSchema(schema) {
  const errors = [];
  ["id", "organization_id", "created_at", "updated_at", "created_by", "updated_by", "status", "metadata"].forEach((field) => {
    if (!schema.fields || !schema.fields[field]) errors.push(`${schema.table}_${field}_missing`);
  });
  return { ok: errors.length === 0, errors };
}

module.exports = {
  validateRecord,
  validateSchema
};
