module.exports = {
  table: "tasks",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    title: { type: "string", required: true },
    assigned_to: { type: "id" },
    due_at: { type: "date" },
    priority: { type: "string" },
    status: { type: "string", required: true, allowed: ["todo", "in_progress", "blocked", "done", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["title", "priority", "status"]
};
