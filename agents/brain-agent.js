const brain = require("../brain");

const agent = {
  name: "CompHelp Brain Agent",
  role: "Central AI operating system coordinator",
  mission: "Coordinate context, memory, recommendations, decisions, knowledge, and executive summaries for every future agent.",
  responsibilities: [
    "Normalize operating context",
    "Report memory readiness",
    "Generate structured recommendations",
    "Create decision objects",
    "Expose knowledge registry status",
    "Produce executive summaries"
  ],
  inputs: ["current user", "organization", "customer", "project", "task", "agent", "session"],
  outputs: ["brain status", "brain health", "recommendations", "executive summary", "memory status", "knowledge status"],
  KPIs: ["context completeness", "memory safety", "recommendation usefulness", "decision clarity", "agent adoption"],
  escalationRules: [
    "Escalate memory writes until storage policy is approved.",
    "Escalate customer privacy concerns.",
    "Escalate any request to connect external AI providers or external APIs."
  ]
};

function run(context = {}) {
  return {
    ok: true,
    agent: agent.name,
    role: agent.role,
    brainStatus: brain.brainStatus(context),
    health: brain.brainHealth(context),
    recommendation: brain.recommendation({ topic: "brain_kernel", context }),
    executiveSummary: brain.executiveSummary(),
    memoryStatus: brain.memoryManager.memoryStatus(),
    knowledgeStatus: brain.knowledgeRegistry.knowledgeStatus()
  };
}

module.exports = { ...agent, run };
