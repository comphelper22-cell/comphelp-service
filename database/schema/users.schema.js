module.exports = {
  table: "users",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    name: { type: "string", required: true },
    email: { type: "email", required: true },
    phone: { type: "phone" },
    role_id: { type: "id" },
    status: { type: "string", required: true, allowed: ["active", "invited", "disabled", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["name", "email", "phone", "status"]
};
