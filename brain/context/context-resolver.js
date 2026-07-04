const memoryManager = require("../memory-manager");
const knowledgeRegistry = require("../knowledge-registry");
const recommendationEngine = require("../recommendation-engine");

function resolveSupportingContext(input = {}) {
  const memory = memoryManager.memoryStatus();
  const knowledge = knowledgeRegistry.knowledgeStatus();
  const recommendations = recommendationEngine.recommendation({ topic: "context", context: input });
  return {
    memory,
    knowledge,
    recommendations,
    preferences: input.preferences || { status: "not_attached" },
    permissions: input.permissions || { status: "not_attached" }
  };
}

module.exports = { resolveSupportingContext };
