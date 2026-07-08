const { DATA_FILE, JsonStore, now } = require("../database/json-store");

const OPEN_JOB_STATUSES = ["new", "scheduled", "assigned", "en_route", "on_site", "in_progress", "waiting_parts"];
const CLOSED_JOB_STATUSES = ["completed", "cancelled", "archived"];

function createAiOperationsAssistant(options = {}) {
  const store = new JsonStore(options.file || DATA_FILE);

  function read() {
    const data = store.read();
    data.customers = arr(data.customers);
    data.customerNotes = arr(data.customerNotes);
    data.customerTimeline = arr(data.customerTimeline);
    data.jobs = arr(data.jobs);
    data.jobTimeline = arr(data.jobTimeline);
    data.jobAssignments = arr(data.jobAssignments);
    data.estimates = arr(data.estimates);
    data.invoices = arr(data.invoices);
    data.payments = arr(data.payments);
    data.tasks = arr(data.tasks);
    data.vendors = arr(data.vendors);
    return data;
  }

  function ask(input = {}) {
    const question = clean(input.question || input.message || input.query, 600);
    if (!question) return fail("question_required");
    const data = read();
    const intent = parseIntent(question);
    const result = answerIntent(data, intent, question);
    return ok({
      question,
      intent,
      answer: result.answer,
      items: result.items || [],
      metrics: result.metrics || {},
      recommendations: result.recommendations || recommendations(data).data,
      generatedAt: now()
    });
  }

  function summary() {
    const data = read();
    const jobs = activeJobs(data);
    const todaysJobs = jobsToday(data);
    const revenue = revenueInsights().data;
    const recs = recommendations(data).data;
    return ok({
      title: "Today's Operations Summary",
      summary: [
        `${todaysJobs.length} job(s) scheduled today.`,
        `${jobs.length} open job(s) need tracking.`,
        `${currency(revenue.revenueToday)} received today.`,
        `${currency(revenue.outstandingBalance)} outstanding across unpaid invoices.`
      ],
      todaysJobs,
      openJobs: jobs,
      topPriorities: recs.slice(0, 5),
      generatedAt: now()
    });
  }

  function dashboard() {
    const data = read();
    const customer = customerInsights(data).data;
    const job = jobInsights(data).data;
    const revenue = revenueInsights(data).data;
    const health = businessHealth(data).data;
    const recs = recommendations(data).data;
    return ok({
      todaysSummary: summary().data,
      businessHealth: health,
      revenueSnapshot: {
        revenueToday: revenue.revenueToday,
        revenueThisMonth: revenue.revenueThisMonth,
        outstandingBalance: revenue.outstandingBalance,
        overdueInvoices: revenue.overdueInvoices.length,
        estimateConversionRate: revenue.estimateConversionRate
      },
      dispatchStatus: {
        todaysJobs: job.todaysJobs.length,
        emergencyJobs: job.emergencyJobs.length,
        waitingPartsJobs: job.waitingPartsJobs.length,
        overloadedTechnicians: job.overloadedTechnicians
      },
      customerSnapshot: {
        activeCustomers: customer.activeCustomers.length,
        newCustomersThisWeek: customer.newCustomersThisWeek.length,
        inactiveCustomers: customer.inactiveCustomers.length,
        customersWithOverdueInvoices: customer.customersWithOverdueInvoices.length
      },
      topPriorities: recs.slice(0, 5),
      alerts: alerts(data),
      recommendations: recs,
      generatedAt: now()
    });
  }

  function businessHealth(data = read()) {
    const revenue = revenueInsights(data).data;
    const jobs = jobInsights(data).data;
    const customers = customerInsights(data).data;
    let score = 100;
    score -= Math.min(25, revenue.overdueInvoices.length * 5);
    score -= Math.min(20, jobs.emergencyJobs.length * 4);
    score -= Math.min(20, jobs.waitingPartsJobs.length * 4);
    score -= Math.min(15, customers.inactiveCustomers.length * 2);
    score -= Math.min(10, jobs.schedulingConflicts.length * 5);
    score = Math.max(0, Math.round(score));
    return ok({
      score,
      status: score >= 85 ? "healthy" : score >= 65 ? "watch" : "needs_attention",
      signals: {
        overdueInvoices: revenue.overdueInvoices.length,
        emergencyJobs: jobs.emergencyJobs.length,
        waitingPartsJobs: jobs.waitingPartsJobs.length,
        inactiveCustomers: customers.inactiveCustomers.length,
        schedulingConflicts: jobs.schedulingConflicts.length
      }
    });
  }

  function customerInsights(data = read()) {
    const customers = data.customers.filter((customer) => !customer.deleted_at && customer.status !== "archived");
    const activeCustomers = customers.filter((customer) => customer.status !== "archived");
    const newCustomersThisWeek = customers.filter((customer) => withinDays(customer.createdAt || customer.created_at, 7));
    const inactiveCustomers = customers.filter((customer) => !withinDays(lastCustomerTouch(data, customer), 14));
    const overdueInvoices = data.invoices.filter((invoice) => /overdue/i.test(String(invoice.paymentStatus || invoice.status || "")));
    const customersWithOverdueInvoices = customers.filter((customer) => overdueInvoices.some((invoice) => sameCustomer(invoice, customer)));
    const openJobs = activeJobs(data);
    const customersWithActiveJobs = customers.filter((customer) => openJobs.some((job) => sameCustomer(job, customer)));
    return ok({
      activeCustomers,
      newCustomersThisWeek,
      inactiveCustomers,
      customersWithOverdueInvoices,
      customersWithActiveJobs
    });
  }

  function jobInsights(data = read()) {
    const jobs = data.jobs.filter((job) => !job.deleted_at && job.status !== "archived");
    const todaysJobs = jobsToday(data);
    const completedJobsToday = jobs.filter((job) => job.status === "completed" && withinToday(job.completedAt || job.completed_at || job.updatedAt));
    const emergencyJobs = jobs.filter((job) => job.priority === "emergency");
    const waitingPartsJobs = jobs.filter((job) => job.status === "waiting_parts");
    const workload = technicianWorkload(jobs.filter((job) => !CLOSED_JOB_STATUSES.includes(job.status)));
    const overloadedTechnicians = Object.entries(workload).filter(([, count]) => count >= 4).map(([technician, count]) => ({ technician, jobs: count }));
    return ok({
      todaysJobs,
      emergencyJobs,
      waitingPartsJobs,
      completedJobsToday,
      technicianWorkload: workload,
      mostLoadedTechnician: mostLoaded(workload),
      overloadedTechnicians,
      schedulingConflicts: schedulingConflicts(jobs),
      availableTomorrow: availableTomorrow(data),
      bestTechnician: recommendTechnician(data)
    });
  }

  function revenueInsights(data = read()) {
    const invoices = data.invoices;
    const paidInvoices = invoices.filter((invoice) => /paid/i.test(String(invoice.paymentStatus || invoice.status || "")));
    const outstandingInvoices = invoices.filter((invoice) => !/paid|refunded/i.test(String(invoice.paymentStatus || invoice.status || "")));
    const overdueInvoices = invoices.filter((invoice) => /overdue/i.test(String(invoice.paymentStatus || invoice.status || "")));
    const estimates = data.estimates;
    const converted = estimates.filter((estimate) => /approved|converted/i.test(String(estimate.status || ""))).length;
    const sent = estimates.filter((estimate) => !/draft/i.test(String(estimate.status || ""))).length || estimates.length;
    return ok({
      revenueToday: sumInvoices(paidInvoices.filter((invoice) => withinToday(invoice.paidAt || invoice.updatedAt || invoice.createdAt))),
      revenueThisMonth: sumInvoices(paidInvoices.filter((invoice) => withinMonth(invoice.paidAt || invoice.updatedAt || invoice.createdAt))),
      outstandingBalance: outstandingInvoices.reduce((sum, invoice) => sum + Number(invoice.outstandingBalance ?? invoice.total ?? invoice.amount ?? 0), 0),
      outstandingInvoices,
      overdueInvoices,
      paidInvoices,
      estimateConversionRate: sent ? Math.round((converted / sent) * 100) : 0,
      topPayingCustomers: topPayingCustomers(data)
    });
  }

  function recommendations(data = read()) {
    const customer = customerInsights(data).data;
    const job = jobInsights(data).data;
    const revenue = revenueInsights(data).data;
    const recs = [];
    revenue.overdueInvoices.slice(0, 3).forEach((invoice) => {
      recs.push(priority("HIGH", "Send overdue invoice reminder", invoice.customerName || "Customer", currency(invoice.outstandingBalance || invoice.total || 0)));
    });
    revenue.outstandingInvoices
      .filter((invoice) => !/overdue/i.test(String(invoice.paymentStatus || invoice.status || "")))
      .slice(0, 3)
      .forEach((invoice) => {
        recs.push(priority("HIGH", "Follow up unpaid invoice", invoice.customerName || "Customer", currency(invoice.outstandingBalance || invoice.total || 0)));
      });
    data.estimates
      .filter((estimate) => estimate.status === "approved")
      .slice(0, 3)
      .forEach((estimate) => {
        recs.push(priority("HIGH", "Call customer with approved estimate", estimate.customerName || "Customer", currency(estimate.total || 0)));
      });
    job.emergencyJobs.slice(0, 3).forEach((item) => recs.push(priority("HIGH", "Confirm emergency job dispatch", item.customerName || item.title, item.status)));
    job.waitingPartsJobs.slice(0, 3).forEach((item) => recs.push(priority("MEDIUM", "Check waiting-parts job", item.customerName || item.title, item.jobNumber)));
    job.overloadedTechnicians.forEach((item) => recs.push(priority("MEDIUM", "Review technician workload", item.technician, `${item.jobs} open jobs`)));
    customer.inactiveCustomers.slice(0, 3).forEach((item) => recs.push(priority("MEDIUM", "Call inactive customer", item.fullName || item.name || item.company, "No recent contact")));
    recs.push(priority("LOW", "Suggest upsell", "Recent completed customers", "Offer maintenance, WiFi tune-up, or camera health check."));
    return ok(recs.slice(0, 12));
  }

  return {
    ask,
    summary,
    dashboard,
    recommendations,
    businessHealth,
    customerInsights,
    jobInsights,
    revenueInsights
  };
}

function answerIntent(data, intent, question) {
  const customer = customerInsightsFromData(data);
  const jobs = jobInsightsFromData(data);
  const revenue = revenueInsightsFromData(data);
  const recs = createAiOperationsAssistant({ file: "__unused__" }).recommendations(data).data;
  if (intent.name === "todays_jobs") return answer("Today's jobs", jobs.todaysJobs, { count: jobs.todaysJobs.length });
  if (intent.name === "owed_money") return answer("Customers with outstanding invoices", revenue.outstandingInvoices, { outstandingBalance: revenue.outstandingBalance });
  if (intent.name === "revenue_month") return answer(`Revenue this month is ${currency(revenue.revenueThisMonth)}.`, revenue.paidInvoices, { revenueThisMonth: revenue.revenueThisMonth });
  if (intent.name === "revenue_today") return answer(`Revenue today is ${currency(revenue.revenueToday)}.`, revenue.paidInvoices, { revenueToday: revenue.revenueToday });
  if (intent.name === "today_priorities") return { answer: "Here are the highest priority actions for today.", items: recs.slice(0, 5), recommendations: recs.slice(0, 5) };
  if (intent.name === "behind_schedule") return answer("Jobs needing schedule attention", jobs.schedulingConflicts.concat(jobs.waitingPartsJobs), { conflicts: jobs.schedulingConflicts.length });
  if (intent.name === "overloaded_technicians") return answer("Technician workload review", jobs.overloadedTechnicians, { workload: jobs.technicianWorkload });
  if (intent.name === "active_customers") return answer("Active customers", customer.activeCustomers, { count: customer.activeCustomers.length });
  if (intent.name === "new_customers_week") return answer("New customers this week", customer.newCustomersThisWeek, { count: customer.newCustomersThisWeek.length });
  if (intent.name === "not_contacted") return answer("Customers without recent contact", customer.inactiveCustomers, { count: customer.inactiveCustomers.length });
  if (intent.name === "active_jobs_customers") return answer("Customers with active jobs", customer.customersWithActiveJobs, { count: customer.customersWithActiveJobs.length });
  if (intent.name === "emergency_jobs") return answer("Emergency jobs", jobs.emergencyJobs, { count: jobs.emergencyJobs.length });
  if (intent.name === "waiting_parts_jobs") return answer("Waiting-parts jobs", jobs.waitingPartsJobs, { count: jobs.waitingPartsJobs.length });
  if (intent.name === "completed_today") return answer("Completed jobs today", jobs.completedJobsToday, { count: jobs.completedJobsToday.length });
  if (intent.name === "most_work") return answer("Technician with the most work", jobs.mostLoadedTechnician ? [jobs.mostLoadedTechnician] : [], { workload: jobs.technicianWorkload });
  if (intent.name === "available_tomorrow") return answer("Available slots tomorrow", jobs.availableTomorrow, { count: jobs.availableTomorrow.length });
  if (intent.name === "conflicts") return answer("Scheduling conflicts", jobs.schedulingConflicts, { count: jobs.schedulingConflicts.length });
  if (intent.name === "best_technician") return answer("Recommended technician", jobs.bestTechnician ? [jobs.bestTechnician] : [], {});
  if (intent.name === "business_health") return { answer: "Business health summary", items: [], metrics: createBusinessHealth(data) };
  if (intent.name === "paid_invoices") return answer("Paid invoices", revenue.paidInvoices, { count: revenue.paidInvoices.length });
  if (intent.name === "conversion_rate") return answer(`Estimate conversion rate is ${revenue.estimateConversionRate}%.`, [], { estimateConversionRate: revenue.estimateConversionRate });
  if (intent.name === "top_paying_customers") return answer("Top paying customers", revenue.topPayingCustomers, {});
  return { answer: `I understood this as "${intent.name}". Try asking about jobs, customers, revenue, scheduling, or priorities.`, items: [], metrics: { question } };
}

function parseIntent(question) {
  const q = String(question || "").toLowerCase();
  const tests = [
    ["todays_jobs", /today'?s jobs|show.*jobs.*today|jobs today/],
    ["owed_money", /owe|owes|outstanding|unpaid invoice|money/],
    ["revenue_month", /made.*month|revenue.*month|this month/],
    ["revenue_today", /revenue today|made today|today.*revenue/],
    ["today_priorities", /what should i do|call today|priorit|today'?s action/],
    ["behind_schedule", /behind schedule|late jobs|at risk jobs/],
    ["overloaded_technicians", /overloaded|too much work|technician.*most work/],
    ["active_customers", /active customers/],
    ["new_customers_week", /new customers.*week|customers this week/],
    ["not_contacted", /hasn'?t been contacted|not contacted|inactive customers/],
    ["active_jobs_customers", /customers.*active jobs|active jobs.*customers/],
    ["emergency_jobs", /emergency jobs/],
    ["waiting_parts_jobs", /waiting parts/],
    ["completed_today", /completed jobs today|jobs completed today/],
    ["most_work", /most work|busiest technician/],
    ["available_tomorrow", /available tomorrow|who is available/],
    ["conflicts", /conflict|double.?book|scheduling conflict/],
    ["best_technician", /best technician|recommend technician/],
    ["business_health", /business health|health/],
    ["paid_invoices", /paid invoice/],
    ["conversion_rate", /conversion rate|estimate conversion/],
    ["top_paying_customers", /top paying|best customers|highest revenue customers/]
  ];
  const match = tests.find(([, pattern]) => pattern.test(q));
  return { name: match ? match[0] : "general_business_question", confidence: match ? 0.92 : 0.55 };
}

function customerInsightsFromData(data) {
  return createAiOperationsAssistant({ file: "__unused__" }).customerInsights(data).data;
}

function jobInsightsFromData(data) {
  return createAiOperationsAssistant({ file: "__unused__" }).jobInsights(data).data;
}

function revenueInsightsFromData(data) {
  return createAiOperationsAssistant({ file: "__unused__" }).revenueInsights(data).data;
}

function createBusinessHealth(data) {
  return createAiOperationsAssistant({ file: "__unused__" }).businessHealth(data).data;
}

function activeJobs(data) {
  return data.jobs.filter((job) => !job.deleted_at && OPEN_JOB_STATUSES.includes(job.status));
}

function jobsToday(data) {
  return data.jobs.filter((job) => !job.deleted_at && !CLOSED_JOB_STATUSES.includes(job.status) && withinToday(job.startDate || job.scheduledStart));
}

function schedulingConflicts(jobs) {
  const conflicts = [];
  jobs.forEach((job, index) => {
    jobs.slice(index + 1).forEach((other) => {
      if (!job.assignedTechnician || job.assignedTechnician !== other.assignedTechnician) return;
      if (CLOSED_JOB_STATUSES.includes(job.status) || CLOSED_JOB_STATUSES.includes(other.status)) return;
      if (overlaps(job.startDate, job.endDate, other.startDate, other.endDate)) {
        conflicts.push({ technician: job.assignedTechnician, jobs: [job.jobNumber || job.id, other.jobNumber || other.id], startDate: job.startDate });
      }
    });
  });
  return conflicts;
}

function availableTomorrow(data) {
  const busy = new Set(data.jobs.filter((job) => sameDayOffset(job.startDate, 1) && job.assignedTechnician).map((job) => job.assignedTechnician));
  const techs = data.vendors.map((vendor) => vendor.name).filter(Boolean);
  const candidates = techs.length ? techs : ["Owner / Dispatcher"];
  return candidates.filter((tech) => !busy.has(tech)).map((technician) => ({ technician, available: true }));
}

function recommendTechnician(data) {
  const workload = technicianWorkload(activeJobs(data));
  const candidates = Object.keys(workload).length ? Object.keys(workload) : data.vendors.map((vendor) => vendor.name).filter(Boolean);
  const sorted = (candidates.length ? candidates : ["Owner / Dispatcher"]).sort((a, b) => Number(workload[a] || 0) - Number(workload[b] || 0));
  return { technician: sorted[0], reason: "Lowest current open workload in JSON fallback data.", currentJobs: Number(workload[sorted[0]] || 0) };
}

function technicianWorkload(jobs) {
  return jobs.reduce((map, job) => {
    const technician = job.assignedTechnician || "Unassigned";
    map[technician] = (map[technician] || 0) + 1;
    return map;
  }, {});
}

function mostLoaded(workload) {
  return Object.entries(workload).sort((a, b) => b[1] - a[1]).map(([technician, jobs]) => ({ technician, jobs }))[0] || null;
}

function topPayingCustomers(data) {
  const totals = {};
  data.invoices.filter((invoice) => /paid/i.test(String(invoice.paymentStatus || invoice.status || ""))).forEach((invoice) => {
    const name = invoice.customerName || invoice.customerId || "Unknown Customer";
    totals[name] = (totals[name] || 0) + Number(invoice.total || invoice.amount || 0);
  });
  return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([customerName, total]) => ({ customerName, total }));
}

function alerts(data) {
  const jobs = jobInsightsFromData(data);
  const revenue = revenueInsightsFromData(data);
  const output = [];
  if (revenue.overdueInvoices.length) output.push({ level: "high", message: `${revenue.overdueInvoices.length} overdue invoice(s) need reminders.` });
  if (jobs.schedulingConflicts.length) output.push({ level: "high", message: `${jobs.schedulingConflicts.length} scheduling conflict(s) detected.` });
  if (jobs.emergencyJobs.length) output.push({ level: "high", message: `${jobs.emergencyJobs.length} emergency job(s) open.` });
  if (jobs.waitingPartsJobs.length) output.push({ level: "medium", message: `${jobs.waitingPartsJobs.length} job(s) waiting for parts.` });
  return output;
}

function priority(priorityLevel, title, target, detail) {
  return { priority: priorityLevel, title, target, detail, recommendedAction: title };
}

function answer(answerText, items, metrics) {
  return { answer: answerText, items: items || [], metrics: metrics || {} };
}

function sameCustomer(left, right) {
  const leftValues = [left.customerId, left.customerName, left.name, left.fullName, left.company].filter(Boolean).map((value) => String(value).toLowerCase());
  const rightValues = [right.id, right.customerId, right.customerName, right.name, right.fullName, right.company].filter(Boolean).map((value) => String(value).toLowerCase());
  return leftValues.some((value) => rightValues.includes(value));
}

function lastCustomerTouch(data, customer) {
  const dates = [customer.updatedAt, customer.createdAt];
  data.customerNotes.filter((note) => note.customerId === customer.id).forEach((note) => dates.push(note.updatedAt || note.createdAt));
  data.customerTimeline.filter((item) => item.customerId === customer.id).forEach((item) => dates.push(item.timestamp || item.createdAt));
  return dates.filter(Boolean).sort().pop();
}

function sumInvoices(invoices) {
  return invoices.reduce((sum, invoice) => sum + Number(invoice.total || invoice.amount || 0), 0);
}

function overlaps(startA, endA, startB, endB) {
  const a1 = new Date(startA).getTime();
  const a2 = new Date(endA).getTime();
  const b1 = new Date(startB).getTime();
  const b2 = new Date(endB).getTime();
  return Number.isFinite(a1) && Number.isFinite(a2) && Number.isFinite(b1) && Number.isFinite(b2) && a1 < b2 && b1 < a2;
}

function withinToday(value) {
  if (!value) return false;
  const key = dateKey(value);
  return Boolean(key) && key === new Date().toISOString().slice(0, 10);
}

function withinMonth(value) {
  if (!value) return false;
  const key = dateKey(value);
  return Boolean(key) && key.slice(0, 7) === new Date().toISOString().slice(0, 7);
}

function sameDayOffset(value, offsetDays) {
  if (!value) return false;
  const target = new Date();
  target.setDate(target.getDate() + offsetDays);
  return dateKey(value) === target.toISOString().slice(0, 10);
}

function withinDays(value, days) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
}

function currency(value) {
  return `$${Math.round(Number(value || 0)).toLocaleString()}`;
}

function dateKey(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : "";
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function clean(value, max = 120) {
  return String(value || "").trim().slice(0, max);
}

function ok(data) {
  return { ok: true, data, error: null, warnings: [], generatedAt: now() };
}

function fail(error) {
  return { ok: false, data: null, error: String(error || "assistant_error"), warnings: [], generatedAt: now() };
}

const aiOperationsAssistant = createAiOperationsAssistant();

module.exports = {
  aiOperationsAssistant,
  createAiOperationsAssistant,
  parseIntent
};
