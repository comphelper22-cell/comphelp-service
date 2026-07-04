const { demoData } = require("./demo-data");

function demoMode(input = {}) {
  const data = input.data || demoData();
  return {
    ok: true,
    data: {
      enabled: true,
      mode: "beta_customer_demo",
      durationMinutes: 10,
      safeForCustomers: true,
      externalServicesConnected: false,
      demoData: data,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { demoMode };
