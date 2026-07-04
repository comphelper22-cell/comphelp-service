const memory = require("../memory");
const memoryRegistry = require("../memory-registry");
const contextEngine = require("../context/context-engine");
const decisionEngine = require("../decision/decision-engine");
const pipeline = require("./brain-pipeline");
const events = require("./brain-events");

function health(input = {}) {
  const errors = [];
  const warnings = [];
  const moduleStatus = {};
  const missingDependencies = [];

  moduleStatus.memory = readStatus(() => memory.stats(), "ready", errors);
  moduleStatus.memoryRegistry = readStatus(() => memoryRegistry.status(), "ready", errors);
  moduleStatus.context = readStatus(() => contextEngine.status(), "ready", errors);
  moduleStatus.decision = readStatus(() => decisionEngine.status(), "ready", errors);

  ["memory", "context", "decision"].forEach((dependency) => {
    if (!moduleStatus[dependency] || moduleStatus[dependency] === "error") missingDependencies.push(dependency);
  });

  const pipelineCheck = pipeline.validatePipeline({ ...input, recordDecision: false });
  if (!pipelineCheck.ok) errors.push("Brain pipeline validation failed.");
  if (pipelineCheck.data.warnings && pipelineCheck.data.warnings.length) warnings.push(...pipelineCheck.data.warnings);

  const status = errors.length ? "needs_attention" : warnings.length ? "warning" : "healthy";
  return {
    ok: errors.length === 0,
    data: {
      brainHealth: status,
      moduleStatus,
      pipelineStatus: pipelineCheck.data.pipelineStatus,
      missingDependencies,
      averageResponseTimeMs: pipelineCheck.data.performance.averageResponseTimeMs,
      errors,
      warnings,
      events: events.status(),
      timestamp: new Date().toISOString()
    }
  };
}

function readStatus(reader, readyValue, errors) {
  try {
    const result = reader();
    if (result && result.ok === false) {
      errors.push(result.error || "Module returned an unhealthy response.");
      return "error";
    }
    return result && result.status ? result.status : readyValue;
  } catch (error) {
    errors.push(error.message);
    return "error";
  }
}

module.exports = {
  health
};
