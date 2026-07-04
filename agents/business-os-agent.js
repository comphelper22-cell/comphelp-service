const { database, money, id, now, writeLogReport, supabaseConfigured } = require("../database");

const db = database();
const PIPELINE = ["New Lead", "Contacted", "Quote Sent", "Follow-up", "Won", "Lost"];

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function status(value, fallback = "New Lead") {
  const input = clean(value || fallback, 80).toLowerCase().replace(/[_-]+/g, " ");
  return PIPELINE.find((stage) => stage.toLowerCase() === input) || fallback;
}

async function createActivity(type, message, metadata = {}) {
  return db.create("activityLogs", {
    type: clean(type, 80),
    message: clean(message, 1000),
    metadata,
    actor: clean(metadata.actor || "business_os", 120),
    status: clean(metadata.status || "logged", 80)
  });
}

async function upsertEntity(collection, input = {}) {
  const record = { ...input, status: input.status || "active", updatedAt: now() };
  const saved = input.id ? await db.update(collection, input.id, record) : await db.create(collection, record);
  await createActivity(`${collection}_saved`, `${collection} record saved.`, { recordId: saved.id, status: saved.status });
  return saved;
}

async function crm(action, payload = {}) {
  const collection = clean(payload.type || payload.collection || "leads", 80);
  if (action === "create") return upsertEntity(collection, payload);
  if (action === "update") return upsertEntity(collection, payload);
  if (action === "search") return db.search(collection, payload.query || "", payload.fields || ["name", "email", "phone", "service", "city", "status", "notes"]);
  if (action === "filter") return db.list(collection, payload.filters || {});
  return db.list(collection, payload.filters || {});
}

function estimate(input = {}) {
  const laborHours = money(input.laborHours);
  const laborRate = money(input.laborRate || 75);
  const labor = Math.round(laborHours * laborRate);
  const materials = money(input.materials || input.materialCost || input.materialEstimate);
  const travel = money(input.travel || input.travelCost || 25);
  const taxRate = Math.min(0.2, Math.max(0, Number(input.taxRate || 0.095)));
  const markupRate = Math.min(1.5, Math.max(0, Number(input.markupRate || 0.3)));
  const commissionRate = Math.min(1, Math.max(0, Number(input.commissionRate || input.commissionPercent / 100 || 0.1)));
  const subtotalCost = labor + materials + travel;
  const markup = Math.round(subtotalCost * markupRate);
  const taxable = materials + markup;
  const tax = Math.round(taxable * taxRate);
  const recommended = Math.round(subtotalCost + markup + tax);
  const low = Math.max(0, Math.round(recommended * 0.88));
  const high = Math.round(recommended * 1.22);
  const commission = Math.round(recommended * commissionRate);
  const profit = Math.max(0, recommended - subtotalCost - commission);
  const margin = recommended ? Math.round((profit / recommended) * 100) : 0;
  return {
    id: id("estimate"),
    service: clean(input.service, 120),
    city: clean(input.city || "Los Angeles", 80),
    labor,
    materials,
    travel,
    tax,
    markup,
    commission,
    profit,
    margin,
    low,
    high,
    recommended,
    range: `$${low} - $${high}`,
    customerQuoteText: `Based on the current project details, the recommended estimate for ${clean(input.service, 120) || "this service"} is $${recommended}, with a planning range of $${low} - $${high}. Final pricing depends on site conditions and approved scope.`,
    internalNotes: `Labor $${labor}; materials $${materials}; travel $${travel}; tax $${tax}; markup $${markup}; commission $${commission}; profit $${profit}; margin ${margin}%.`,
    pdfReady: true,
    status: "draft",
    createdAt: now()
  };
}

async function saveEstimate(input = {}) {
  const generated = estimate(input);
  const saved = await db.create("estimates", generated);
  await createActivity("estimate_created", "AI estimate generated.", { estimateId: saved.id, recommended: saved.recommended });
  return saved;
}

async function rankVendors(input = {}) {
  const vendors = await db.list("vendors");
  const service = clean(input.service, 120).toLowerCase();
  const city = clean(input.city, 80).toLowerCase();
  return vendors.filter((vendor) => {
    const serviceText = `${vendor.category || ""} ${(vendor.services || []).join ? vendor.services.join(" ") : vendor.services || ""}`.toLowerCase();
    const statusText = clean(vendor.status || "active", 80).toLowerCase();
    return serviceText.includes(service) && !["paused", "inactive", "blocked"].includes(statusText);
  }).map((vendor) => {
    const rating = Number(vendor.rating || 4);
    const commission = Number(vendor.commissionPercent || 0);
    const availabilityBoost = /same|today|tomorrow|next|available/i.test(vendor.availability || "") ? 15 : 5;
    const cityBoost = city && `${vendor.city || ""} ${vendor.serviceArea || ""}`.toLowerCase().includes(city) ? 15 : 0;
    const score = Math.round(rating * 20 + availabilityBoost + cityBoost + Math.min(commission, 20));
    return { ...vendor, score, reason: `Rating ${rating}, availability ${vendor.availability || "unknown"}, city fit ${cityBoost ? "yes" : "service-area"}, commission ${commission}%.` };
  }).sort((a, b) => b.score - a.score);
}

async function dispatch(input = {}) {
  const ranked = await rankVendors(input);
  const selected = ranked[0] || null;
  const etaHours = /same|urgent|today/i.test(input.urgency || "") ? 2 : 24;
  const job = {
    id: id("dispatch"),
    service: clean(input.service, 120),
    city: clean(input.city || "Los Angeles", 80),
    selectedVendor: selected,
    topVendors: ranked.slice(0, 3),
    scheduledDate: clean(input.scheduledDate || input.preferredDate, 80),
    estimatedArrival: new Date(Date.now() + etaHours * 60 * 60 * 1000).toISOString(),
    quoteRequestDraft: selected ? `Please quote ${clean(input.service, 120)} in ${clean(input.city || "Los Angeles", 80)}. Scope: ${clean(input.scope || input.notes, 1000)}` : "No vendor selected. Add active vendors for this service.",
    status: selected ? "vendor_selected" : "needs_review"
  };
  await createActivity("dispatch_created", "Dispatcher recommendation created.", { dispatchId: job.id, status: job.status });
  return job;
}

function countBy(items, field) {
  return items.reduce((acc, item) => {
    const key = clean(item[field] || "unknown", 80);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

async function analytics(period = "daily") {
  const [leads, projects, estimates, vendors, tasks, commissions] = await Promise.all([
    db.list("leads"),
    db.list("projects"),
    db.list("estimates"),
    db.list("vendors"),
    db.list("tasks"),
    db.list("commissions")
  ]);
  const revenue = commissions.reduce((sum, item) => sum + money(item.revenue || item.projectValue), 0);
  const profit = estimates.reduce((sum, item) => sum + money(item.profit || item.expectedProfit), 0);
  const won = leads.filter((lead) => status(lead.status) === "Won").length;
  return {
    period,
    revenue,
    profit,
    leads: leads.length,
    projects: projects.length,
    openEstimates: estimates.filter((item) => !["accepted", "lost", "closed"].includes(clean(item.status, 80).toLowerCase())).length,
    pendingJobs: projects.filter((item) => !["completed", "closed", "cancelled"].includes(clean(item.status, 80).toLowerCase())).length,
    tasks: tasks.length,
    conversion: leads.length ? Math.round((won / leads.length) * 100) : 0,
    averageJob: projects.length ? Math.round(revenue / projects.length) : 0,
    closeRate: leads.length ? Math.round((won / leads.length) * 100) : 0,
    marketingRoi: 0,
    pipeline: countBy(leads, "status"),
    vendorPerformance: vendors.map((vendor) => ({ name: vendor.name, rating: vendor.rating || 0, commissionPercent: vendor.commissionPercent || 0 })).slice(0, 10)
  };
}

async function businessDashboard() {
  const kpis = await analytics("dashboard");
  const health = await db.health();
  return {
    ok: true,
    widgets: {
      revenue: kpis.revenue,
      leads: kpis.leads,
      pipeline: kpis.pipeline,
      projects: kpis.projects,
      openEstimates: kpis.openEstimates,
      pendingJobs: kpis.pendingJobs,
      vendorPerformance: kpis.vendorPerformance,
      profit: kpis.profit,
      tasks: kpis.tasks,
      notifications: health.supabaseConfigured ? ["Supabase connected"] : ["Using JSON fallback database"]
    },
    health
  };
}

async function reports() {
  const dashboard = await businessDashboard();
  const periods = {};
  for (const period of ["daily", "weekly", "monthly", "quarterly", "yearly"]) {
    periods[period] = await analytics(period);
  }
  return {
    database: writeLogReport("database-report.json", { ok: true, health: dashboard.health }),
    business: writeLogReport("business-report.json", { ok: true, dashboard: dashboard.widgets, analytics: periods }),
    phase6: writeLogReport("phase6-report.json", { ok: true, phases: ["6.1 database", "6.2 supabase fallback", "6.3 crm", "6.4 estimates", "6.5 dispatcher", "6.6 dashboard", "6.7 analytics"], dashboard })
  };
}

module.exports = {
  PIPELINE,
  crm,
  estimate,
  saveEstimate,
  rankVendors,
  dispatch,
  analytics,
  businessDashboard,
  reports,
  databaseHealth: () => db.health(),
  supabaseConfigured
};
