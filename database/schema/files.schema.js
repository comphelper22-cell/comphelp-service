module.exports = {
  table: "files",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    owner_type: { type: "string" },
    owner_id: { type: "id" },
    file_name: { type: "string", required: true },
    file_url: { type: "string", required: true },
    mime_type: { type: "string" },
    status: { type: "string", required: true, allowed: ["active", "private", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["file_name", "mime_type", "status"]
};
