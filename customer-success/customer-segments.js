const { health } = require("./customer-health");

function segments(input = {}) {
  const customers = health(input).data.customers;
  return {
    ok: true,
    data: {
      vip: customers.filter((customer) => customer.lifetimeValue >= 800).length,
      atRisk: customers.filter((customer) => customer.healthStatus === "at_risk").length,
      repeatReady: customers.filter((customer) => customer.completedJobs > 0).length,
      estimateFollowup: customers.filter((customer) => customer.openEstimates > 0).length,
      newOrUnknown: customers.filter((customer) => !customer.completedJobs && !customer.lifetimeValue).length
    }
  };
}

module.exports = { segments };
