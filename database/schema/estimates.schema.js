module.exports = {
  table: "estimates",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    customer_id: { type: "id", required: true },
    job_id: { type: "id" },
    service: { type: "string", required: true },
    low_total: { type: "money" },
    high_total: { type: "money" },
    recommended_total: { type: "money" },
    status: { type: "string", required: true, allowed: ["draft", "sent", "accepted", "declined", "expired", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["service", "status"]
};
