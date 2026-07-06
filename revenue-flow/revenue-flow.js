const { DATA_FILE, JsonStore, id, now, writeJson } = require("../database/json-store");
const { createJobDispatch } = require("../job-dispatch/job-dispatch");

const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "overdue", "refunded"];

function createRevenueFlow(options = {}) {
  const store = new JsonStore(options.file || DATA_FILE);
  const dispatch = createJobDispatch(options);

  function read() {
    const data = store.read();
    data.estimates = Array.isArray(data.estimates) ? data.estimates : [];
    data.invoices = Array.isArray(data.invoices) ? data.invoices : [];
    data.payments = Array.isArray(data.payments) ? data.payments : [];
    data.customers = Array.isArray(data.customers) ? data.customers : [];
    return data;
  }

  function write(data) {
    writeJson(store.file, { ...data, updatedAt: now() });
  }

  function createEstimate(input = {}) {
    const data = read();
    const estimate = normalizeEstimate(input, data);
    data.estimates.unshift(estimate);
    write(data);
    return ok(estimate);
  }

  function updateEstimate(estimateId, patch = {}) {
    const data = read();
    const index = data.estimates.findIndex((estimate) => estimate.id === estimateId);
    if (index === -1) return fail("estimate_not_found");
    data.estimates[index] = normalizeEstimate(patch, data, data.estimates[index]);
    write(data);
    return ok(data.estimates[index]);
  }

  function approveEstimate(estimateId) {
    return updateEstimate(estimateId, { status: "approved", approvedAt: now() });
  }

  function rejectEstimate(estimateId, reason = "") {
    return updateEstimate(estimateId, { status: "rejected", rejectedAt: now(), rejectionReason: clean(reason, 500) });
  }

  function convertEstimateToJob(estimateId) {
    const data = read();
    const estimate = data.estimates.find((item) => item.id === estimateId);
    if (!estimate) return fail("estimate_not_found");
    if (!/approved/i.test(estimate.status)) return fail("estimate_not_approved");
    const job = dispatch.create({
      customerId: estimate.customerId,
      customerName: estimate.customerName,
      service: estimate.service,
      title: `${estimate.service} Job`,
      address: estimate.address,
      city: estimate.city,
      estimatedHours: estimate.laborHours || estimate.lineItems.labor.hours,
      priority: estimate.urgency === "urgent" || estimate.urgency === "same-day" ? "high" : "normal",
      internalNotes: `Created from estimate ${estimate.id}`
    });
    if (!job.ok) return job;
    updateEstimate(estimateId, { status: "converted", jobId: job.data.id, convertedAt: now() });
    return ok({ estimateId, job: job.data });
  }

  function createInvoice(input = {}) {
    const data = read();
    const invoice = normalizeInvoice(input, data);
    data.invoices.unshift(invoice);
    write(data);
    return ok(invoice);
  }

  function updateInvoice(invoiceId, patch = {}) {
    const data = read();
    const index = data.invoices.findIndex((invoice) => invoice.id === invoiceId);
    if (index === -1) return fail("invoice_not_found");
    data.invoices[index] = normalizeInvoice(patch, data, data.invoices[index]);
    write(data);
    return ok(data.invoices[index]);
  }

  function createInvoiceFromJob(jobId) {
    const data = read();
    const job = (data.jobs || []).find((item) => item.id === jobId);
    if (!job) return fail("job_not_found");
    const relatedEstimate = data.estimates.find((estimate) => estimate.jobId === jobId || sameCustomer(estimate, job));
    return createInvoice({
      jobId,
      customerId: job.customerId,
      customerName: job.customerName,
      lineItems: relatedEstimate ? relatedEstimate.lineItems : calculateLineItems({ laborHours: job.actualHours || job.estimatedHours || 1 }),
      status: "draft",
      paymentStatus: "unpaid",
      notes: "Created from completed job."
    });
  }

  function markInvoice(invoiceId, status, patch = {}) {
    const paymentStatus = status === "paid" ? "paid" : status === "overdue" ? "overdue" : undefined;
    return updateInvoice(invoiceId, { ...patch, status, paymentStatus: paymentStatus || patch.paymentStatus });
  }

  function recordPayment(input = {}) {
    const data = read();
    const invoice = data.invoices.find((item) => item.id === input.invoiceId);
    if (!invoice) return fail("invoice_not_found");
    const amount = money(input.amount);
    const payment = {
      id: id("payment"),
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      amount,
      status: input.status || "paid",
      method: clean(input.method || "manual", 80),
      paymentProcessorConnected: false,
      cardDataStored: false,
      createdAt: now()
    };
    data.payments.unshift(payment);
    const paidTotal = paymentsFor(data, invoice.id).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const paymentStatus = paidTotal >= Number(invoice.total || 0) ? "paid" : paidTotal > 0 ? "partial" : "unpaid";
    const invoiceIndex = data.invoices.findIndex((item) => item.id === invoice.id);
    data.invoices[invoiceIndex] = {
      ...invoice,
      paidAmount: paidTotal,
      outstandingBalance: Math.max(0, Number(invoice.total || 0) - paidTotal),
      paymentStatus,
      status: paymentStatus === "paid" ? "paid" : invoice.status,
      updatedAt: now()
    };
    write(data);
    return ok({ payment, invoice: data.invoices[invoiceIndex] });
  }

  function dashboard() {
    const data = read();
    const invoices = data.invoices || [];
    const estimates = data.estimates || [];
    const paid = invoices.filter((invoice) => invoice.paymentStatus === "paid" || invoice.status === "paid");
    const outstanding = invoices.filter((invoice) => !["paid", "refunded"].includes(invoice.paymentStatus || invoice.status));
    const overdue = invoices.filter((invoice) => (invoice.paymentStatus || invoice.status) === "overdue");
    const converted = estimates.filter((estimate) => /approved|converted/i.test(estimate.status)).length;
    const sent = estimates.filter((estimate) => !/draft/i.test(estimate.status)).length || estimates.length;
    const revenueToday = sumInvoicesByDate(paid, "day");
    const revenueThisWeek = sumInvoicesByDate(paid, "week");
    const revenueThisMonth = sumInvoicesByDate(paid, "month");
    return ok({
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      outstandingInvoices: outstanding.length,
      outstandingBalance: outstanding.reduce((sum, invoice) => sum + Number(invoice.outstandingBalance ?? invoice.total ?? 0), 0),
      overdueInvoices: overdue.length,
      paidInvoices: paid.length,
      estimateConversionRate: sent ? Math.round((converted / sent) * 100) : 0,
      averageTicket: paid.length ? Math.round(paid.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0) / paid.length) : 0,
      estimates: estimates.slice(0, 10),
      invoices: invoices.slice(0, 10),
      aiRevenueRecommendations: recommendations(data)
    });
  }

  function customerFinancials(customerIdOrName) {
    const data = read();
    const customer = findCustomer(data, customerIdOrName, customerIdOrName) || {};
    const names = [customer.id, customer.fullName, customer.name, customer.company, customerIdOrName].filter(Boolean).map((value) => String(value).toLowerCase());
    const estimates = data.estimates.filter((estimate) => matchEntity(estimate, names));
    const invoices = data.invoices.filter((invoice) => matchEntity(invoice, names));
    const payments = data.payments.filter((payment) => matchEntity(payment, names) || invoices.some((invoice) => invoice.id === payment.invoiceId));
    const outstandingBalance = invoices.filter((invoice) => !["paid", "refunded"].includes(invoice.paymentStatus || invoice.status)).reduce((sum, invoice) => sum + Number(invoice.outstandingBalance ?? invoice.total ?? 0), 0);
    const lifetimeRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    return ok({ customer, estimates, invoices, payments, outstandingBalance, lifetimeRevenue });
  }

  return {
    approveEstimate,
    convertEstimateToJob,
    createEstimate,
    createInvoice,
    createInvoiceFromJob,
    customerFinancials,
    dashboard,
    markInvoice,
    recordPayment,
    rejectEstimate,
    updateEstimate,
    updateInvoice
  };
}

function normalizeEstimate(input = {}, data = {}, existing = {}) {
  const customer = findCustomer(data, input.customerId || existing.customerId, input.customerName || existing.customerName);
  const lineItems = calculateLineItems(input.lineItems || input, existing.lineItems);
  const timestamp = now();
  return {
    ...existing,
    id: existing.id || input.id || id("estimate"),
    customerId: input.customerId || existing.customerId || (customer && customer.id) || "",
    customerName: clean(input.customerName || existing.customerName || (customer && (customer.fullName || customer.name)) || "", 140),
    service: clean(input.service || existing.service || "Service", 160),
    city: clean(input.city || existing.city || (customer && customer.city) || "Los Angeles", 100),
    address: clean(input.address || existing.address || (customer && customer.address) || "", 220),
    urgency: clean(input.urgency || existing.urgency || "standard", 80),
    status: clean(input.status || existing.status || "draft", 80),
    lineItems,
    subtotal: lineItems.subtotal,
    discount: lineItems.discount,
    taxPlaceholder: lineItems.taxPlaceholder,
    total: lineItems.total,
    recommended: lineItems.total,
    laborHours: lineItems.labor.hours,
    notes: clean(input.notes || existing.notes, 1500),
    createdAt: existing.createdAt || timestamp,
    updatedAt: timestamp
  };
}

function normalizeInvoice(input = {}, data = {}, existing = {}) {
  const customer = findCustomer(data, input.customerId || existing.customerId, input.customerName || existing.customerName);
  const lineItems = calculateLineItems(input.lineItems || input, existing.lineItems);
  const timestamp = now();
  const desiredPaymentStatus = normalizePaymentStatus(input.paymentStatus || existing.paymentStatus || "unpaid");
  const paidAmount = desiredPaymentStatus === "paid" && input.paidAmount === undefined
    ? lineItems.total
    : Number(input.paidAmount ?? existing.paidAmount ?? 0);
  return {
    ...existing,
    id: existing.id || input.id || id("invoice"),
    invoiceNumber: existing.invoiceNumber || input.invoiceNumber || `INV-${String((data.invoices || []).length + 1).padStart(5, "0")}`,
    jobId: input.jobId || existing.jobId || "",
    customerId: input.customerId || existing.customerId || (customer && customer.id) || "",
    customerName: clean(input.customerName || existing.customerName || (customer && (customer.fullName || customer.name)) || "", 140),
    status: clean(input.status || existing.status || "draft", 80),
    paymentStatus: desiredPaymentStatus,
    lineItems,
    subtotal: lineItems.subtotal,
    discount: lineItems.discount,
    taxPlaceholder: lineItems.taxPlaceholder,
    total: lineItems.total,
    amount: lineItems.total,
    paidAmount,
    outstandingBalance: Math.max(0, lineItems.total - paidAmount),
    dueDate: input.dueDate || existing.dueDate || "",
    notes: clean(input.notes || existing.notes, 1500),
    createdAt: existing.createdAt || timestamp,
    updatedAt: timestamp
  };
}

function calculateLineItems(input = {}, existing = null) {
  if (existing && !Object.keys(input || {}).length) return existing;
  const existingLabor = existing && existing.labor ? existing.labor : {};
  const existingMaterials = existing && existing.materials ? existing.materials : {};
  const inputLabor = input.labor && typeof input.labor === "object" ? input.labor : {};
  const inputMaterials = input.materials && typeof input.materials === "object" ? input.materials : {};
  const labor = {
    description: "Labor",
    hours: money(input.laborHours ?? input.hours ?? inputLabor.hours ?? existingLabor.hours ?? 0),
    rate: money(input.laborRate ?? inputLabor.rate ?? existingLabor.rate ?? 85)
  };
  const materials = {
    description: "Materials",
    amount: money(input.materialCost ?? input.materialAmount ?? inputMaterials.amount ?? (typeof input.materials === "number" ? input.materials : undefined) ?? existingMaterials.amount ?? 0)
  };
  const discount = money(input.discount ?? (existing && existing.discount) ?? 0);
  const taxable = labor.hours * labor.rate + materials.amount - discount;
  const taxPlaceholder = money(input.taxPlaceholder ?? input.tax ?? (existing && existing.taxPlaceholder) ?? 0);
  const subtotal = Math.max(0, taxable);
  const total = Math.max(0, subtotal + taxPlaceholder);
  return { labor, materials, discount, taxPlaceholder, subtotal, total };
}

function recommendations(data) {
  const recs = [];
  const unpaid = data.invoices.find((invoice) => ["unpaid", "partial"].includes(invoice.paymentStatus));
  const overdue = data.invoices.find((invoice) => invoice.paymentStatus === "overdue" || invoice.status === "overdue");
  const approved = data.estimates.find((estimate) => estimate.status === "approved");
  if (unpaid) recs.push({ title: "Follow up unpaid invoice", customerName: unpaid.customerName, estimatedRevenue: unpaid.outstandingBalance || unpaid.total, priority: "HIGH" });
  if (approved) recs.push({ title: "Call customer with approved estimate", customerName: approved.customerName, estimatedRevenue: approved.total, priority: "HIGH" });
  if (overdue) recs.push({ title: "Send reminder for overdue balance", customerName: overdue.customerName, estimatedRevenue: overdue.outstandingBalance || overdue.total, priority: "HIGH" });
  recs.push({ title: "Recommend upsell", customerName: "Next completed customer", estimatedRevenue: 150, priority: "MEDIUM" });
  const lowMargin = data.estimates.find((estimate) => Number(estimate.discount || 0) > Number(estimate.subtotal || 0) * 0.2);
  if (lowMargin) recs.push({ title: "Flag low-margin job", customerName: lowMargin.customerName, estimatedRevenue: lowMargin.total, priority: "MEDIUM" });
  return recs;
}

function sumInvoicesByDate(invoices, range) {
  const nowDate = new Date();
  return invoices.filter((invoice) => {
    const date = new Date(invoice.updatedAt || invoice.createdAt || Date.now());
    if (range === "day") return date.toDateString() === nowDate.toDateString();
    if (range === "month") return date.getFullYear() === nowDate.getFullYear() && date.getMonth() === nowDate.getMonth();
    return nowDate.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
  }).reduce((sum, invoice) => sum + Number(invoice.total || invoice.amount || 0), 0);
}

function paymentsFor(data, invoiceId) {
  return (data.payments || []).filter((payment) => payment.invoiceId === invoiceId);
}

function sameCustomer(left, right) {
  return Boolean(left.customerId && right.customerId && left.customerId === right.customerId) || Boolean(left.customerName && right.customerName && left.customerName === right.customerName);
}

function findCustomer(data, customerId, customerName) {
  return (data.customers || []).find((customer) => customer.id === customerId || [customer.fullName, customer.name, customer.company].filter(Boolean).includes(customerName));
}

function matchEntity(entity, names) {
  return [entity.customerId, entity.customerName, entity.name, entity.company].filter(Boolean).some((value) => names.includes(String(value).toLowerCase()));
}

function normalizePaymentStatus(value) {
  const status = String(value || "unpaid").toLowerCase();
  return PAYMENT_STATUSES.includes(status) ? status : "unpaid";
}

function clean(value, max) {
  return String(value || "").trim().slice(0, max || 1000);
}

function money(value) {
  return Math.max(0, Number(value || 0));
}

function ok(data) {
  return { ok: true, data, error: null, warnings: [], generatedAt: now() };
}

function fail(error) {
  return { ok: false, data: null, error: String(error || "revenue_flow_error"), warnings: [], generatedAt: now() };
}

const defaultRevenueFlow = createRevenueFlow();

module.exports = {
  PAYMENT_STATUSES,
  createRevenueFlow,
  revenueFlow: defaultRevenueFlow
};
