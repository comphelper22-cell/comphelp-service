const { DATA_FILE, JsonStore, id, now, writeJson } = require("../database/json-store");

const CUSTOMER_STATUSES = ["new", "active", "returning", "commercial", "residential", "archived"];
const SEARCH_FIELDS = ["fullName", "name", "company", "phone", "email", "address", "city", "state", "zip", "status", "leadSource", "assignedSales", "assignedTechnician", "notes"];

function createCustomerCrm(options = {}) {
  const store = new JsonStore(options.file || DATA_FILE);

  function read() {
    const data = store.read();
    data.customers = Array.isArray(data.customers) ? data.customers : [];
    data.customerNotes = Array.isArray(data.customerNotes) ? data.customerNotes : [];
    data.customerTimeline = Array.isArray(data.customerTimeline) ? data.customerTimeline : [];
    return data;
  }

  function write(data) {
    writeJson(store.file, { ...data, updatedAt: now() });
  }

  function listRaw(includeDeleted = false) {
    return read().customers.filter((customer) => includeDeleted || !customer.deleted_at);
  }

  function normalize(input = {}, existing = {}) {
    const timestamp = now();
    const tags = Array.isArray(input.tags) ? input.tags : String(input.tags || existing.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    return {
      ...existing,
      id: existing.id || input.id || id("customer"),
      fullName: clean(input.fullName || input.name || existing.fullName || existing.name, 140),
      name: clean(input.fullName || input.name || existing.fullName || existing.name, 140),
      company: clean(input.company || existing.company, 140),
      phone: clean(input.phone || existing.phone, 60),
      email: clean(input.email || existing.email, 160),
      address: clean(input.address || existing.address, 220),
      city: clean(input.city || existing.city, 100),
      state: clean(input.state || existing.state || "CA", 30),
      zip: clean(input.zip || input.postalCode || existing.zip, 20),
      notes: clean(input.notes || existing.notes, 3000),
      status: normalizeStatus(input.status || existing.status || "new"),
      tags,
      leadSource: clean(input.leadSource || existing.leadSource, 120),
      assignedSales: clean(input.assignedSales || existing.assignedSales, 140),
      assignedTechnician: clean(input.assignedTechnician || existing.assignedTechnician, 140),
      organization_id: input.organization_id || input.organizationId || existing.organization_id || "demo-org",
      createdAt: existing.createdAt || existing.created_at || timestamp,
      created_at: existing.created_at || existing.createdAt || timestamp,
      updatedAt: timestamp,
      updated_at: timestamp,
      metadata: { ...(existing.metadata || {}), ...(input.metadata || {}) }
    };
  }

  function create(input = {}) {
    const validation = validateCustomer(input, true);
    if (!validation.ok) return fail(validation.errors.join(","));
    const data = read();
    const customer = normalize(input);
    data.customers.unshift(customer);
    data.customerTimeline.unshift(timelineItem(customer.id, "Customer Created", "customer", "Customer profile created."));
    write(data);
    return ok(customer);
  }

  function update(customerId, patch = {}) {
    const data = read();
    const index = data.customers.findIndex((customer) => customer.id === customerId && !customer.deleted_at);
    if (index === -1) return fail("customer_not_found");
    const validation = validateCustomer({ ...data.customers[index], ...patch }, false);
    if (!validation.ok) return fail(validation.errors.join(","));
    data.customers[index] = normalize(patch, data.customers[index]);
    data.customerTimeline.unshift(timelineItem(customerId, "Customer Updated", "customer", "Customer profile updated."));
    write(data);
    return ok(data.customers[index]);
  }

  function remove(customerId) {
    const data = read();
    const index = data.customers.findIndex((customer) => customer.id === customerId);
    if (index === -1) return fail("customer_not_found");
    const timestamp = now();
    data.customers[index] = { ...data.customers[index], deleted_at: timestamp, deletedAt: timestamp, updatedAt: timestamp, updated_at: timestamp };
    data.customerTimeline.unshift(timelineItem(customerId, "Customer Deleted", "customer", "Customer soft deleted."));
    write(data);
    return ok(data.customers[index]);
  }

  function archive(customerId) {
    const data = read();
    const index = data.customers.findIndex((customer) => customer.id === customerId && !customer.deleted_at);
    if (index === -1) return fail("customer_not_found");
    const timestamp = now();
    data.customers[index] = {
      ...data.customers[index],
      status: "archived",
      archivedAt: timestamp,
      archived_at: timestamp,
      updatedAt: timestamp,
      updated_at: timestamp
    };
    data.customerTimeline.unshift(timelineItem(customerId, "Customer Archived", "customer", "Customer archived.", timestamp));
    write(data);
    return ok(data.customers[index]);
  }

  function restore(customerId) {
    const data = read();
    const index = data.customers.findIndex((customer) => customer.id === customerId);
    if (index === -1) return fail("customer_not_found");
    const timestamp = now();
    data.customers[index] = {
      ...data.customers[index],
      status: data.customers[index].status === "archived" ? "active" : data.customers[index].status || "active",
      deleted_at: null,
      deletedAt: null,
      archived_at: null,
      archivedAt: null,
      updatedAt: timestamp,
      updated_at: timestamp
    };
    data.customerTimeline.unshift(timelineItem(customerId, "Customer Restored", "customer", "Customer restored."));
    write(data);
    return ok(data.customers[index]);
  }

  function search(filters = {}) {
    const query = String(filters.query || filters.search || "").toLowerCase().trim();
    const filter = String(filters.filter || filters.status || "").toLowerCase().trim();
    const includeArchived = filters.includeArchived === true || filter === "archived";
    let customers = listRaw(false).filter((customer) => includeArchived || customer.status !== "archived");
    if (query) {
      customers = customers.filter((customer) => SEARCH_FIELDS.some((field) => String(customer[field] || "").toLowerCase().includes(query)) || (customer.tags || []).some((tag) => String(tag).toLowerCase().includes(query)));
    }
    if (filter && filter !== "all") {
      customers = customers.filter((customer) => {
        if (filter === "active") return customer.status !== "archived" && !customer.deleted_at;
        if (filter === "archived") return customer.status === "archived";
        if (filter === "commercial" || filter === "residential") return customer.status === filter || (customer.tags || []).map((tag) => tag.toLowerCase()).includes(filter);
        return customer.status === filter || (customer.tags || []).map((tag) => tag.toLowerCase()).includes(filter);
      });
    }
    return ok(customers.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))));
  }

  function profile(customerId) {
    const data = read();
    const customer = data.customers.find((item) => item.id === customerId && !item.deleted_at);
    if (!customer) return fail("customer_not_found");
    return ok({
      customer,
      notes: notes(customerId).data,
      timeline: timeline(customerId).data,
      summary: summary(customerId).data
    });
  }

  function recent(limit = 10) {
    return ok(listRaw(false).filter((customer) => customer.status !== "archived").sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))).slice(0, limit));
  }

  function dashboard() {
    const data = read();
    const customers = data.customers.filter((customer) => !customer.deleted_at);
    const active = customers.filter((customer) => customer.status !== "archived");
    const thisMonth = new Date().toISOString().slice(0, 7);
    const newThisMonth = active.filter((customer) => String(customer.createdAt || customer.created_at || "").slice(0, 7) === thisMonth).length;
    const returning = active.filter((customer) => customer.status === "returning" || (customer.tags || []).some((tag) => /return|repeat/i.test(tag))).length;
    const jobs = arr(data.projects).length + arr(data.jobs).length;
    return ok({
      totalCustomers: active.length,
      archivedCustomers: customers.filter((customer) => customer.status === "archived").length,
      newThisMonth,
      returning,
      jobs,
      revenuePlaceholder: invoiceTotal(data),
      averageResponseTimePlaceholder: "under 24 hours",
      recentCustomers: active.slice(0, 5)
    });
  }

  function timeline(customerId) {
    const data = read();
    const customer = data.customers.find((item) => item.id === customerId);
    if (!customer) return fail("customer_not_found");
    const names = customerNames(customer);
    const items = arr(data.customerTimeline).filter((item) => item.customerId === customerId);
    arr(data.estimates).filter((item) => matchCustomer(item, names)).forEach((estimate) => {
      items.push(timelineItem(customerId, statusLabel(estimate.status, "Estimate Created"), "estimate", estimate.service || estimate.notes || "Estimate activity", estimate.createdAt || estimate.date));
    });
    arr(data.projects).concat(arr(data.jobs)).filter((item) => matchCustomer(item, names)).forEach((job) => {
      items.push(timelineItem(customerId, /complete/i.test(String(job.status || "")) ? "Job Completed" : "Job Created", "job", job.title || job.service || "Job activity", job.completionDate || job.completed_at || job.createdAt || job.date));
    });
    arr(data.invoices).filter((item) => matchCustomer(item, names)).forEach((invoice) => {
      items.push(timelineItem(customerId, "Invoice Created", "invoice", invoice.invoiceNumber || invoice.status || "Invoice activity", invoice.createdAt || invoice.date));
      if (/paid/i.test(String(invoice.status || ""))) items.push(timelineItem(customerId, "Payment Received", "payment", `Payment ${money(invoice.amount || invoice.total)}`, invoice.paidAt || invoice.updatedAt || invoice.date));
    });
    arr(data.customerNotes).filter((note) => note.customerId === customerId && !note.deleted_at).forEach((note) => {
      items.push(timelineItem(customerId, note.internal ? "Internal Note" : "Customer Note", "note", note.body, note.updatedAt || note.createdAt));
    });
    return ok(items.sort((a, b) => String(b.timestamp || "").localeCompare(String(a.timestamp || ""))));
  }

  function note(input = {}) {
    const operation = input.operation || "add";
    if (operation === "list") return notes(input.customerId);
    if (operation === "edit") return editNote(input.noteId, input);
    if (operation === "delete") return deleteNote(input.noteId);
    if (operation === "pin") return editNote(input.noteId, { pinned: true });
    return addNote(input.customerId, input);
  }

  function notes(customerId) {
    const data = read();
    return ok(arr(data.customerNotes).filter((note) => note.customerId === customerId && !note.deleted_at).sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))));
  }

  function addNote(customerId, input = {}) {
    if (!customerId) return fail("customer_id_required");
    if (!clean(input.body, 5000)) return fail("note_body_required");
    const data = read();
    if (!data.customers.some((customer) => customer.id === customerId && !customer.deleted_at)) return fail("customer_not_found");
    const timestamp = now();
    const record = {
      id: id("customer_note"),
      customerId,
      body: clean(input.body, 5000),
      pinned: input.pinned === true || input.pinned === "true",
      internal: input.internal !== false && input.internal !== "false",
      createdAt: timestamp,
      updatedAt: timestamp
    };
    data.customerNotes.unshift(record);
    data.customerTimeline.unshift(timelineItem(customerId, record.internal ? "Internal Note" : "Customer Note", "note", record.body, timestamp));
    write(data);
    return ok(record);
  }

  function editNote(noteId, input = {}) {
    const data = read();
    const index = data.customerNotes.findIndex((item) => item.id === noteId && !item.deleted_at);
    if (index === -1) return fail("note_not_found");
    data.customerNotes[index] = {
      ...data.customerNotes[index],
      body: input.body !== undefined ? clean(input.body, 5000) : data.customerNotes[index].body,
      pinned: input.pinned !== undefined ? input.pinned === true || input.pinned === "true" : data.customerNotes[index].pinned,
      internal: input.internal !== undefined ? input.internal === true || input.internal === "true" : data.customerNotes[index].internal,
      updatedAt: now()
    };
    write(data);
    return ok(data.customerNotes[index]);
  }

  function deleteNote(noteId) {
    const data = read();
    const index = data.customerNotes.findIndex((item) => item.id === noteId);
    if (index === -1) return fail("note_not_found");
    data.customerNotes[index] = { ...data.customerNotes[index], deleted_at: now(), deletedAt: now(), updatedAt: now() };
    write(data);
    return ok(data.customerNotes[index]);
  }

  function summary(customerId) {
    const data = read();
    const customer = data.customers.find((item) => item.id === customerId && !item.deleted_at);
    if (!customer) return fail("customer_not_found");
    const names = customerNames(customer);
    const openJobs = arr(data.projects).concat(arr(data.jobs)).filter((item) => matchCustomer(item, names) && !/complete|cancel|closed/i.test(String(item.status || "")));
    const invoices = arr(data.invoices).filter((item) => matchCustomer(item, names));
    const openInvoices = invoices.filter((invoice) => !/paid|void/i.test(String(invoice.status || "")));
    const notesForCustomer = arr(data.customerNotes).filter((note) => note.customerId === customerId && !note.deleted_at);
    const lastContact = [customer.updatedAt, ...notesForCustomer.map((note) => note.updatedAt || note.createdAt)].filter(Boolean).sort().pop() || customer.createdAt;
    return ok({
      customerId,
      customerName: customer.fullName || customer.name,
      lastContact,
      openJobs: openJobs.length,
      invoices: invoices.length,
      outstandingBalancePlaceholder: invoiceTotal({ invoices: openInvoices }),
      recommendedNextAction: recommendedAction(customer, openJobs, openInvoices, notesForCustomer),
      aiSummary: `${customer.fullName || customer.name} is a ${customer.status || "active"} customer in ${customer.city || "the service area"}. ${openJobs.length} open job(s), ${openInvoices.length} open invoice(s).`
    });
  }

  return { archive, create, dashboard, delete: remove, note, notes, profile, recent, restore, search, summary, timeline, update };
}

function validateCustomer(input = {}, requireName) {
  const errors = [];
  if (requireName && !clean(input.fullName || input.name, 140)) errors.push("full_name_required");
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input.email))) errors.push("invalid_email");
  if (input.phone && !/^[+()\-\s0-9]{7,}$/.test(String(input.phone))) errors.push("invalid_phone");
  if (input.status && !CUSTOMER_STATUSES.includes(normalizeStatus(input.status))) errors.push("invalid_status");
  return { ok: errors.length === 0, errors };
}

function timelineItem(customerId, title, type, description, timestamp) {
  return {
    id: id("timeline"),
    customerId,
    title,
    type,
    description: clean(description, 500),
    timestamp: timestamp || now()
  };
}

function statusLabel(status, fallback) {
  if (/approved|accepted|won/i.test(String(status || ""))) return "Estimate Approved";
  return fallback;
}

function recommendedAction(customer, openJobs, openInvoices, notes) {
  if (openInvoices.length) return "Review outstanding invoice and follow up professionally.";
  if (openJobs.length) return "Check open job status and update the customer.";
  if (!notes.length) return "Add an internal note after the next customer contact.";
  if (customer.status === "new") return "Qualify customer and offer a free estimate.";
  return "Schedule a friendly check-in or review request when appropriate.";
}

function customerNames(customer) {
  return [customer.id, customer.fullName, customer.name, customer.company].filter(Boolean).map((value) => String(value).toLowerCase());
}

function matchCustomer(item, names) {
  const values = [item.customerId, item.customer_id, item.customerName, item.name, item.company].filter(Boolean).map((value) => String(value).toLowerCase());
  return values.some((value) => names.includes(value));
}

function invoiceTotal(data) {
  return arr(data.invoices).reduce((sum, invoice) => sum + Number(invoice.amount || invoice.total || invoice.recommended || 0), 0);
}

function normalizeStatus(status) {
  const value = String(status || "new").trim().toLowerCase().replace(/\s+/g, "_");
  if (value === "returning_customer") return "returning";
  if (value === "archive") return "archived";
  return value;
}

function clean(value, max) {
  return String(value || "").trim().slice(0, max || 1000);
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function money(value) {
  return `$${Math.round(Number(value || 0))}`;
}

function ok(data) {
  return { ok: true, data, error: null, warnings: [], generatedAt: now() };
}

function fail(error) {
  return { ok: false, data: null, error: String(error || "customer_crm_error"), warnings: [], generatedAt: now() };
}

const defaultCrm = createCustomerCrm();

module.exports = {
  createCustomerCrm,
  customerCrm: defaultCrm,
  validateCustomer
};
