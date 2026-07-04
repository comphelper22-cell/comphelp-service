const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MARKETPLACE_FILE = path.join(ROOT, "data", "marketplace.json");

function readCustomerData(input = {}) {
  if (input.data) return normalize(input.data, false);
  try {
    return normalize(JSON.parse(fs.readFileSync(MARKETPLACE_FILE, "utf8").replace(/^\uFEFF/, "")), false);
  } catch (_) {
    return normalize({}, true);
  }
}

function normalize(data = {}, forcedDemo = false) {
  const customers = arr(data.customers);
  const projects = arr(data.projects);
  const estimates = arr(data.estimates);
  const invoices = arr(data.invoices);
  const leads = arr(data.leads);
  const tasks = arr(data.tasks);
  const hasData = customers.length || projects.length || estimates.length || invoices.length || leads.length;
  const demoMode = forcedDemo || !hasData;
  const source = demoMode ? demoData() : { customers, projects, estimates, invoices, leads, tasks };
  return { ...source, demoMode };
}

function customerProfiles(input = {}) {
  const data = readCustomerData(input);
  const names = new Set();
  data.customers.forEach((item) => names.add(nameOf(item)));
  data.projects.forEach((item) => names.add(nameOf(item)));
  data.estimates.forEach((item) => names.add(nameOf(item)));
  data.invoices.forEach((item) => names.add(nameOf(item)));
  data.leads.forEach((item) => names.add(nameOf(item)));
  const profiles = Array.from(names).filter(Boolean).map((name) => buildProfile(name, data));
  return { data, profiles };
}

function ltv(input = {}) {
  const profiles = customerProfiles(input).profiles;
  return {
    ok: true,
    data: profiles.map((profile) => ({
      customerName: profile.customerName,
      lifetimeValue: profile.lifetimeValue,
      completedJobs: profile.completedJobs,
      paidInvoices: profile.paidInvoices,
      repeatPotential: profile.repeatPotential
    })).sort((a, b) => b.lifetimeValue - a.lifetimeValue)
  };
}

function buildProfile(customerName, data) {
  const customer = data.customers.find((item) => nameOf(item) === customerName) || {};
  const projects = data.projects.filter((item) => nameOf(item) === customerName);
  const estimates = data.estimates.filter((item) => nameOf(item) === customerName);
  const invoices = data.invoices.filter((item) => nameOf(item) === customerName);
  const leads = data.leads.filter((item) => nameOf(item) === customerName);
  const tasks = data.tasks.filter((item) => nameOf(item) === customerName);
  const projectValue = projects.reduce((sum, item) => sum + money(item.value || item.projectValue || item.revenue), 0);
  const paidInvoiceValue = invoices.filter((item) => /paid|complete|completed/i.test(String(item.status || ""))).reduce((sum, item) => sum + money(item.amount || item.total), 0);
  const approvedEstimateValue = estimates.filter((item) => /won|approved|accepted/i.test(String(item.status || ""))).reduce((sum, item) => sum + money(item.recommendedPrice || item.recommended || item.total), 0);
  const completedJobs = projects.filter((item) => /complete|completed|done/i.test(String(item.status || ""))).length;
  const lifetimeValue = projectValue + paidInvoiceValue + approvedEstimateValue;
  return {
    customerName,
    id: customer.id || customerName.toLowerCase().replace(/\W+/g, "_"),
    status: customer.status || leads[0] && leads[0].status || "active",
    service: customer.service || projects[0] && projects[0].service || estimates[0] && estimates[0].service || leads[0] && leads[0].service || "Service",
    city: customer.city || projects[0] && projects[0].city || leads[0] && leads[0].city || "Los Angeles",
    notes: [customer.notes, projects.map((item) => item.notes).filter(Boolean).join(" "), tasks.map((item) => item.title || item.notes).filter(Boolean).join(" ")].filter(Boolean).join(" "),
    lifetimeValue,
    completedJobs,
    paidInvoices: invoices.filter((item) => /paid|complete|completed/i.test(String(item.status || ""))).length,
    openEstimates: estimates.filter((item) => !/won|lost|approved|accepted|rejected|cancel/i.test(String(item.status || ""))).length,
    openTasks: tasks.filter((item) => !/complete|completed|done/i.test(String(item.status || ""))).length,
    projects,
    estimates,
    invoices,
    leads,
    tasks,
    repeatPotential: completedJobs > 0 || lifetimeValue > 0 ? "high" : "unknown"
  };
}

function nameOf(item = {}) {
  return item.customerName || item.name || item.businessName || item.leadName || "";
}

function money(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function demoData() {
  return {
    customers: [
      { name: "Demo Camera Customer", status: "vip", city: "Los Angeles", notes: "Repeat customer interested in maintenance." },
      { name: "Demo Waiting Customer", status: "at_risk", city: "Burbank", notes: "Needs follow-up on WiFi estimate." }
    ],
    projects: [{ customerName: "Demo Camera Customer", service: "Security Camera Installation", status: "completed", value: 899, completionDate: new Date().toISOString() }],
    estimates: [{ customerName: "Demo Waiting Customer", service: "WiFi & Network Installation", status: "open", recommendedPrice: 650, createdAt: new Date().toISOString() }],
    invoices: [{ customerName: "Demo Camera Customer", status: "paid", amount: 899, paidAt: new Date().toISOString() }],
    leads: [],
    tasks: [{ customerName: "Demo Waiting Customer", title: "Follow up on estimate", status: "open" }]
  };
}

module.exports = {
  customerProfiles,
  ltv,
  readCustomerData
};
