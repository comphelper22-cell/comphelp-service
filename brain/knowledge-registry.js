const REGISTRY = [
  { key: "customers", source: "database/customers", status: "registered" },
  { key: "vendors", source: "database/vendors", status: "registered" },
  { key: "projects", source: "database/projects", status: "registered" },
  { key: "tasks", source: "database/tasks", status: "registered" },
  { key: "users", source: "database/users", status: "registered" },
  { key: "organizations", source: "database/organizations", status: "registered" },
  { key: "documentation", source: "docs and root markdown files", status: "registered" }
];

function knowledgeStatus() {
  return {
    ok: true,
    status: "registered",
    registry: REGISTRY,
    count: REGISTRY.length,
    externalSourcesConnected: false
  };
}

function listRegistry() {
  return REGISTRY.slice();
}

module.exports = { REGISTRY, knowledgeStatus, listRegistry };
