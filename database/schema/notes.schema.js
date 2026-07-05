module.exports = {
  table: "notes",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    attach_type: { type: "string", required: true },
    attach_id: { type: "id", required: true },
    body: { type: "string", required: true },
    status: { type: "string", required: true, allowed: ["active", "pinned", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["attach_type", "body", "status"]
};
