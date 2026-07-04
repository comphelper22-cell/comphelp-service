const customerSuccessEngine = require("../customer-success/customer-success-engine");

const agentDefinition = {
  name: "Customer Success Manager",
  role: "Retention and customer growth assistant",
  mission: "Help service businesses retain customers, identify VIPs, detect at-risk customers, and increase repeat revenue.",
  responsibilities: [
    "Monitor customer health",
    "Identify VIP customers",
    "Detect at-risk customers",
    "Find repeat revenue opportunities",
    "Recommend owner-approved follow-ups",
    "Summarize customer timeline"
  ],
  inputs: ["Customers", "Leads", "Projects", "Estimates", "Invoices", "Tasks"],
  outputs: ["Customer health", "VIP list", "Risk list", "LTV report", "Recommendations"],
  kpis: ["Customer health score", "VIP customers", "At-risk customers", "Lifetime value", "Follow-up needed"],
  escalationRules: [
    "Escalate at-risk customers to owner review.",
    "Never send follow-ups or review requests automatically.",
    "Never invent reviews or customer outcomes."
  ]
};

function run(input = {}) {
  const dashboard = customerSuccessEngine.dashboard(input).data;
  return {
    ...agentDefinition,
    ok: true,
    status: "ready",
    dashboard,
    customerHealthScore: dashboard.customerHealthScore,
    recommendedAction: dashboard.aiCustomerRecommendations[0] ? dashboard.aiCustomerRecommendations[0].description : "Review Customer Success Center.",
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  ...agentDefinition,
  run
};
