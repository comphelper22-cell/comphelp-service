const dispatchAiEngine = require("../dispatch-ai/dispatch-ai-engine");

const agent = {
  name: "AI Dispatcher Agent",
  role: "Scheduling and dispatch decision support",
  mission: "Help owners and dispatchers assign jobs, plan routes, estimate arrival windows, and detect urgent scheduling issues.",
  responsibilities: [
    "Review today's schedule",
    "Match technicians to jobs",
    "Suggest route order",
    "Estimate arrival windows",
    "Detect schedule conflicts",
    "Surface emergency jobs"
  ],
  inputs: ["projects", "estimates", "vendors", "technicians", "service area", "job priority"],
  outputs: ["dispatch dashboard", "schedule plan", "route suggestions", "ETA windows", "capacity status", "emergency queue"],
  KPIs: ["schedule health", "assignment confidence", "capacity load", "urgent job visibility"],
  escalationRules: [
    "Escalate overloaded schedules to the owner",
    "Escalate emergency jobs for manual confirmation",
    "Escalate low confidence technician matches",
    "Escalate route suggestions that require map verification"
  ],
  run(input = {}) {
    const dashboard = dispatchAiEngine.dashboard(input);
    return {
      ok: true,
      agent: this.name,
      report: dashboard.data,
      recommendedAction: "Review emergency jobs and schedule conflicts before assigning technicians.",
      generatedAt: new Date().toISOString()
    };
  }
};

module.exports = agent;
