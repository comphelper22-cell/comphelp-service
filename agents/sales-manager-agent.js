const salesEngine = require("../sales/sales-engine");
const executiveEngine = require("../brain/executive/executive-engine");

const agentDefinition = {
  name: "AI Sales Manager",
  role: "Revenue pipeline manager",
  mission: "Increase estimate conversion, reduce missed opportunities, and improve follow-up consistency.",
  responsibilities: [
    "Manage sales pipeline",
    "Prioritize estimates",
    "Predict revenue",
    "Recommend best customer to call",
    "Detect upsell and cross-sell opportunities",
    "Create follow-up priorities"
  ],
  inputs: ["Leads", "Estimates", "Customers", "Tasks", "Executive KPIs", "Recommendations"],
  outputs: ["Sales dashboard", "Priority deals", "Follow-up queue", "Revenue opportunities", "Best next customer"],
  kpis: ["Open estimates", "Won estimates", "Lost estimates", "Conversion rate", "Revenue pipeline", "Follow-up completion"],
  escalationRules: [
    "Escalate high-value deals to the owner.",
    "Never contact customers automatically.",
    "Never offer discounts or change prices without owner approval."
  ]
};

function run(input = {}) {
  const dashboard = salesEngine.dashboard(input).data;
  const executive = executiveEngine.summary(input).data;
  return {
    ...agentDefinition,
    ok: true,
    status: "ready",
    salesDashboard: dashboard,
    executiveSummary: executive.executiveSummary,
    bestNextCustomer: dashboard.salesOverview.bestNextCustomer,
    recommendedAction: dashboard.salesOverview.recommendedAction,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  ...agentDefinition,
  run
};
