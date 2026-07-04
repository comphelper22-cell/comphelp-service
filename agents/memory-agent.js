const memory = require("../brain/memory");
const memoryRegistry = require("../brain/memory-registry");
const memoryManager = require("../brain/memory-manager");

const agent = {
  name: "CompHelp Memory Agent",
  role: "Shared memory diagnostics and validation agent",
  mission: "Validate memory providers, report memory health, and keep memory operations safe.",
  responsibilities: ["memory diagnostics", "memory statistics", "memory validation", "registry review"],
  inputs: ["memory provider", "query", "record", "memory registry"],
  outputs: ["memory status", "memory stats", "validation report"],
  KPIs: ["provider coverage", "memory operation success", "registry completeness", "privacy safety"],
  escalationRules: [
    "Escalate customer privacy concerns.",
    "Escalate requests for external memory providers.",
    "Escalate bulk clear/delete requests before production use."
  ]
};

function status() {
  return {
    ok: true,
    agent: agent.name,
    status: "ready",
    memory: memoryManager.memoryStatus(),
    registry: memoryRegistry.status()
  };
}

function stats(scope) {
  return memory.stats(scope);
}

function validate() {
  const registry = memoryRegistry.registry();
  const missing = registry.filter((provider) => provider.functions.length < 6);
  return {
    ok: missing.length === 0,
    providerCount: registry.length,
    missing,
    requiredFunctions: ["save", "load", "update", "delete", "search", "clear"],
    externalMemoryConnected: false
  };
}

function run(context = {}) {
  return {
    ok: true,
    agent: agent.name,
    role: agent.role,
    status: status(),
    stats: stats(),
    validation: validate(),
    context
  };
}

module.exports = { ...agent, run, status, stats, validate };
