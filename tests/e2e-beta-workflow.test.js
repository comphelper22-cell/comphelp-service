const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { buildBetaDemoData } = require("../data/beta-demo-data");
const { writeJson } = require("../database/json-store");
const { createCustomerCrm } = require("../crm/customer-crm");
const { createJobDispatch } = require("../job-dispatch/job-dispatch");
const { createRevenueFlow } = require("../revenue-flow/revenue-flow");
const { createAiOperationsAssistant } = require("../ai-operations-assistant/assistant");

const file = path.join(__dirname, "..", "tmp_e2e_beta_workflow.json");
writeJson(file, buildBetaDemoData({}, { baseDate: new Date().toISOString() }));

const crm = createCustomerCrm({ file });
const dispatch = createJobDispatch({ file });
const revenue = createRevenueFlow({ file });
const assistant = createAiOperationsAssistant({ file });

const customer = crm.create({
  fullName: "Beta Workflow Customer",
  phone: "+1-747-295-9999",
  email: "workflow@example.com",
  city: "Los Angeles",
  notes: "Needs camera installation."
});
assert.strictEqual(customer.ok, true);

const estimate = revenue.createEstimate({
  customerId: customer.data.id,
  customerName: customer.data.fullName,
  service: "Security Camera Installation",
  laborHours: 4,
  laborRate: 95,
  materialCost: 450
});
assert.strictEqual(estimate.ok, true);
assert.strictEqual(revenue.approveEstimate(estimate.data.id).data.status, "approved");

const converted = revenue.convertEstimateToJob(estimate.data.id);
assert.strictEqual(converted.ok, true);
const jobId = converted.data.job.id;
assert.strictEqual(dispatch.assign(jobId, { assignedTechnician: "Beta Workflow Technician" }).ok, true);
assert.strictEqual(dispatch.schedule(jobId, { startDate: new Date(Date.now() + 86400000).toISOString(), estimatedHours: 4 }).ok, true);
assert.strictEqual(dispatch.complete(jobId, { actualHours: 4, completionNotes: "Installed cameras and verified mobile viewing." }).ok, true);

const invoice = revenue.createInvoiceFromJob(jobId);
assert.strictEqual(invoice.ok, true);
const payment = revenue.recordPayment({ invoiceId: invoice.data.id, amount: invoice.data.total, method: "demo" });
assert.strictEqual(payment.ok, true);
assert.strictEqual(payment.data.invoice.paymentStatus, "paid");

const summary = assistant.summary();
assert.strictEqual(summary.ok, true);
assert.ok(summary.data.summary.length > 0);

fs.unlinkSync(file);
console.log(JSON.stringify({ ok: true, e2eBetaWorkflow: "working" }, null, 2));
