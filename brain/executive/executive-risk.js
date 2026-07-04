const { calculateKpis, readMarketplaceData } = require("./executive-kpi");

function detectRisks(input = {}) {
  const data = readMarketplaceData(input);
  const kpis = calculateKpis(input).data;
  const risks = [];

  if (kpis.openEstimates > 0) risks.push(risk("late_estimates", "Late estimates", "MEDIUM", "Review open estimates and send approved follow-ups."));
  if (kpis.outstandingInvoices > 0) risks.push(risk("late_invoices", "Late invoices", "HIGH", "Prepare a polite collections follow-up draft."));
  if (kpis.technicianUtilization < 20 && kpis.openJobs === 0) risks.push(risk("idle_technicians", "Idle technicians", "MEDIUM", "Create sales actions to fill the schedule."));
  if (data.tasks.some((task) => /follow/i.test(String(task.type || task.title || "")) && !/complete/i.test(String(task.status || "")))) risks.push(risk("missed_followups", "Missed follow-ups", "HIGH", "Prioritize overdue follow-up tasks."));
  if (kpis.estimateConversionRate < 25 && data.estimates.length > 3) risks.push(risk("low_conversion", "Low conversion", "HIGH", "Review pricing, response time, and estimate quality."));
  if (data.customers.some((customer) => /risk|unhappy|churn/i.test(String(customer.status || customer.notes || "")))) risks.push(risk("customer_churn", "Customer churn risk", "HIGH", "Create a personal owner follow-up."));
  if (kpis.inventoryStatus.status !== "healthy") risks.push(risk("inventory_shortage", "Inventory shortage", "MEDIUM", "Check low-stock installation materials before scheduling."));
  if (data.projects.filter((project) => /same time|conflict|overlap/i.test(String(project.notes || project.status || ""))).length) risks.push(risk("scheduling_conflicts", "Scheduling conflicts", "HIGH", "Review dispatch calendar before confirming appointments."));

  if (!risks.length) risks.push(risk("data_depth", "Limited live operating data", "LOW", "Keep adding leads, estimates, projects, invoices, and job outcomes for sharper executive intelligence."));

  return {
    ok: true,
    data: {
      risks,
      riskCount: risks.length,
      generatedAt: new Date().toISOString()
    }
  };
}

function risk(type, title, severity, recommendedAction) {
  return {
    type,
    title,
    severity,
    recommendedAction,
    detectedAt: new Date().toISOString()
  };
}

module.exports = {
  detectRisks
};
