const pipeline = require("./brain-pipeline");
const healthEngine = require("./brain-health");
const metrics = require("./brain-metrics");
const events = require("./brain-events");

function status() {
  return {
    ok: true,
    status: "ready",
    name: "CompHelp Brain Orchestrator",
    pipeline: "Memory -> Context -> Decision -> Unified Brain Result",
    modules: {
      memory: "registered",
      context: "registered",
      decision: "registered",
      health: "registered",
      metrics: "registered",
      events: "registered"
    },
    externalAiConnected: false,
    deploymentArchitectureChanged: false,
    timestamp: new Date().toISOString()
  };
}

function health(input = {}) {
  return healthEngine.health(input);
}

function runPipeline(input = {}) {
  return pipeline.runPipeline({ ...input, recordDecision: input.recordDecision === true });
}

function performance(input = {}) {
  const result = runPipeline({ ...input, recordDecision: false });
  return {
    ok: result.ok,
    data: {
      performance: result.data.performance,
      pipelineStatus: result.data.pipelineStatus,
      stepStatuses: result.data.steps.map((step) => ({ name: step.name, status: step.status, durationMs: step.durationMs })),
      metrics: metrics.status(),
      timestamp: new Date().toISOString()
    }
  };
}

function diagnostics(input = {}) {
  const statusResult = status();
  const healthResult = health(input);
  const pipelineResult = pipeline.validatePipeline({ ...input, recordDecision: false });
  return {
    ok: healthResult.ok && pipelineResult.ok,
    data: {
      integrationStatus: healthResult.ok && pipelineResult.ok ? "passed" : "needs_attention",
      orchestrator: statusResult,
      health: healthResult.data,
      pipeline: pipelineResult.data,
      eventLog: events.listEvents(10),
      recommendations: buildRecommendations(healthResult.data, pipelineResult.data),
      timestamp: new Date().toISOString()
    }
  };
}

function buildRecommendations(health, pipelineReport) {
  const recommendations = [];
  if (health.errors && health.errors.length) recommendations.push("Resolve Brain module errors before enabling autonomous workflows.");
  if (health.warnings && health.warnings.length) recommendations.push("Review missing context fields to improve decision confidence.");
  if (pipelineReport.performance && pipelineReport.performance.pipelineTimeMs > 500) recommendations.push("Profile Brain pipeline providers if response time continues to rise.");
  if (!recommendations.length) recommendations.push("Brain pipeline is stable. Continue with Sprint 5 feature planning.");
  return recommendations;
}

module.exports = {
  diagnostics,
  health,
  metrics: performance,
  pipeline: runPipeline,
  status
};
