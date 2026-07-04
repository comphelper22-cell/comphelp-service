const { customerProfiles } = require("./customer-ltv");

function lost(input = {}) {
  const profiles = customerProfiles(input).profiles;
  return {
    ok: true,
    data: profiles
      .filter((customer) => /lost|cancel|inactive|rejected/i.test(`${customer.status} ${customer.notes}`) || customer.estimates.some((estimate) => /lost|rejected|cancel/i.test(String(estimate.status || ""))))
      .map((customer) => ({
        customerName: customer.customerName,
        service: customer.service,
        lifetimeValue: customer.lifetimeValue,
        lostReason: "Lost, rejected, inactive, or canceled customer signal.",
        recoveryAction: "Create a low-pressure owner-approved recovery follow-up."
      }))
  };
}

module.exports = { lost };
