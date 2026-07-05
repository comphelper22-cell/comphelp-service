module.exports = {
  table: "technicians",
  organizationScoped: true,
  fields: {
    id: { type: "id", required: true },
    organization_id: { type: "id", required: true },
    name: { type: "string", required: true },
    email: { type: "email" },
    phone: { type: "phone" },
    skills: { type: "json" },
    availability: { type: "string" },
    status: { type: "string", required: true, allowed: ["available", "busy", "offline", "inactive", "archived"] },
    metadata: { type: "json" },
    created_at: { type: "date" },
    updated_at: { type: "date" },
    created_by: { type: "id" },
    updated_by: { type: "id" }
  },
  searchFields: ["name", "email", "phone", "availability", "status"]
};
