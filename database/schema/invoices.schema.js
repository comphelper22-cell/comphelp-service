module.exports = {
  table: "invoices",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    customer_id: { type: "id", required: true },
    job_id: { type: "id" },
    estimate_id: { type: "id" },
    invoice_number: { type: "string" },
    total: { type: "money" },
    due_at: { type: "date" },
    status: { type: "string", required: true, allowed: ["draft", "sent", "paid", "overdue", "void", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["invoice_number", "status"]
};
