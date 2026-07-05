module.exports = {
  table: "inventory",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    item_name: { type: "string", required: true },
    sku: { type: "string" },
    quantity: { type: "number" },
    reorder_level: { type: "number" },
    unit_cost: { type: "money" },
    status: { type: "string", required: true, allowed: ["in_stock", "low", "out", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["item_name", "sku", "status"]
};
