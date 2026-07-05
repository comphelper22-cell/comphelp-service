module.exports = {
  table: "payments",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    invoice_id: { type: "id", required: true },
    amount: { type: "money", required: true },
    paid_at: { type: "date" },
    method: { type: "string" },
    status: { type: "string", required: true, allowed: ["pending", "paid", "failed", "refunded", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["method", "status"]
};
