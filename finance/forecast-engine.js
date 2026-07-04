const { calculateKpis } = require("./financial-kpis");

function forecast(input = {}) {
  const kpis = calculateKpis(input).data;
  return {
    ok: true,
    data: {
      demoMode: kpis.demoMode,
      monthlyForecast: kpis.monthlyForecast,
      cashFlowForecast: Math.round(kpis.monthlyForecast - kpis.expenses),
      revenueTrend: kpis.revenueTrend,
      expenseTrend: kpis.expenseTrend,
      confidence: kpis.demoMode ? 0.45 : 0.68,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { forecast };
