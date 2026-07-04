const { invoices } = require("./invoices");
const { subscriptions } = require("./subscriptions");

function paymentStatus(input = {}) {
  const invoiceData = invoices(input).data;
  const subscriptionData = subscriptions(input).data;
  const unpaid = invoiceData.invoices.filter((invoice) => !/paid|void|cancel/i.test(invoice.status));
  return {
    ok: true,
    data: {
      status: unpaid.length ? "manual_review" : "ready",
      paymentProvider: "none",
      stripeConnected: false,
      cardDataStored: false,
      paymentProcessingEnabled: false,
      activeSubscriptions: subscriptionData.activeSubscriptions,
      unpaidInvoices: unpaid.length,
      recommendedAction: "Connect Stripe only in a future approved payments sprint.",
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { paymentStatus };
