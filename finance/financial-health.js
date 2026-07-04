const { calculateKpis } = require("./financial-kpis");

function health(input = {}) {
  const kpis = calculateKpis(input).data;
  return {
    ok: true,
    data: {
      demoMode: kpis.demoMode,
      financialHealthScore: kpis.financialHealthScore,
      status: kpis.financialHealthScore >= 80 ? "healthy" : kpis.financialHealthScore >= 60 ? "watch" : "needs_attention",
      alerts: alerts(kpis),
      generatedAt: new Date().toISOString()
    }
  };
}

function alerts(kpis) {
  const items = [];
  if (kpis.overdueInvoices) items.push("Overdue invoices need owner review.");
  if (kpis.cashFlow < 0) items.push("Cash flow is negative.");
  if (kpis.expenses > kpis.revenueThisMonth) items.push("Expenses are higher than current tracked revenue.");
  if (!items.length) items.push("No critical financial alerts.");
  return items;
}

module.exports = { health };
