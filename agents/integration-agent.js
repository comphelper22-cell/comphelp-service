const brainOrchestrator = require("../brain/orchestrator/brain-orchestrator");

const agentDefinition = {
  name: "Integration Agent",
  role: "Brain integration diagnostics",
  mission: "Verify Memory, Context, Decision, and Orchestrator communication before future AI automation is connected.",
  responsibilities: [
    "Verify module communication",
    "Run integration diagnostics",
    "Validate Memory -> Context -> Decision pipeline",
    "Check internal dependencies",
    "Analyze Brain performance metrics"
  ],
  inputs: ["Brain pipeline payload", "Module health reports", "Performance metrics"],
  outputs: ["Integration status", "Pipeline validation", "Dependency report", "Performance analysis"],
  kpis: ["Pipeline pass rate", "Average pipeline response time", "Missing dependency count", "Error count"],
  escalationRules: [
    "Escalate if any Brain module fails health checks.",
    "Escalate if pipeline validation fails.",
    "Escalate if average pipeline response time exceeds 500ms."
  ]
};

function run(input = {}) {
  const diagnostics = brainOrchestrator.diagnostics(input);
  const health = diagnostics.data.health || {};
  const pipeline = diagnostics.data.pipeline || {};
  return {
    ...agentDefinition,
    ok: diagnostics.ok,
    integrationStatus: diagnostics.data.integrationStatus,
    dependencyCheck: {
      missingDependencies: health.missingDependencies || [],
      moduleStatus: health.moduleStatus || {}
    },
    pipelineValidation: pipeline,
    performance: pipeline.performance || {},
    recommendations: diagnostics.data.recommendations || [],
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  ...agentDefinition,
  run
};
