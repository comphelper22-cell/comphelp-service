const memory = require("./memory");
const memoryRegistry = require("./memory-registry");

const MEMORY_TYPES = {
  shortMemory: "Temporary working context for the current task or session.",
  longMemory: "Durable approved facts and decisions.",
  businessMemory: "Business operations, goals, services, processes, and metrics.",
  customerMemory: "Customer-specific context governed by privacy rules.",
  sessionMemory: "Current authenticated session context and temporary dashboard state.",
  knowledgeMemory: "Documentation, SOPs, service knowledge, and technical references.",
  learningMemory: "Future improvement patterns after approval; no autonomous learning yet."
};

function memoryStatus() {
  return {
    ok: true,
    status: "json_memory_ready",
    learningEnabled: false,
    externalAiConnected: false,
    registry: memoryRegistry.status(),
    stats: memory.stats().data,
    types: Object.entries(MEMORY_TYPES).map(([key, description]) => ({
      key,
      description,
      status: key === "learningMemory" ? "interface_only" : "json_ready"
    }))
  };
}

function provideContextData() {
  return {
    ok: true,
    memoryContext: {
      status: "available",
      stats: memory.stats().data,
      registry: memoryRegistry.status()
    }
  };
}

function readMemory(type, query) {
  return memory.load(type, query);
}

function writeMemory(type, record) {
  return memory.save(type, record);
}

module.exports = {
  MEMORY_TYPES,
  clearMemory: memory.clear,
  deleteMemory: memory.delete,
  memoryStatus,
  provideContextData,
  readMemory,
  searchMemory: memory.search,
  stats: memory.stats,
  updateMemory: memory.update,
  writeMemory
};
