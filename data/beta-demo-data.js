const SERVICES = [
  "Security Camera Installation",
  "WiFi & Network Installation",
  "Computer Repair",
  "Data Recovery",
  "Smart Home Setup",
  "Network Cabling"
];

const CITIES = ["Los Angeles", "Burbank", "Glendale", "North Hollywood", "Studio City"];
const SOURCES = ["Google Business Profile", "Website", "Instagram", "Referral", "Yelp", "Facebook"];

function buildBetaDemoData(existing = {}, options = {}) {
  const baseDate = options.baseDate ? new Date(options.baseDate) : new Date();
  const technicians = buildTechnicians();
  const customers = buildCustomers(baseDate);
  const jobs = buildJobs(customers, technicians, baseDate);
  const estimates = buildEstimates(customers, jobs, baseDate);
  const invoices = buildInvoices(customers, jobs, estimates, baseDate);
  const payments = buildPayments(invoices, baseDate);
  const leads = buildMarketingLeads(baseDate);
  const projects = jobs.map((job) => ({
    id: `project_${job.id}`,
    customerId: job.customerId,
    customerName: job.customerName,
    title: job.title,
    service: job.service,
    city: job.city,
    status: job.status === "completed" ? "completed" : "active",
    value: job.value,
    projectValue: job.value,
    revenue: job.status === "completed" ? job.value : 0,
    assignedTechnician: job.assignedTechnician,
    startDate: job.startDate,
    completionDate: job.completedAt || "",
    reviewRating: job.status === "completed" ? 5 : 0,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  }));

  return {
    ...existing,
    version: existing.version || 1,
    betaDemoSeed: true,
    betaDemoSeedGeneratedAt: baseDate.toISOString(),
    vendors: technicians,
    technicians,
    customers,
    jobs,
    projects,
    estimates,
    invoices,
    payments,
    leads,
    sourceLeads: leads,
    customerNotes: buildCustomerNotes(customers, baseDate),
    customerTimeline: buildCustomerTimeline(customers, estimates, invoices, baseDate),
    jobTimeline: buildJobTimeline(jobs),
    jobAssignments: jobs.map((job) => ({
      id: `assignment_${job.id}`,
      jobId: job.id,
      previousTechnician: "",
      assignedTechnician: job.assignedTechnician,
      action: "assign",
      timestamp: job.updatedAt,
      notes: "Beta demo technician assignment."
    })),
    dispatches: jobs.filter((job) => job.assignedTechnician).slice(0, 20).map((job) => ({
      id: `dispatch_${job.id}`,
      jobId: job.id,
      customerName: job.customerName,
      technician: job.assignedTechnician,
      service: job.service,
      status: job.status,
      scheduledAt: job.startDate,
      createdAt: job.createdAt
    })),
    followUps: customers.slice(0, 18).map((customer, index) => ({
      id: `followup_${index + 1}`,
      customerId: customer.id,
      customerName: customer.fullName,
      status: index % 3 === 0 ? "due" : "scheduled",
      reason: index % 2 === 0 ? "Estimate follow-up" : "Review request",
      dueAt: offsetDate(baseDate, index % 5).toISOString()
    })),
    messageQueue: [],
    commissions: invoices.filter((invoice) => invoice.paymentStatus === "paid").slice(0, 12).map((invoice, index) => ({
      id: `commission_${index + 1}`,
      projectValue: invoice.total,
      revenue: invoice.total,
      expectedCommission: Math.round(invoice.total * 0.1),
      status: index % 2 === 0 ? "expected" : "paid",
      customerName: invoice.customerName,
      createdAt: invoice.updatedAt
    })),
    mediaReviews: projects.slice(0, 8).map((project, index) => ({
      id: `media_review_${index + 1}`,
      projectId: project.id,
      title: `${project.service} media draft`,
      status: "draft",
      createdAt: project.updatedAt
    })),
    activityLogs: buildActivityLogs(jobs, invoices),
    updatedAt: baseDate.toISOString()
  };
}

function buildTechnicians() {
  const names = ["Alex Rivera", "Maya Chen", "Daniel Brooks", "Sofia Martinez", "Chris Patel", "Nina Park", "Leo Johnson", "Arman Grigoryan", "Elena Torres", "Marcus Lee"];
  const categories = ["Cameras", "WiFi", "Computer Repair", "Data Recovery", "Smart Home"];
  return names.map((name, index) => ({
    id: `tech_${String(index + 1).padStart(2, "0")}`,
    name,
    category: categories[index % categories.length],
    services: [SERVICES[index % SERVICES.length], SERVICES[(index + 2) % SERVICES.length]],
    city: CITIES[index % CITIES.length],
    phone: `+1-747-295-${String(1400 + index).padStart(4, "0")}`,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@demo.comphelp.local`,
    website: "",
    serviceArea: "Los Angeles County",
    commissionPercent: 10 + (index % 4),
    rating: Number((4.5 + (index % 5) / 10).toFixed(1)),
    availability: index % 3 === 0 ? "Today" : index % 3 === 1 ? "Tomorrow" : "This week",
    status: "active",
    notes: "Beta demo technician profile."
  }));
}

function buildCustomers(baseDate) {
  const businessTypes = ["Market", "Restaurant", "Smoke Shop", "Office", "Homeowner", "Auto Repair", "Laundromat", "Studio", "Clinic", "Warehouse"];
  return Array.from({ length: 100 }, (_, index) => {
    const id = `cust_${String(index + 1).padStart(3, "0")}`;
    const city = CITIES[index % CITIES.length];
    const type = businessTypes[index % businessTypes.length];
    const createdAt = offsetDate(baseDate, -(index % 42)).toISOString();
    return {
      id,
      fullName: `${city} ${type} Customer ${index + 1}`,
      name: `${city} ${type} Customer ${index + 1}`,
      company: `${city} ${type} ${index + 1}`,
      phone: `+1-747-295-${String(2000 + index).padStart(4, "0")}`,
      email: `customer${index + 1}@demo.comphelp.local`,
      address: `${100 + index} Demo ${type} Ave`,
      city,
      state: "CA",
      zip: String(90000 + (index % 80)),
      notes: `Interested in ${SERVICES[index % SERVICES.length].toLowerCase()} support.`,
      status: index % 11 === 0 ? "returning" : index % 7 === 0 ? "commercial" : "active",
      tags: [type.toLowerCase(), index % 2 === 0 ? "commercial" : "residential"],
      leadSource: SOURCES[index % SOURCES.length],
      assignedSales: index % 2 === 0 ? "Owner" : "Office Manager",
      assignedTechnician: "",
      createdAt,
      created_at: createdAt,
      updatedAt: offsetDate(baseDate, -(index % 15)).toISOString(),
      updated_at: offsetDate(baseDate, -(index % 15)).toISOString()
    };
  });
}

function buildJobs(customers, technicians, baseDate) {
  const statuses = ["scheduled", "assigned", "in_progress", "waiting_parts", "completed", "completed", "new", "on_site", "en_route", "cancelled"];
  return Array.from({ length: 50 }, (_, index) => {
    const customer = customers[index * 2];
    const technician = technicians[index % technicians.length];
    const status = statuses[index % statuses.length];
    const service = SERVICES[index % SERVICES.length];
    const dayOffset = index < 10 ? 0 : index < 22 ? 1 : -(index % 18);
    const start = withHour(offsetDate(baseDate, dayOffset), 8 + (index % 8));
    const estimatedHours = 2 + (index % 5);
    const value = serviceValue(service, index);
    return {
      id: `job_${String(index + 1).padStart(3, "0")}`,
      jobNumber: `JOB-${String(index + 1).padStart(5, "0")}`,
      customerId: customer.id,
      customerName: customer.fullName,
      assignedTechnician: technician.name,
      priority: index % 13 === 0 ? "emergency" : index % 5 === 0 ? "high" : "normal",
      status,
      title: `${service} - ${customer.company}`,
      service,
      address: customer.address,
      city: customer.city,
      startDate: start.toISOString(),
      endDate: new Date(start.getTime() + estimatedHours * 3600000).toISOString(),
      estimatedHours,
      actualHours: status === "completed" ? estimatedHours + (index % 2) : 0,
      value,
      internalNotes: status === "waiting_parts" ? "Waiting for replacement hardware." : "Beta demo job.",
      completionNotes: status === "completed" ? "Work completed and customer walkthrough finished." : "",
      completedAt: status === "completed" ? offsetDate(baseDate, -(index % 7)).toISOString() : "",
      createdAt: offsetDate(baseDate, -(index % 30)).toISOString(),
      updatedAt: offsetDate(baseDate, -(index % 5)).toISOString()
    };
  });
}

function buildEstimates(customers, jobs, baseDate) {
  return Array.from({ length: 30 }, (_, index) => {
    const customer = customers[index * 3];
    const service = SERVICES[index % SERVICES.length];
    const status = index % 5 === 0 ? "draft" : index % 5 === 1 ? "sent" : index % 5 === 2 ? "approved" : index % 5 === 3 ? "converted" : "rejected";
    const total = serviceValue(service, index);
    return {
      id: `estimate_${String(index + 1).padStart(3, "0")}`,
      customerId: customer.id,
      customerName: customer.fullName,
      service,
      city: customer.city,
      address: customer.address,
      urgency: index % 7 === 0 ? "same-day" : "standard",
      status,
      jobId: status === "converted" ? jobs[index % jobs.length].id : "",
      lineItems: lineItems(total),
      subtotal: total,
      discount: index % 6 === 0 ? 50 : 0,
      taxPlaceholder: 0,
      total,
      recommended: total,
      laborHours: 2 + (index % 5),
      notes: "Beta demo estimate.",
      createdAt: offsetDate(baseDate, -(index % 25)).toISOString(),
      updatedAt: offsetDate(baseDate, -(index % 10)).toISOString()
    };
  });
}

function buildInvoices(customers, jobs, estimates, baseDate) {
  return Array.from({ length: 25 }, (_, index) => {
    const job = jobs[index % jobs.length];
    const customer = customers.find((item) => item.id === job.customerId) || customers[index];
    const status = index < 16 ? "paid" : index < 20 ? "partial" : index < 22 ? "overdue" : index < 24 ? "unpaid" : "sent";
    const total = estimates[index % estimates.length] ? estimates[index % estimates.length].total : job.value;
    const paidAmount = status === "paid" ? total : status === "partial" ? Math.round(total * 0.45) : 0;
    return {
      id: `invoice_${String(index + 1).padStart(3, "0")}`,
      invoiceNumber: `INV-${String(index + 1).padStart(5, "0")}`,
      jobId: job.id,
      customerId: customer.id,
      customerName: customer.fullName,
      status,
      paymentStatus: status,
      lineItems: lineItems(total),
      subtotal: total,
      discount: 0,
      taxPlaceholder: 0,
      total,
      amount: total,
      paidAmount,
      outstandingBalance: Math.max(0, total - paidAmount),
      dueDate: offsetDate(baseDate, status === "overdue" ? -10 : 7).toISOString(),
      notes: "Beta demo invoice.",
      createdAt: offsetDate(baseDate, -(index % 20)).toISOString(),
      updatedAt: offsetDate(baseDate, index < 3 ? 0 : -(index % 14)).toISOString()
    };
  });
}

function buildPayments(invoices, baseDate) {
  return invoices.filter((invoice) => invoice.paidAmount > 0).slice(0, 20).map((invoice, index) => ({
    id: `payment_${String(index + 1).padStart(3, "0")}`,
    invoiceId: invoice.id,
    customerId: invoice.customerId,
    customerName: invoice.customerName,
    amount: invoice.paidAmount,
    status: invoice.paymentStatus === "partial" ? "partial" : "paid",
    method: index % 2 === 0 ? "card placeholder" : "cash placeholder",
    paymentProcessorConnected: false,
    cardDataStored: false,
    createdAt: offsetDate(baseDate, index < 4 ? 0 : -(index % 12)).toISOString()
  }));
}

function buildMarketingLeads(baseDate) {
  return Array.from({ length: 15 }, (_, index) => ({
    id: `lead_${String(index + 1).padStart(3, "0")}`,
    name: `${CITIES[index % CITIES.length]} Lead ${index + 1}`,
    phone: `+1-747-295-${String(5000 + index).padStart(4, "0")}`,
    email: `lead${index + 1}@demo.comphelp.local`,
    source: SOURCES[index % SOURCES.length],
    service: SERVICES[index % SERVICES.length],
    city: CITIES[index % CITIES.length],
    notes: "Beta demo marketing lead.",
    status: ["New Lead", "Contacted", "Quote Sent", "Follow-up", "Won"][index % 5],
    createdAt: offsetDate(baseDate, -(index % 10)).toISOString()
  }));
}

function buildCustomerNotes(customers, baseDate) {
  return customers.slice(0, 60).map((customer, index) => ({
    id: `note_${String(index + 1).padStart(3, "0")}`,
    customerId: customer.id,
    body: index % 2 === 0 ? "Customer asked for a free estimate follow-up." : "Confirmed preferred service window.",
    pinned: index % 10 === 0,
    internal: true,
    createdAt: offsetDate(baseDate, -(index % 20)).toISOString(),
    updatedAt: offsetDate(baseDate, -(index % 10)).toISOString()
  }));
}

function buildCustomerTimeline(customers, estimates, invoices, baseDate) {
  const items = customers.slice(0, 80).map((customer, index) => ({
    id: `customer_timeline_${index + 1}`,
    customerId: customer.id,
    title: "Customer Created",
    type: "customer",
    description: "Beta demo customer profile created.",
    timestamp: customer.createdAt
  }));
  estimates.slice(0, 30).forEach((estimate, index) => items.push({
    id: `estimate_timeline_${index + 1}`,
    customerId: estimate.customerId,
    title: "Estimate Created",
    type: "estimate",
    description: `${estimate.service} estimate ${estimate.status}.`,
    timestamp: estimate.createdAt
  }));
  invoices.slice(0, 25).forEach((invoice, index) => items.push({
    id: `invoice_timeline_${index + 1}`,
    customerId: invoice.customerId,
    title: invoice.paymentStatus === "paid" ? "Payment Received" : "Invoice Created",
    type: "invoice",
    description: `${invoice.invoiceNumber} ${invoice.paymentStatus}.`,
    timestamp: invoice.updatedAt || offsetDate(baseDate, -index).toISOString()
  }));
  return items;
}

function buildJobTimeline(jobs) {
  const items = [];
  jobs.forEach((job, index) => {
    items.push({ id: `job_timeline_created_${index + 1}`, jobId: job.id, title: "Job Created", type: "job", description: `${job.jobNumber} created.`, timestamp: job.createdAt });
    items.push({ id: `job_timeline_assigned_${index + 1}`, jobId: job.id, title: "Assigned", type: "assignment", description: `Assigned to ${job.assignedTechnician}.`, timestamp: job.updatedAt });
    if (job.status === "completed") items.push({ id: `job_timeline_completed_${index + 1}`, jobId: job.id, title: "Completion", type: "completion", description: job.completionNotes, timestamp: job.completedAt });
  });
  return items;
}

function buildActivityLogs(jobs, invoices) {
  return jobs.slice(0, 20).map((job, index) => ({
    id: `activity_job_${index + 1}`,
    type: "job_activity",
    message: `${job.jobNumber} ${job.status}`,
    status: "logged",
    createdAt: job.updatedAt
  })).concat(invoices.slice(0, 10).map((invoice, index) => ({
    id: `activity_invoice_${index + 1}`,
    type: "invoice_activity",
    message: `${invoice.invoiceNumber} ${invoice.paymentStatus}`,
    status: "logged",
    createdAt: invoice.updatedAt
  })));
}

function serviceValue(service, index) {
  const base = {
    "Security Camera Installation": 899,
    "WiFi & Network Installation": 485,
    "Computer Repair": 185,
    "Data Recovery": 640,
    "Smart Home Setup": 360,
    "Network Cabling": 725
  }[service] || 299;
  return base + (index % 6) * 75;
}

function lineItems(total) {
  const labor = Math.round(total * 0.62);
  const materials = total - labor;
  return {
    labor: { description: "Labor", hours: Math.max(1, Math.round(labor / 95)), rate: 95 },
    materials: { description: "Materials", amount: materials },
    discount: 0,
    taxPlaceholder: 0,
    subtotal: total,
    total
  };
}

function offsetDate(baseDate, days) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date;
}

function withHour(date, hour) {
  const output = new Date(date);
  output.setHours(hour, 0, 0, 0);
  return output;
}

module.exports = { buildBetaDemoData };
