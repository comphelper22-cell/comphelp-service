module.exports = {
  table: "roles",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    name: { type: "string", required: true },
    permissions: { type: "json" },
    status: { type: "string", required: true, allowed: ["active", "inactive", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["name", "status"]
};
