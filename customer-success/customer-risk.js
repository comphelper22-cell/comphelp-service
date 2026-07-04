const { health } = require("./customer-health");

function risks(input = {}) {
  const customers = health(input).data.customers;
  const atRiskCustomers = customers.filter((customer) => customer.healthStatus === "at_risk" || /risk|unhappy|waiting|churn/i.test(`${customer.status} ${customer.notes}`));
  return {
    ok: true,
    data: atRiskCustomers.map((customer) => ({
      customerName: customer.customerName,
      healthScore: customer.healthScore,
      service: customer.service,
      riskReason: reason(customer),
      recommendedAction: "Create an owner-approved follow-up and ask one clear service question.",
      priority: customer.healthScore < 50 ? "HIGH" : "MEDIUM"
    }))
  };
}

function reason(customer) {
  if (customer.openTasks) return "Open customer success task needs attention.";
  if (customer.openEstimates) return "Open estimate needs follow-up.";
  if (/risk|unhappy|waiting|churn/i.test(`${customer.status} ${customer.notes}`)) return "Customer notes/status indicate risk.";
  return "Customer health score is low.";
}

module.exports = { risks };
