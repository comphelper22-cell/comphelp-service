const { calculateKpis } = require("./financial-kpis");

function cashflow(input = {}) {
  const kpis = calculateKpis(input).data;
  return {
    ok: true,
    data: {
      demoMode: kpis.demoMode,
      cashFlow: kpis.cashFlow,
      inflow: kpis.revenueThisMonth,
      outflow: kpis.expenses,
      outstandingInvoices: kpis.outstandingInvoices,
      status: kpis.cashFlow >= 0 ? "positive" : "negative",
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { cashflow };
