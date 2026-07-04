const MEMORY_TYPES = {
  shortMemory: "Temporary working context for the current task or session.",
  longMemory: "Durable approved facts and decisions.",
  businessMemory: "Business operations, goals, services, processes, and metrics.",
  customerMemory: "Customer-specific context governed by privacy rules.",
  knowledgeMemory: "Documentation, SOPs, service knowledge, and technical references.",
  learningMemory: "Future improvement patterns after approval; no autonomous learning yet."
};

function memoryStatus() {
  return {
    ok: true,
    status: "architecture_ready",
    learningEnabled: false,
    externalAiConnected: false,
    types: Object.entries(MEMORY_TYPES).map(([key, description]) => ({
      key,
      description,
      status: "interface_defined"
    }))
  };
}

function readMemory(type) {
  return {
    ok: true,
    type,
    data: [],
    note: "Memory persistence interface is defined. No AI learning or external memory provider is connected yet."
  };
}

function writeMemory(type, record) {
  return {
    ok: false,
    type,
    record,
    error: "memory_write_requires_future_storage_policy"
  };
}

module.exports = { MEMORY_TYPES, memoryStatus, readMemory, writeMemory };
