const operationsEngine = require("../operations/operations-engine");
const executiveEngine = require("../brain/executive/executive-engine");

const agentDefinition = {
  name: "Operations Agent",
  role: "Daily dispatch and service operations assistant",
  mission: "Help owners, dispatchers, and technicians understand today's jobs, urgent work, customer waiting issues, and AI dispatch suggestions.",
  responsibilities: [
    "Summarize today's jobs",
    "Track technician status",
    "Detect urgent and at-risk jobs",
    "Recommend dispatch options",
    "Monitor schedule health",
    "Identify customer waiting issues",
    "Flag inventory needs"
  ],
  inputs: ["Projects", "Estimates", "Vendors", "Customers", "Tasks", "Inventory", "Executive KPIs"],
  outputs: ["Operations dashboard", "Dispatch suggestions", "Schedule health", "Job priority queue", "Inventory needs"],
  kpis: ["Open jobs", "At-risk jobs", "Available technicians", "Schedule health", "Customer waiting count"],
  escalationRules: [
    "Escalate at-risk jobs to owner or dispatcher.",
    "Never assign technicians automatically without approval.",
    "Never contact customers automatically."
  ]
};

function run(input = {}) {
  const dashboard = operationsEngine.dashboard(input).data;
  const executive = executiveEngine.summary(input).data;
  return {
    ...agentDefinition,
    ok: true,
    status: "ready",
    operationsDashboard: dashboard,
    executiveSummary: executive.executiveSummary,
    recommendedAction: dashboard.dispatchSuggestions[0] ? dashboard.dispatchSuggestions[0].recommendedAction : "Review today's operations board.",
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  ...agentDefinition,
  run
};
