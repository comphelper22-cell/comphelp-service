const { invoiceKpis, readFinanceData } = require("./financial-kpis");

function invoices(input = {}) {
  const data = readFinanceData(input);
  const summary = invoiceKpis(data.invoices);
  return {
    ok: true,
    data: {
      demoMode: data.demoMode,
      ...summary,
      invoices: data.invoices,
      alerts: buildAlerts(summary),
      generatedAt: new Date().toISOString()
    }
  };
}

function buildAlerts(summary) {
  const alerts = [];
  if (summary.overdueInvoices) alerts.push(`${summary.overdueInvoices} overdue invoice(s) need review.`);
  if (summary.outstandingInvoices) alerts.push(`${summary.outstandingInvoices} outstanding invoice(s) are waiting for payment.`);
  return alerts;
}

module.exports = { invoices };
