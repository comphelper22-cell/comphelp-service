const memory = require("../memory");
const contextEngine = require("../context/context-engine");
const decisionEngine = require("../decision/decision-engine");
const metrics = require("./brain-metrics");
const events = require("./brain-events");

function runPipeline(input = {}) {
  const measures = [];
  const errors = [];
  const warnings = [];

  const memoryStep = metrics.measure("memory", () => memory.stats(input.memoryScope));
  measures.push(memoryStep);
  if (!memoryStep.ok || !memoryStep.value.ok) errors.push("Memory layer did not return a healthy stats response.");

  const contextStep = metrics.measure("context", () => contextEngine.build({
    ...input,
    memory: memoryStep.value && memoryStep.value.data ? memoryStep.value.data : []
  }));
  measures.push(contextStep);
  if (!contextStep.ok) errors.push("Context engine failed to build a unified context package.");
  if (contextStep.value && contextStep.value.missing && contextStep.value.missing.length) {
    warnings.push(`Missing context: ${contextStep.value.missing.join(", ")}`);
  }

  const decisionStep = metrics.measure("decision", () => decisionEngine.evaluate({
    ...input,
    context: contextStep.value || {},
    record: input.recordDecision === true
  }));
  measures.push(decisionStep);
  if (!decisionStep.ok || !decisionStep.value.ok) errors.push("Decision engine did not return a valid decision.");

  const performance = metrics.summarize(measures);
  const pipelineStatus = errors.length ? "needs_attention" : "passed";
  const unifiedBrainResult = {
    status: pipelineStatus,
    recommendedAction: decisionStep.value && decisionStep.value.data && decisionStep.value.data.decision
      ? decisionStep.value.data.decision.recommendedAction
      : "Review pipeline output.",
    confidence: decisionStep.value && decisionStep.value.data && decisionStep.value.data.decision
      ? decisionStep.value.data.decision.confidence
      : 0,
    contextScore: contextStep.value ? contextStep.value.score : 0,
    warnings
  };

  events.createEvent("pipeline", `Brain pipeline ${pipelineStatus}.`, {
    performance,
    errors: errors.length,
    warnings: warnings.length
  });

  return {
    ok: errors.length === 0,
    data: {
      pipeline: "Memory -> Context -> Decision -> Unified Brain Result",
      pipelineStatus,
      steps: [
        buildStep("memory", memoryStep, "Memory stats and provider availability"),
        buildStep("context", contextStep, "Unified context package"),
        buildStep("decision", decisionStep, "Explainable business decision")
      ],
      memory: memoryStep.value,
      context: contextStep.value,
      decision: decisionStep.value,
      unifiedBrainResult,
      performance,
      errors,
      warnings,
      timestamp: new Date().toISOString()
    }
  };
}

function buildStep(name, measure, description) {
  return {
    name,
    description,
    status: measure.ok && (!measure.value || measure.value.ok !== false) ? "passed" : "failed",
    durationMs: measure.durationMs,
    error: measure.error || (measure.value && measure.value.error) || null
  };
}

function validatePipeline(input = {}) {
  const result = runPipeline({ ...input, recordDecision: false });
  return {
    ok: result.ok,
    data: {
      pipelineStatus: result.data.pipelineStatus,
      stepStatuses: result.data.steps.map((step) => ({ name: step.name, status: step.status })),
      errors: result.data.errors,
      warnings: result.data.warnings,
      performance: result.data.performance
    }
  };
}

module.exports = {
  runPipeline,
  validatePipeline
};
