const { readBillingData } = require("./plans");

function invoices(input = {}) {
  const data = readBillingData(input);
  const items = data.invoices.map((invoice, index) => ({
    id: invoice.id || invoice.invoiceId || `billing_invoice_${index + 1}`,
    organizationId: invoice.organizationId || invoice.organization_id || "org_comphelp_service",
    amount: money(invoice.amount || invoice.total || invoice.balance || 0),
    status: invoice.status || "draft",
    dueDate: invoice.dueDate || invoice.due_date || "",
    paidAt: invoice.paidAt || invoice.paid_at || "",
    source: invoice.source || "billing_architecture"
  }));
  return {
    ok: true,
    data: {
      invoices: items,
      openInvoices: items.filter((item) => !/paid|void|cancel/i.test(item.status)).length,
      overdueInvoices: items.filter((item) => /overdue|late/i.test(item.status)).length,
      totalBilled: items.reduce((sum, item) => sum + item.amount, 0),
      paymentProcessingEnabled: false,
      generatedAt: new Date().toISOString()
    }
  };
}

function money(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

module.exports = { invoices };
