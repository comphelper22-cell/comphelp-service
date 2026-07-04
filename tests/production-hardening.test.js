const assert = require("assert");
const { healthChecks } = require("../production/health-checks");
const { errorBoundaries } = require("../production/error-boundaries");
const { securityChecklist } = require("../production/security-checklist");
const { performanceAudit } = require("../production/performance-audit");
const { deploymentAudit } = require("../production/deployment-audit");
const { releaseReadiness } = require("../production/release-readiness");
const productionAgent = require("../agents/production-readiness-agent");

function run() {
  const health = healthChecks();
  const errors = errorBoundaries();
  const security = securityChecklist();
  const performance = performanceAudit();
  const deployment = deploymentAudit();
  const readiness = releaseReadiness();
  const agent = productionAgent.run();

  assert.strictEqual(health.ok, true, "Health checks should return ok.");
  assert.strictEqual(errors.ok, true, "Error boundaries should return ok.");
  assert.strictEqual(security.ok, true, "Security checklist should return ok.");
  assert.strictEqual(performance.ok, true, "Performance audit should return ok.");
  assert.strictEqual(deployment.ok, true, "Deployment audit should return ok.");
  assert.strictEqual(readiness.ok, true, "Release readiness should return ok.");
  assert.strictEqual(agent.ok, true, "Production readiness agent should return ok.");
  assert.strictEqual(deployment.data.deploymentRequiresApproval, true, "Deployment must require approval.");
  assert.ok(Array.isArray(readiness.data.releaseChecklist), "Release checklist should exist.");
  assert.ok(agent.report, "Agent report should exist.");

  return {
    ok: true,
    healthStatus: health.data.status,
    securityStatus: security.data.status,
    deploymentStatus: deployment.data.status,
    releaseStatus: readiness.data.status
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
