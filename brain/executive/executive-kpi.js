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
  const completedProjects = data.projects.filter((project) => isComplete(project.status));
  const openProjects = data.projects.filter((project) => !isComplete(project.status));
  const openEstimates = data.estimates.filter((estimate) => !isComplete(estimate.status) && !isLost(estimate.status));
  const wonEstimates = data.estimates.filter((estimate) => isWon(estimate.status));
  const estimateConversionRate = data.estimates.length ? Math.round((wonEstimates.length / data.estimates.length) * 100) : 0;
  const projectRevenue = completedProjects.reduce((sum, project) => sum + money(project.value || project.projectValue || project.revenue), 0);
  const estimateRevenue = wonEstimates.reduce((sum, estimate) => sum + money(estimate.recommended || estimate.recommendedPrice || estimate.total), 0);
  const totalRevenue = projectRevenue + estimateRevenue;
  const averageJobValue = completedProjects.length ? Math.round(projectRevenue / completedProjects.length) : 0;
  const outstandingInvoices = data.invoices.filter((invoice) => !isComplete(invoice.status)).reduce((sum, invoice) => sum + money(invoice.amount || invoice.total), 0);

  return {
    ok: true,
    data: {
      revenueToday: revenueForWindow(data, 0),
      revenueYesterday: revenueForWindow(data, 1),
      revenueThisWeek: totalRevenue,
      revenueThisMonth: totalRevenue,
      openJobs: openProjects.length,
      completedJobs: completedProjects.length,
      openEstimates: openEstimates.length,
      estimateConversionRate,
      averageJobValue,
      outstandingInvoices,
      collections: Math.max(0, totalRevenue - outstandingInvoices),
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
  if (daysAgo > 1) return 0;
  if (daysAgo === 1) return 0;
  return data.projects.filter((project) => isComplete(project.status)).reduce((sum, project) => sum + money(project.value || project.projectValue || project.revenue), 0);
}

function technicianUtilization(data) {
  const activeProjects = data.projects.filter((project) => !isComplete(project.status)).length;
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

module.exports = {
  calculateKpis,
  readMarketplaceData
};
