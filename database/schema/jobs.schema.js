module.exports = {
  table: "jobs",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    customer_id: { type: "id", required: true },
    technician_id: { type: "id" },
    title: { type: "string", required: true },
    service: { type: "string", required: true },
    scheduled_at: { type: "date" },
    completed_at: { type: "date" },
    status: { type: "string", required: true, allowed: ["new", "scheduled", "in_progress", "completed", "cancelled", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["title", "service", "status"]
};
