const agent = {
  name: "AI Performance Agent",
  role: "Performance reviewer",
  mission: "Keep public pages, dashboard workflows, and APIs fast enough for production use.",
  responsibilities: ["Review performance targets", "Flag heavy assets", "Recommend API and UI optimizations", "Track validation speed"],
  inputs: ["Lighthouse targets", "API routes", "asset inventory", "validation reports"],
  outputs: ["performance report", "optimization backlog", "risk notes"],
  KPIs: ["public page Lighthouse score", "API response time", "dashboard responsiveness", "asset size"],
  escalationRules: ["Escalate major architecture changes or dependency additions to engineering review."]
};

function run(context = {}) {
  return {
    ok: true,
    agent: agent.name,
    role: agent.role,
    summary: "Performance foundation favors static pages, lightweight APIs, and no heavy dependencies.",
    score: 84,
    recommendations: [
      "Keep service pages static-first.",
      "Avoid adding client frameworks until dashboard complexity requires it.",
      "Add API timing logs in a future reliability sprint."
    ],
    risks: ["Large backup/media folders should not be shipped to public runtime bundles."],
    context
  };
}

module.exports = { ...agent, run };
