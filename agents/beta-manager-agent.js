const { betaDashboard } = require("../launch/beta-dashboard");

const agent = {
  name: "Beta Manager Agent",
  role: "Beta launch readiness and customer demo manager",
  mission: "Prepare CompHelp AI for first customer demonstrations with clear demo flow, limitations, feedback capture, and readiness scoring.",
  responsibilities: [
    "Prepare demo flow",
    "Summarize demo company data",
    "Generate product tour",
    "Review beta checklist",
    "Surface known limitations",
    "Prepare feedback capture"
  ],
  inputs: ["demo data", "feature tour", "beta checklist", "known limitations", "customer feedback"],
  outputs: ["beta dashboard", "demo script", "readiness score", "known limitations", "feedback fields"],
  KPIs: ["demo clarity", "readiness score", "feedback completion", "known limitation transparency"],
  escalationRules: [
    "Escalate requests to connect external services during beta demo sprint",
    "Escalate requests to hide known limitations",
    "Escalate production onboarding before readiness checklist review"
  ],
  run(input = {}) {
    const dashboard = betaDashboard(input);
    return {
      ok: true,
      agent: this.name,
      report: dashboard.data,
      recommendedAction: "Run the 10-minute demo, collect feedback, then prioritize beta onboarding blockers.",
      generatedAt: new Date().toISOString()
    };
  }
};

module.exports = agent;
