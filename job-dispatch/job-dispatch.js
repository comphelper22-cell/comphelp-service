const { DATA_FILE, JsonStore, id, now, writeJson } = require("../database/json-store");

const JOB_STATUSES = ["new", "scheduled", "assigned", "en_route", "on_site", "in_progress", "waiting_parts", "completed", "cancelled", "archived"];
const PRIORITIES = ["emergency", "high", "normal", "low"];

function createJobDispatch(options = {}) {
  const store = new JsonStore(options.file || DATA_FILE);

  function read() {
    const data = store.read();
    data.jobs = Array.isArray(data.jobs) ? data.jobs : [];
    data.jobTimeline = Array.isArray(data.jobTimeline) ? data.jobTimeline : [];
    data.jobAssignments = Array.isArray(data.jobAssignments) ? data.jobAssignments : [];
    data.invoices = Array.isArray(data.invoices) ? data.invoices : [];
    data.customers = Array.isArray(data.customers) ? data.customers : [];
    data.vendors = Array.isArray(data.vendors) ? data.vendors : [];
    return data;
  }

  function write(data) {
    writeJson(store.file, { ...data, updatedAt: now() });
  }

  function create(input = {}) {
    const validation = validateJob(input, true);
    if (!validation.ok) return fail(validation.errors.join(","));
    const data = read();
    const job = normalizeJob(input, data);
    data.jobs.unshift(job);
    data.jobTimeline.unshift(event(job.id, "Job Created", "job", `Job ${job.jobNumber} created.`));
    write(data);
    return ok(job);
  }

  function update(jobId, patch = {}) {
    const data = read();
    const index = findJobIndex(data, jobId);
    if (index === -1) return fail("job_not_found");
    const previous = data.jobs[index];
    const next = normalizeJob(patch, data, previous);
    data.jobs[index] = next;
    data.jobTimeline.unshift(event(jobId, "Job Updated", "job", "Job details updated."));
    if (patch.status && patch.status !== previous.status) {
      data.jobTimeline.unshift(event(jobId, "Status Changed", "status", `${label(previous.status)} -> ${label(next.status)}`));
    }
    write(data);
    return ok(next);
  }

  function assign(jobId, input = {}) {
    const data = read();
    const index = findJobIndex(data, jobId);
    if (index === -1) return fail("job_not_found");
    const previousTechnician = data.jobs[index].assignedTechnician || "";
    const assignedTechnician = clean(input.assignedTechnician || input.technician || "", 140);
    const timestamp = now();
    data.jobs[index] = {
      ...data.jobs[index],
      assignedTechnician,
      status: assignedTechnician ? "assigned" : "new",
      updatedAt: timestamp,
      updated_at: timestamp
    };
    const assignment = {
      id: id("assignment"),
      jobId,
      previousTechnician,
      assignedTechnician,
      action: assignedTechnician ? previousTechnician ? "reassign" : "assign" : "remove_assignment",
      timestamp,
      notes: clean(input.notes, 500)
    };
    data.jobAssignments.unshift(assignment);
    data.jobTimeline.unshift(event(jobId, assignedTechnician ? "Assigned" : "Assignment Removed", "assignment", assignedTechnician ? `Assigned to ${assignedTechnician}.` : "Technician assignment removed.", timestamp));
    write(data);
    return ok({ job: data.jobs[index], assignment, assignmentHistory: assignmentHistory(data, jobId) });
  }

  function schedule(jobId, input = {}) {
    const data = read();
    const index = findJobIndex(data, jobId);
    if (index === -1) return fail("job_not_found");
    const startDate = input.startDate || input.scheduledStart || data.jobs[index].startDate;
    const estimatedHours = Number(input.estimatedHours || data.jobs[index].estimatedHours || 1);
    const endDate = input.endDate || addHours(startDate, estimatedHours);
    const scheduledJob = { ...data.jobs[index], startDate, endDate, estimatedHours };
    const conflict = detectConflict(data.jobs, scheduledJob);
    if (conflict.conflict) return fail("schedule_conflict", { conflicts: conflict.conflicts });
    data.jobs[index] = {
      ...scheduledJob,
      status: data.jobs[index].assignedTechnician ? "scheduled" : data.jobs[index].status === "new" ? "scheduled" : data.jobs[index].status,
      updatedAt: now(),
      updated_at: now()
    };
    data.jobTimeline.unshift(event(jobId, "Rescheduled", "schedule", `Scheduled ${startDate} to ${endDate}.`));
    write(data);
    return ok({ job: data.jobs[index], conflicts: [], suggestedSlots: availableSlots(data.jobs, data.jobs[index].assignedTechnician) });
  }

  function setStatus(jobId, status, notes = "") {
    const value = normalizeStatus(status);
    if (!JOB_STATUSES.includes(value)) return fail("invalid_job_status");
    const data = read();
    const index = findJobIndex(data, jobId);
    if (index === -1) return fail("job_not_found");
    const previous = data.jobs[index].status;
    data.jobs[index] = { ...data.jobs[index], status: value, updatedAt: now(), updated_at: now() };
    data.jobTimeline.unshift(event(jobId, "Status Changed", "status", `${label(previous)} -> ${label(value)}. ${clean(notes, 300)}`));
    write(data);
    return ok(data.jobs[index]);
  }

  function complete(jobId, input = {}) {
    const data = read();
    const index = findJobIndex(data, jobId);
    if (index === -1) return fail("job_not_found");
    const timestamp = now();
    data.jobs[index] = {
      ...data.jobs[index],
      status: "completed",
      actualHours: Number(input.actualHours || data.jobs[index].actualHours || data.jobs[index].estimatedHours || 0),
      completionNotes: clean(input.completionNotes || input.notes, 1200),
      completedAt: timestamp,
      completed_at: timestamp,
      updatedAt: timestamp,
      updated_at: timestamp
    };
    const invoice = invoicePlaceholder(data.jobs[index]);
    data.invoices.unshift(invoice);
    data.jobTimeline.unshift(event(jobId, "Completion", "completion", data.jobs[index].completionNotes || "Job completed.", timestamp));
    data.jobTimeline.unshift(event(jobId, "Invoice Placeholder", "invoice", `Invoice placeholder ${invoice.id} generated.`, timestamp));
    data.jobTimeline.unshift(event(jobId, "AI Recommendation", "ai", "Ask customer for review and schedule follow-up.", timestamp));
    write(data);
    return ok({ job: data.jobs[index], invoicePlaceholder: invoice, timeline: timeline(data.jobs[index].id).data });
  }

  function timeline(jobId) {
    const data = read();
    if (findJobIndex(data, jobId) === -1) return fail("job_not_found");
    return ok(data.jobTimeline.filter((item) => item.jobId === jobId).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))));
  }

  function dashboard() {
    const data = read();
    const jobs = data.jobs.filter((job) => !job.deleted_at && job.status !== "archived");
    const today = new Date().toISOString().slice(0, 10);
    const completed = jobs.filter((job) => job.status === "completed");
    return ok({
      openJobs: jobs.filter((job) => !["completed", "cancelled"].includes(job.status)).length,
      todaysJobs: jobs.filter((job) => String(job.startDate || "").slice(0, 10) === today).length,
      completedJobs: completed.length,
      averageCompletionTime: average(completed.map((job) => Number(job.actualHours || job.estimatedHours || 0))),
      emergencyJobs: jobs.filter((job) => job.priority === "emergency").length,
      technicianWorkload: technicianWorkload(jobs),
      jobs: jobs.slice().sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))),
      availableSlots: availableSlots(jobs),
      aiDispatch: aiDispatch(data)
    });
  }

  function details(jobId) {
    const data = read();
    const job = data.jobs.find((item) => item.id === jobId && !item.deleted_at);
    if (!job) return fail("job_not_found");
    return ok({ job, timeline: timeline(jobId).data, assignmentHistory: assignmentHistory(data, jobId), aiDispatch: aiDispatch(data, job) });
  }

  function aiDispatch(data = read(), job = null) {
    const jobs = data.jobs || [];
    const techs = technicians(data);
    const target = job || jobs.find((item) => !["completed", "cancelled", "archived"].includes(item.status)) || {};
    const suggestedTechnician = suggestTechnician(techs, target);
    const suggestedPriority = target.priority || suggestPriority(target);
    const suggestedDuration = Number(target.estimatedHours || (/camera|security/i.test(target.service || target.title || "") ? 4 : 2));
    const suggestedSlot = availableSlots(jobs, suggestedTechnician.name)[0] || null;
    const conflict = target.id ? detectConflict(jobs, target) : { conflict: false, conflicts: [] };
    return {
      suggestedTechnician: suggestedTechnician.name || "Owner / Dispatcher",
      suggestedPriority,
      suggestedDuration,
      suggestedSlot,
      conflict: conflict.conflict,
      conflicts: conflict.conflicts,
      recommendation: conflict.conflict ? "Choose another time slot before dispatch." : "Confirm technician and schedule the job."
    };
  }

  return { aiDispatch, assign, complete, create, dashboard, details, schedule, status: setStatus, timeline, update };
}

function normalizeJob(input = {}, data = {}, existing = {}) {
  const timestamp = now();
  const customer = findCustomer(data, input.customerId || existing.customerId, input.customerName || existing.customerName);
  const estimatedHours = Number(input.estimatedHours || existing.estimatedHours || 2);
  const startDate = input.startDate || input.scheduledStart || existing.startDate || "";
  const scheduleChanged = input.startDate !== undefined || input.scheduledStart !== undefined || input.estimatedHours !== undefined;
  const endDate = input.endDate || (scheduleChanged && startDate ? addHours(startDate, estimatedHours) : existing.endDate || (startDate ? addHours(startDate, estimatedHours) : ""));
  return {
    ...existing,
    id: existing.id || input.id || id("job"),
    jobNumber: existing.jobNumber || input.jobNumber || nextJobNumber(data),
    customerId: input.customerId || existing.customerId || (customer && customer.id) || "",
    customerName: clean(input.customerName || existing.customerName || (customer && (customer.fullName || customer.name)) || "", 140),
    email: clean(input.email || existing.email || (customer && customer.email) || "", 180),
    phone: clean(input.phone || existing.phone || (customer && customer.phone) || "", 80),
    assignedTechnician: clean(input.assignedTechnician || existing.assignedTechnician, 140),
    priority: normalizePriority(input.priority || existing.priority || "normal"),
    status: normalizeStatus(input.status || existing.status || "new"),
    title: clean(input.title || existing.title || input.service || existing.service || "Service Job", 180),
    service: clean(input.service || existing.service || input.title || existing.title || "Service", 160),
    address: clean(input.address || existing.address || (customer && customer.address) || "", 240),
    city: clean(input.city || existing.city || (customer && customer.city) || "Los Angeles", 100),
    startDate,
    schedulePreset: clean(input.schedulePreset || existing.schedulePreset || "", 20),
    endDate,
    estimatedHours,
    actualHours: Number(input.actualHours || existing.actualHours || 0),
    internalNotes: clean(input.internalNotes || input.notes || existing.internalNotes, 2000),
    attachmentsPlaceholder: input.attachmentsPlaceholder || existing.attachmentsPlaceholder || [],
    completionNotes: clean(input.completionNotes || existing.completionNotes, 2000),
    organization_id: input.organization_id || input.organizationId || existing.organization_id || "demo-org",
    createdAt: existing.createdAt || existing.created_at || timestamp,
    created_at: existing.created_at || existing.createdAt || timestamp,
    updatedAt: timestamp,
    updated_at: timestamp,
    metadata: { ...(existing.metadata || {}), ...(input.metadata || {}) }
  };
}

function validateJob(input = {}, requireCustomer) {
  const errors = [];
  if (requireCustomer && !input.customerId && !input.customerName) errors.push("customer_required");
  if (input.status && !JOB_STATUSES.includes(normalizeStatus(input.status))) errors.push("invalid_job_status");
  if (input.priority && !PRIORITIES.includes(normalizePriority(input.priority))) errors.push("invalid_priority");
  if (input.estimatedHours !== undefined && Number(input.estimatedHours) < 0) errors.push("invalid_estimated_hours");
  return { ok: errors.length === 0, errors };
}

function detectConflict(jobs, target) {
  if (!target.startDate || !target.endDate || !target.assignedTechnician) return { conflict: false, conflicts: [] };
  const start = new Date(target.startDate).getTime();
  const end = new Date(target.endDate).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return { conflict: false, conflicts: [] };
  const conflicts = jobs.filter((job) => job.id !== target.id && job.assignedTechnician === target.assignedTechnician && !["completed", "cancelled", "archived"].includes(job.status) && overlaps(start, end, new Date(job.startDate).getTime(), new Date(job.endDate).getTime()));
  return { conflict: conflicts.length > 0, conflicts: conflicts.map((job) => ({ id: job.id, jobNumber: job.jobNumber, startDate: job.startDate, endDate: job.endDate })) };
}

function availableSlots(jobs, technician = "") {
  const slots = [];
  const base = new Date();
  base.setMinutes(0, 0, 0);
  for (let day = 0; day < 5; day += 1) {
    [9, 11, 13, 15].forEach((hour) => {
      const start = new Date(base);
      start.setDate(base.getDate() + day);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const target = { id: "slot", assignedTechnician: technician, startDate: start.toISOString(), endDate: end.toISOString() };
      if (!technician || !detectConflict(jobs, target).conflict) slots.push({ startDate: start.toISOString(), endDate: end.toISOString(), label: `${start.toLocaleDateString()} ${hour}:00` });
    });
  }
  return slots.slice(0, 12);
}

function technicianWorkload(jobs) {
  return jobs.reduce((workload, job) => {
    const tech = job.assignedTechnician || "Unassigned";
    workload[tech] = (workload[tech] || 0) + 1;
    return workload;
  }, {});
}

function technicians(data) {
  const vendors = Array.isArray(data.vendors) ? data.vendors : [];
  const techs = vendors.map((vendor) => ({ name: vendor.name, category: vendor.category, rating: Number(vendor.rating || 0), status: vendor.status || "active" }));
  return techs.length ? techs : [{ name: "Owner / Dispatcher", category: "All Services", rating: 5, status: "available" }];
}

function suggestTechnician(techs, job) {
  const service = String(job.service || job.title || "").toLowerCase();
  return techs.slice().sort((a, b) => scoreTech(b, service) - scoreTech(a, service))[0] || {};
}

function scoreTech(tech, service) {
  let score = Number(tech.rating || 0);
  if (service && String(tech.category || "").toLowerCase().includes(service.split(" ")[0])) score += 3;
  if (/active|available/i.test(tech.status || "")) score += 1;
  return score;
}

function suggestPriority(job) {
  if (/emergency|urgent|same.?day/i.test(`${job.internalNotes || ""} ${job.service || ""}`)) return "emergency";
  return "normal";
}

function assignmentHistory(data, jobId) {
  return (data.jobAssignments || []).filter((item) => item.jobId === jobId).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
}

function findJobIndex(data, jobId) {
  return data.jobs.findIndex((job) => job.id === jobId && !job.deleted_at);
}

function findCustomer(data, customerId, customerName) {
  return (data.customers || []).find((customer) => customer.id === customerId || [customer.fullName, customer.name, customer.company].filter(Boolean).includes(customerName));
}

function nextJobNumber(data) {
  const count = (data.jobs || []).length + 1;
  return `JOB-${String(count).padStart(5, "0")}`;
}

function invoicePlaceholder(job) {
  return {
    id: id("invoice"),
    jobId: job.id,
    customerId: job.customerId,
    customerName: job.customerName,
    status: "placeholder",
    paymentStatus: "not_applicable",
    amount: 0,
    total: 0,
    placeholder: true,
    notes: "Completion placeholder. Create a revenue invoice for customer billing.",
    createdAt: now()
  };
}

function event(jobId, title, type, description, timestamp) {
  return { id: id("job_timeline"), jobId, title, type, description: clean(description, 600), timestamp: timestamp || now() };
}

function overlaps(startA, endA, startB, endB) {
  if (!Number.isFinite(startB) || !Number.isFinite(endB)) return false;
  return startA < endB && startB < endA;
}

function addHours(value, hours) {
  const date = new Date(value || Date.now());
  return new Date(date.getTime() + Number(hours || 1) * 60 * 60 * 1000).toISOString();
}

function normalizeStatus(status) {
  return String(status || "new").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

function normalizePriority(priority) {
  return String(priority || "normal").trim().toLowerCase();
}

function label(value) {
  return String(value || "").replace(/_/g, " ");
}

function average(values) {
  const usable = values.filter((value) => Number.isFinite(value) && value > 0);
  return usable.length ? Math.round((usable.reduce((sum, value) => sum + value, 0) / usable.length) * 10) / 10 : 0;
}

function clean(value, max) {
  return String(value || "").trim().slice(0, max || 1000);
}

function ok(data) {
  return { ok: true, data, error: null, warnings: [], generatedAt: now() };
}

function fail(error, extra = {}) {
  return { ok: false, data: null, error: String(error || "job_dispatch_error"), warnings: extra.conflicts ? ["schedule_conflict"] : [], ...extra, generatedAt: now() };
}

const defaultDispatch = createJobDispatch();

module.exports = {
  JOB_STATUSES,
  PRIORITIES,
  createJobDispatch,
  jobDispatch: defaultDispatch,
  validateJob
};
