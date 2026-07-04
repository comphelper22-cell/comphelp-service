const agent = {
  name: "AI Reliability Agent",
  role: "Reliability and operational readiness reviewer",
  mission: "Ensure CompHelp AI fails safely and remains deployable during incremental development.",
  responsibilities: ["Review fallback behavior", "Check quality gates", "Recommend monitoring", "Track deployment readiness"],
  inputs: ["check-project output", "developer reports", "database health", "deployment reports"],
  outputs: ["reliability report", "failure modes", "readiness recommendations"],
  KPIs: ["validation pass rate", "fallback coverage", "deployment readiness", "incident count"],
  escalationRules: ["Escalate data loss risk, broken validation, failed deployment, or missing rollback path."]
};

function run(context = {}) {
  return {
    ok: true,
    agent: agent.name,
    role: agent.role,
    summary: "Reliability foundation is active through JSON fallback, validation scripts, and approval-only deploy rules.",
    score: 86,
    recommendations: [
      "Add smoke tests for `/api/platform` and `/api/titan`.",
      "Keep JSON fallback working through every Supabase phase.",
      "Create rollback notes for each release."
    ],
    risks: ["Uncommitted generated logs can clutter release reviews."],
    context
  };
}

module.exports = { ...agent, run };
