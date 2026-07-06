const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createRevenueFlow } = require("../revenue-flow/revenue-flow");

const file = path.join(__dirname, "..", "tmp_revenue_dashboard.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
const revenue = createRevenueFlow({ file });
const estimate = revenue.createEstimate({ customerName: "Dash Customer", service: "WiFi", laborHours: 2, materialCost: 100 }).data;
revenue.approveEstimate(estimate.id);
const invoice = revenue.createInvoice({ customerName: "Dash Customer", laborHours: 2, laborRate: 100, materialCost: 100 }).data;
revenue.markInvoice(invoice.id, "sent");
revenue.recordPayment({ invoiceId: invoice.id, amount: 300 });

const dashboard = revenue.dashboard();
assert.strictEqual(dashboard.ok, true);
assert.strictEqual(dashboard.data.paidInvoices, 1);
assert.strictEqual(dashboard.data.revenueThisMonth, 300);
assert.ok(dashboard.data.estimateConversionRate >= 100);
assert.ok(Array.isArray(dashboard.data.aiRevenueRecommendations));

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, revenueDashboard: "working" }, null, 2));
