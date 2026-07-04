const POLICIES = {
  highValueCustomer: { priorityBoost: 12, riskAdjustment: "LOW", reason: "Customer value is high." },
  vipCustomer: { priorityBoost: 15, riskAdjustment: "LOW", reason: "VIP customer requires premium handling." },
  emergencyCall: { priorityBoost: 20, riskAdjustment: "MEDIUM", reason: "Emergency call needs fast response." },
  warrantyActive: { priorityBoost: 8, riskAdjustment: "LOW", reason: "Warranty status changes customer handling." },
  lowInventory: { priorityBoost: -10, riskAdjustment: "MEDIUM", reason: "Inventory constraint may delay work." },
  technicianBusy: { priorityBoost: -8, riskAdjustment: "MEDIUM", reason: "Technician availability is constrained." },
  businessHours: { priorityBoost: 6, riskAdjustment: "LOW", reason: "Action is inside normal business hours." },
  afterHours: { priorityBoost: -4, riskAdjustment: "MEDIUM", reason: "After-hours work requires owner review." }
};

function policies() {
  return {
    ok: true,
    status: "ready",
    policies: POLICIES
  };
}

function activePolicies(input = {}) {
  const flags = input.flags || {};
  return Object.keys(POLICIES).filter((key) => Boolean(flags[key] || input[key]));
}

module.exports = { POLICIES, activePolicies, policies };
