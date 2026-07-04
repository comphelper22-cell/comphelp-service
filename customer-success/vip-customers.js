const { health } = require("./customer-health");

function vip(input = {}) {
  const customers = health(input).data.customers;
  return {
    ok: true,
    data: customers
      .filter((customer) => customer.lifetimeValue >= 800 || /vip|repeat|high value/i.test(`${customer.status} ${customer.notes}`))
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
      .map((customer) => ({
        customerName: customer.customerName,
        lifetimeValue: customer.lifetimeValue,
        completedJobs: customer.completedJobs,
        service: customer.service,
        recommendedAction: "Schedule a personal check-in or maintenance reminder."
      }))
  };
}

module.exports = { vip };
