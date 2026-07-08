const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const MARKETPLACE_FILE = path.join(ROOT, "data", "marketplace.json");

function readMarketplaceData(input = {}) {
  if (input.data) return normalizeData(input.data);
  try {
    const parsed = JSON.parse(fs.readFileSync(MARKETPLACE_FILE, "utf8").replace(/^\uFEFF/, ""));
    return normalizeData(parsed);
  } catch (_) {
    return normalizeData({});
  }
}

function normalizeData(data = {}) {
  return {
    leads: ensureArray(data.leads),
    vendors: ensureArray(data.vendors),
    projects: ensureArray(data.projects),
    jobs: ensureArray(data.jobs),
    estimates: ensureArray(data.estimates),
    customers: ensureArray(data.customers),
    tasks: ensureArray(data.tasks),
    invoices: ensureArray(data.invoices),
    activity: ensureArray(data.activity || data.activityLogs),
    inventory: ensureArray(data.inventory),
    messages: ensureArray(data.messages || data.messageQueue)
  };
}

function calculateKpis(input = {}) {
  const data = readMarketplaceData(input);
  const workItems = data.projects.concat(data.jobs);
  const completedProjects = workItems.filter((project) => isComplete(project.status));
  const openProjects = workItems.filter((project) => !isComplete(project.status) && !isLost(project.status));
  const openEstimates = data.estimates.filter((estimate) => !isComplete(estimate.status) && !isLost(estimate.status));
  const wonEstimates = data.estimates.filter((estimate) => isWon(estimate.status));
  const estimateConversionRate = data.estimates.length ? Math.round((wonEstimates.length / data.estimates.length) * 100) : 0;
  const billableInvoices = data.invoices.filter(isBillableInvoice);
  const paidInvoices = billableInvoices.filter((invoice) => isComplete(invoice.paymentStatus || invoice.status));
  const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + money(invoice.amount || invoice.total), 0);
  const revenueToday = revenueForWindow(data, 0);
  const revenueYesterday = revenueForWindow(data, 1);
  const revenueThisWeek = revenueForDays(data, 7);
  const revenueThisMonth = revenueForMonth(data);
  const averageJobValue = paidInvoices.length ? Math.round(totalRevenue / paidInvoices.length) : 0;
  const outstandingInvoices = billableInvoices.filter((invoice) => !isComplete(invoice.paymentStatus || invoice.status)).reduce((sum, invoice) => sum + money(invoice.outstandingBalance ?? invoice.amount ?? invoice.total), 0);

  return {
    ok: true,
    data: {
      revenueToday,
      revenueYesterday,
      revenueThisWeek,
      revenueThisMonth,
      openJobs: openProjects.length,
      completedJobs: completedProjects.length,
      openEstimates: openEstimates.length,
      estimateConversionRate,
      averageJobValue,
      outstandingInvoices,
      collections: Math.max(0, revenueThisMonth - outstandingInvoices),
      technicianUtilization: technicianUtilization(data),
      technicianPerformance: technicianPerformance(data),
      customerSatisfaction: customerSatisfaction(data),
      marketingPerformance: marketingPerformance(data),
      inventoryStatus: inventoryStatus(data),
      leadCount: data.leads.length,
      vendorCount: data.vendors.length,
      customerCount: data.customers.length,
      generatedAt: new Date().toISOString()
    }
  };
}

function revenueForWindow(data, daysAgo) {
  const invoices = data.invoices.filter((invoice) => isBillableInvoice(invoice) && isComplete(invoice.paymentStatus || invoice.status));
  const target = new Date();
  target.setDate(target.getDate() - Number(daysAgo || 0));
  const targetKey = target.toISOString().slice(0, 10);
  return invoices
    .filter((invoice) => String(invoice.paidAt || invoice.updatedAt || invoice.createdAt || "").slice(0, 10) === targetKey)
    .reduce((sum, invoice) => sum + money(invoice.amount || invoice.total), 0);
}

function revenueForDays(data, days) {
  const cutoff = Date.now() - Number(days || 0) * 86400000;
  return data.invoices
    .filter((invoice) => isBillableInvoice(invoice) && isComplete(invoice.paymentStatus || invoice.status))
    .filter((invoice) => {
      const timestamp = new Date(invoice.paidAt || invoice.updatedAt || invoice.createdAt || "").getTime();
      return Number.isFinite(timestamp) && timestamp >= cutoff;
    })
    .reduce((sum, invoice) => sum + money(invoice.amount || invoice.total), 0);
}

function revenueForMonth(data) {
  const month = new Date().toISOString().slice(0, 7);
  return data.invoices
    .filter((invoice) => isBillableInvoice(invoice) && isComplete(invoice.paymentStatus || invoice.status))
    .filter((invoice) => String(invoice.paidAt || invoice.updatedAt || invoice.createdAt || "").slice(0, 7) === month)
    .reduce((sum, invoice) => sum + money(invoice.amount || invoice.total), 0);
}

function technicianUtilization(data) {
  const activeProjects = data.projects.concat(data.jobs).filter((project) => !isComplete(project.status) && !isLost(project.status)).length;
  const activeVendors = data.vendors.filter((vendor) => String(vendor.status || "active").toLowerCase() === "active").length || 1;
  return Math.min(100, Math.round((activeProjects / activeVendors) * 25));
}

function technicianPerformance(data) {
  const active = data.vendors.filter((vendor) => String(vendor.status || "active").toLowerCase() === "active");
  const averageRating = active.length ? active.reduce((sum, vendor) => sum + Number(vendor.rating || 4.5), 0) / active.length : 0;
  return {
    activeTechnicians: active.length,
    averageRating: Number(averageRating.toFixed(2)),
    status: averageRating >= 4.5 ? "strong" : active.length ? "needs_review" : "not_enough_data"
  };
}

function customerSatisfaction(data) {
  const reviews = data.projects.map((project) => Number(project.reviewRating || project.rating || 0)).filter(Boolean);
  const score = reviews.length ? reviews.reduce((sum, rating) => sum + rating, 0) / reviews.length : 4.6;
  return {
    score: Number(score.toFixed(2)),
    status: score >= 4.5 ? "healthy" : "needs_attention"
  };
}

function marketingPerformance(data) {
  const marketingLeads = data.leads.filter((lead) => /instagram|facebook|google|seo|social|website/i.test(String(lead.source || ""))).length;
  return {
    marketingLeads,
    status: marketingLeads ? "active" : "collecting data"
  };
}

function inventoryStatus(data) {
  const lowItems = data.inventory.filter((item) => Number(item.quantity || 0) <= Number(item.reorderPoint || 0));
  return {
    lowItems: lowItems.length,
    status: lowItems.length ? "warning" : "healthy"
  };
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function money(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function isComplete(status) {
  return /complete|completed|won|paid|closed/i.test(String(status || ""));
}

function isWon(status) {
  return /won|approved|accepted|paid/i.test(String(status || ""));
}

function isLost(status) {
  return /lost|rejected|cancel/i.test(String(status || ""));
}

function isBillableInvoice(invoice = {}) {
  if (invoice.placeholder || invoice.paymentStatus === "not_applicable" || invoice.status === "placeholder") return false;
  return money(invoice.amount || invoice.total) > 0;
}

module.exports = {
  calculateKpis,
  readMarketplaceData
};
