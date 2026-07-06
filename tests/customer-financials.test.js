const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { createRevenueFlow } = require("../revenue-flow/revenue-flow");
const { writeJson } = require("../database/json-store");

const file = path.join(__dirname, "..", "tmp_customer_financials.json");
if (fs.existsSync(file)) fs.unlinkSync(file);
writeJson(file, { version: 1, customers: [{ id: "cust_1", fullName: "Financial Customer" }] });
const revenue = createRevenueFlow({ file });
revenue.createEstimate({ customerId: "cust_1", service: "Computer Repair", laborHours: 1 });
const invoice = revenue.createInvoice({ customerId: "cust_1", laborHours: 2, laborRate: 100 }).data;
revenue.recordPayment({ invoiceId: invoice.id, amount: 50 });

const financials = revenue.customerFinancials("cust_1");
assert.strictEqual(financials.ok, true);
assert.strictEqual(financials.data.estimates.length, 1);
assert.strictEqual(financials.data.invoices.length, 1);
assert.strictEqual(financials.data.payments.length, 1);
assert.strictEqual(financials.data.outstandingBalance, 150);
assert.strictEqual(financials.data.lifetimeRevenue, 50);

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, customerFinancials: "working" }, null, 2));
