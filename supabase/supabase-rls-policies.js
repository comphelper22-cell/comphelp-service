const policies = [
  {
    table: "customers",
    policy: "organization_isolation",
    example: "organization_id = current_setting('app.organization_id')::uuid"
  },
  {
    table: "jobs",
    policy: "organization_isolation",
    example: "organization_id = current_setting('app.organization_id')::uuid"
  },
  {
    table: "ai_memory",
    policy: "organization_and_module_isolation",
    example: "organization_id = current_setting('app.organization_id')::uuid"
  }
];

module.exports = {
  policies
};
