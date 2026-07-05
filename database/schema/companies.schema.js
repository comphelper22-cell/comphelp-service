module.exports = {
  table: "companies",
  organizationScoped: false,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id" },
    name: { type: "string", required: true },
    email: { type: "email" },
    phone: { type: "phone" },
    service_area: { type: "string" },
    status: { type: "string", required: true, allowed: ["active", "inactive", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["name", "email", "phone", "service_area", "status"]
};
