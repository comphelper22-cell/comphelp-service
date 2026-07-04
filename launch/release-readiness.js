const { betaChecklist } = require("./beta-checklist");
const { knownLimitations } = require("./known-limitations");

function releaseReadiness(input = {}) {
  const checklist = betaChecklist().data.items;
  const limitations = knownLimitations().data.limitations;
  const completed = checklist.filter((item) => item.status === "ready").length;
  const score = Math.round((completed / checklist.length) * 100);
  return {
    ok: true,
    data: {
      betaReadinessScore: score,
      status: score >= 85 ? "ready_for_customer_demo" : "needs_review",
      checklist,
      knownLimitations: limitations,
      recommendedAction: "Run a 10-minute guided demo, collect feedback, and review limitations before onboarding beta users.",
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { releaseReadiness };
