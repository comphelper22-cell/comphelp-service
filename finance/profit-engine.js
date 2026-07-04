const { calculateKpis } = require("./financial-kpis");

function profit(input = {}) {
  const kpis = calculateKpis(input).data;
  const margin = kpis.revenueThisMonth ? Math.round((kpis.profitEstimate / kpis.revenueThisMonth) * 100) : 0;
  return {
    ok: true,
    data: {
      demoMode: kpis.demoMode,
      revenue: kpis.revenueThisMonth,
      expenses: kpis.expenses,
      profitEstimate: kpis.profitEstimate,
      margin,
      status: margin >= 35 ? "strong" : margin >= 15 ? "watch" : "needs_attention",
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { profit };
