const { calculateKpis } = require("./executive-kpi");

function businessHealth(input = {}) {
  const kpis = calculateKpis(input).data;
  const scores = {
    revenue: scoreRevenue(kpis),
    operations: scoreOperations(kpis),
    sales: scoreSales(kpis),
    customers: scoreCustomers(kpis),
    marketing: scoreMarketing(kpis),
    technicians: scoreTechnicians(kpis),
    finance: scoreFinance(kpis),
    inventory: scoreInventory(kpis)
  };
  const overallScore = Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length);
  return {
    ok: true,
    data: {
      overallScore,
      ...scores,
      status: overallScore >= 80 ? "healthy" : overallScore >= 60 ? "watch" : "needs_attention",
      generatedAt: new Date().toISOString()
    }
  };
}

function scoreRevenue(kpis) {
  if (kpis.revenueThisMonth > 0) return 82;
  return kpis.openEstimates > 0 ? 68 : 55;
}

function scoreOperations(kpis) {
  if (kpis.openJobs > 5) return 72;
  return 84;
}

function scoreSales(kpis) {
  return Math.max(45, Math.min(95, 55 + kpis.estimateConversionRate));
}

function scoreCustomers(kpis) {
  return Math.round((kpis.customerSatisfaction.score || 4.5) * 20);
}

function scoreMarketing(kpis) {
  return kpis.marketingPerformance.marketingLeads ? 78 : 58;
}

function scoreTechnicians(kpis) {
  return kpis.technicianPerformance.status === "strong" ? 88 : 64;
}

function scoreFinance(kpis) {
  return kpis.outstandingInvoices > 0 ? 68 : 86;
}

function scoreInventory(kpis) {
  return kpis.inventoryStatus.status === "healthy" ? 90 : 62;
}

module.exports = {
  businessHealth
};
