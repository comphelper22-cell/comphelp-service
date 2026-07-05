module.exports = {
  table: "customers",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    name: { type: "string", required: true },
    email: { type: "email" },
    phone: { type: "phone" },
    address: { type: "string" },
    city: { type: "string" },
    status: { type: "string", required: true, allowed: ["lead", "active", "vip", "at_risk", "lost", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["name", "email", "phone", "address", "city", "status"]
};
