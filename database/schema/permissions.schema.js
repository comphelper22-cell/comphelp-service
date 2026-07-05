module.exports = {
  table: "permissions",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    key: { type: "string", required: true },
    description: { type: "string" },
    status: { type: "string", required: true, allowed: ["active", "inactive", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["key", "description", "status"]
};
