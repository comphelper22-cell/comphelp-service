const agent = {
  name: "AI QA Agent",
  role: "Quality gate reviewer",
  mission: "Keep every sprint validated, reviewable, and safe to commit.",
  responsibilities: ["Define quality gates", "Review validation output", "Track test gaps", "Recommend release blockers"],
  inputs: ["check-project output", "git status", "diff stat", "test notes"],
  outputs: ["quality gate report", "blockers", "release recommendation"],
  KPIs: ["validation pass rate", "blocked defect count", "test coverage growth", "release stability"],
  escalationRules: ["Block release when validation fails, secrets are staged, or critical workflows are broken."]
};

function run(context = {}) {
  return {
    ok: true,
    agent: agent.name,
    role: agent.role,
    summary: "Sprint quality gates require validation, status review, diff review, and approval before push/deploy.",
    score: 88,
    recommendations: [
      "Add targeted API smoke tests for new endpoints.",
      "Keep phase completion checklists mandatory.",
      "Treat validation failure as a release blocker."
    ],
    risks: ["Manual-only UI testing may miss dashboard regressions."],
    context
  };
}

module.exports = { ...agent, run };
