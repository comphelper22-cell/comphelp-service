const contextEngine = require("./context-engine");
const contextIntelligence = require("./context/context-engine");
const memoryManager = require("./memory-manager");
const recommendationEngine = require("./recommendation-engine");
const decisionEngine = require("./decision-engine");
const businessDecisionEngine = require("./decision/decision-engine");
const knowledgeRegistry = require("./knowledge-registry");
const memoryRegistry = require("./memory-registry");
const executiveSummaryEngine = require("./executive-summary");
const brainOrchestrator = require("./orchestrator/brain-orchestrator");

function brainStatus(input = {}) {
  return {
    ok: true,
    name: "CompHelp Brain Kernel",
    version: "0.1.0-beta",
    status: "architecture_ready",
    externalAiConnected: false,
    externalApisConnected: false,
    learningEnabled: false,
    modules: {
      contextEngine: contextEngine.contextStatus(input).status,
      contextIntelligence: contextIntelligence.status().status,
      memoryManager: memoryManager.memoryStatus().status,
      memoryRegistry: memoryRegistry.status().status,
      recommendationEngine: "ready",
      decisionEngine: decisionEngine.decisionStatus().status,
      businessDecisionEngine: businessDecisionEngine.status().status,
      brainOrchestrator: brainOrchestrator.status().status,
      knowledgeRegistry: knowledgeRegistry.knowledgeStatus().status,
      executiveSummaryEngine: "ready"
    },
    timestamp: new Date().toISOString()
  };
}

function brainHealth(input = {}) {
  const memory = memoryManager.memoryStatus();
  const knowledge = knowledgeRegistry.knowledgeStatus();
  return {
    ok: true,
    status: "healthy",
    brain: brainStatus(input),
    memory,
    memoryRegistry: memoryRegistry.status(),
    knowledge,
    risks: [
      "No AI provider is connected yet.",
      "Memory write policy is intentionally disabled until approved.",
      "Executive summary uses structured defaults until live metrics are connected."
    ]
  };
}

module.exports = {
  brainHealth,
  brainStatus,
  contextEngine,
  contextIntelligence,
  decisionEngine,
  businessDecisionEngine,
  brainOrchestrator,
  executiveSummary: executiveSummaryEngine.executiveSummary,
  knowledgeRegistry,
  memoryManager,
  memoryRegistry,
  recommendation: recommendationEngine.recommendation
};
