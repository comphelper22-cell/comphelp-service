const assert = require("assert");
const brainOrchestrator = require("../brain/orchestrator/brain-orchestrator");

function run() {
  const result = brainOrchestrator.pipeline({
    type: "leadQualification",
    customer: { name: "Integration Test Customer", city: "Los Angeles" },
    service: "Security Camera Installation",
    recordDecision: false
  });

  assert.strictEqual(result.ok, true, "Brain pipeline should pass.");
  assert.strictEqual(result.data.pipelineStatus, "passed", "Pipeline status should be passed.");
  assert.ok(result.data.memory, "Memory step should return data.");
  assert.ok(result.data.context, "Context step should return data.");
  assert.ok(result.data.decision, "Decision step should return data.");
  assert.ok(result.data.unifiedBrainResult, "Unified Brain result should exist.");
  assert.ok(result.data.performance.pipelineTimeMs >= 0, "Pipeline metrics should include pipeline time.");

  return {
    ok: true,
    pipelineStatus: result.data.pipelineStatus,
    performance: result.data.performance
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
