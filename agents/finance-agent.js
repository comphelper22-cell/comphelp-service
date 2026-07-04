const financeEngine = require("../finance/finance-engine");

const agentDefinition = {
  name: "Finance Agent",
  role: "Financial overview and owner insight assistant",
  mission: "Help service business owners understand revenue, invoices, cash flow, profitability, and financial health.",
  responsibilities: [
    "Summarize revenue",
    "Monitor invoices",
    "Estimate cash flow",
    "Track expenses",
    "Estimate profitability",
    "Forecast monthly revenue",
    "Surface financial alerts"
  ],
  inputs: ["Projects", "Estimates", "Invoices", "Expenses", "Customers"],
  outputs: ["Finance dashboard", "Financial KPIs", "Alerts", "Recommendations"],
  kpis: ["Revenue", "Outstanding invoices", "Overdue invoices", "Cash flow", "Profit estimate", "Financial health score"],
  escalationRules: [
    "Escalate overdue invoices to owner review.",
    "Never charge customers or connect payment gateways automatically.",
    "Never send financial messages without approval."
  ]
};

function run(input = {}) {
  const dashboard = financeEngine.dashboard(input).data;
  return {
    ...agentDefinition,
    ok: true,
    status: "ready",
    financeDashboard: dashboard,
    financialHealthScore: dashboard.financialHealthScore,
    recommendedAction: dashboard.financialAlerts[0] || "Review Finance Center KPIs.",
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  ...agentDefinition,
  run
};
