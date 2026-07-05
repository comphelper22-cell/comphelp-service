module.exports = {
  table: "ai_memory",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    module: { type: "string", required: true },
    memory_type: { type: "string", required: true },
    content: { type: "string", required: true },
    confidence: { type: "number" },
    status: { type: "string", required: true, allowed: ["active", "needs_review", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["module", "memory_type", "content", "status"]
};
