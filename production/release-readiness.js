const { healthChecks } = require("./health-checks");
const { errorBoundaries } = require("./error-boundaries");
const { securityChecklist } = require("./security-checklist");
const { performanceAudit } = require("./performance-audit");
const { deploymentAudit } = require("./deployment-audit");

function releaseReadiness(input = {}) {
  const health = healthChecks(input).data;
  const errors = errorBoundaries(input).data;
  const security = securityChecklist(input).data;
  const performance = performanceAudit(input).data;
  const deployment = deploymentAudit(input).data;
  const statuses = [health.status, security.status, performance.status, deployment.status];
  const ready = !statuses.includes("blocked") && !statuses.includes("needs_attention");
  return {
    ok: true,
    data: {
      status: ready ? "ready_for_beta_review" : "needs_review",
      health,
      errorBoundaries: errors,
      security,
      performance,
      deployment,
      releaseChecklist: [
        "Run npm run check-project.",
        "Review git status and diff stat.",
        "Confirm no .env, .env.local, or logs/*.jsonl are staged.",
        "Confirm rollback path.",
        "Get owner approval before push or deploy."
      ],
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { releaseReadiness };
