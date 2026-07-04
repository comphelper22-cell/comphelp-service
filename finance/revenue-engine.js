const { readFinanceData, revenueItems } = require("./financial-kpis");

function revenue(input = {}) {
  const data = readFinanceData(input);
  const items = revenueItems(data);
  return {
    ok: true,
    data: {
      demoMode: data.demoMode,
      revenueToday: sum(items.today),
      revenueThisWeek: sum(items.week),
      revenueThisMonth: sum(items.month),
      revenueTrend: sum(items.month) ? (sum(items.week) * 4 >= sum(items.month) ? "up" : "flat") : "needs_more_data",
      items: items.all,
      generatedAt: new Date().toISOString()
    }
  };
}

function sum(items) {
  return items.reduce((total, item) => total + Number(item.amount || 0), 0);
}

module.exports = { revenue };
