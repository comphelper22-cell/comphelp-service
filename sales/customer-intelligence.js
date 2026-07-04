function analyzeCustomers(data = {}) {
  const customers = Array.isArray(data.customers) ? data.customers : [];
  const leads = Array.isArray(data.leads) ? data.leads : [];
  const estimates = Array.isArray(data.estimates) ? data.estimates : [];
  const vipCustomers = customers.filter((customer) => isVip(customer, estimates));
  const churnRisks = customers.filter((customer) => /risk|unhappy|churn|complaint/i.test(String(customer.status || customer.notes || "")));
  const bestCustomerToCall = pickBestCustomer(leads, estimates, vipCustomers);
  return {
    vipCustomers,
    churnRisks,
    bestCustomerToCall,
    customerCount: customers.length,
    leadCount: leads.length
  };
}

function isVip(customer, estimates) {
  if (/vip|repeat|high value/i.test(String(customer.status || customer.notes || ""))) return true;
  const value = estimates
    .filter((estimate) => estimate.customerId && estimate.customerId === customer.id)
    .reduce((sum, estimate) => sum + Number(estimate.recommendedPrice || estimate.recommended || estimate.total || 0), 0);
  return value >= 1500;
}

function pickBestCustomer(leads, estimates, vipCustomers) {
  const openEstimate = estimates.find((estimate) => !/won|lost|rejected|cancel/i.test(String(estimate.status || "")));
  if (openEstimate) {
    return {
      name: openEstimate.customerName || openEstimate.name || "Open estimate customer",
      source: "open_estimate",
      service: openEstimate.service || "Service estimate"
    };
  }
  if (vipCustomers[0]) return { name: vipCustomers[0].name || "VIP Customer", source: "vip_customer", service: vipCustomers[0].service || "Follow-up" };
  if (leads[0]) return { name: leads[0].name || "New Lead", source: leads[0].source || "lead", service: leads[0].service || "Service request" };
  return { name: "Next qualified lead", source: "pipeline", service: "Free estimate" };
}

module.exports = {
  analyzeCustomers
};
