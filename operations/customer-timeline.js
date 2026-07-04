function customerTimeline(data = {}, jobs = []) {
  const leads = Array.isArray(data.leads) ? data.leads : [];
  const estimates = Array.isArray(data.estimates) ? data.estimates : [];
  const waiting = [];
  leads.filter((lead) => !/won|lost/i.test(String(lead.status || ""))).forEach((lead) => {
    waiting.push(item("lead", lead.name || "Lead", lead.service || "Service request", "Waiting for qualification or free estimate."));
  });
  estimates.filter((estimate) => !/won|lost|approved|accepted/i.test(String(estimate.status || ""))).forEach((estimate) => {
    waiting.push(item("estimate", estimate.customerName || estimate.name || "Estimate customer", estimate.service || "Estimate", "Waiting for estimate follow-up."));
  });
  jobs.filter((job) => job.atRisk).forEach((job) => {
    waiting.push(item("job", job.customerName, job.service, "Waiting because job is late, blocked, or at risk."));
  });
  return {
    waiting: waiting.slice(0, 20),
    waitingCount: waiting.length
  };
}

function item(type, customerName, service, note) {
  return {
    type,
    customerName,
    service,
    note,
    priority: type === "job" ? "HIGH" : "MEDIUM"
  };
}

module.exports = {
  customerTimeline
};
