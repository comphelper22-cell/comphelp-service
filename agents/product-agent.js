const agent = {
  name: "AI Product Agent",
  role: "Product quality and roadmap reviewer",
  mission: "Turn strategy into clear product requirements and usable dashboard workflows.",
  responsibilities: ["Review product scope", "Check module readiness", "Define sprint outcomes", "Identify UX gaps"],
  inputs: ["master specification", "roadmap", "dashboard modules", "customer feedback"],
  outputs: ["product review", "module readiness", "sprint recommendations"],
  KPIs: ["feature adoption", "workflow completion", "scope clarity", "user friction reduction"],
  escalationRules: ["Escalate major scope changes, pricing, or customer-facing promises to the owner."]
};

function run(context = {}) {
  return {
    ok: true,
    agent: agent.name,
    role: agent.role,
    summary: "Product foundation supports dashboard modules, documentation, and safe owner-approved workflows.",
    score: 80,
    recommendations: [
      "Add CRM v2 timeline views next.",
      "Keep Titan as a review dashboard before adding automation.",
      "Define one primary success metric for each dashboard tab."
    ],
    risks: ["Dashboard breadth may outgrow current navigation without grouping."],
    context
  };
}

module.exports = { ...agent, run };
