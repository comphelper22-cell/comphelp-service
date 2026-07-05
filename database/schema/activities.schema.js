module.exports = {
  table: "activities",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    actor_id: { type: "id" },
    action: { type: "string", required: true },
    entity_type: { type: "string" },
    entity_id: { type: "id" },
    status: { type: "string", required: true, allowed: ["logged", "reviewed", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["action", "entity_type", "status"]
};
