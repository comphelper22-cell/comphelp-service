function validateOrganization(input = {}) {
  const errors = [];
  if (!input.name && !input.organizationId) errors.push("organization_name_or_id_required");
  if (input.status && !["active", "inactive", "pending", "archived"].includes(input.status)) errors.push("unsupported_organization_status");
  return {
    ok: errors.length === 0,
    errors
  };
}

module.exports = {
  validateOrganization
};
