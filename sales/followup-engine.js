function buildFollowups(data = {}, prioritizedDeals = []) {
  const leads = Array.isArray(data.leads) ? data.leads : [];
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const estimateFollowups = prioritizedDeals
    .filter((deal) => !/won|lost|rejected|cancel/i.test(String(deal.status || "")))
    .slice(0, 5)
    .map((deal) => followup("estimate", deal.customerName, deal.service || "Estimate", deal.recommendedAction, deal.priority));
  const leadFollowups = leads
    .filter((lead) => !/won|lost/i.test(String(lead.status || "")))
    .slice(0, 5)
    .map((lead) => followup("lead", lead.name || "Lead", lead.service || "Service request", "Ask if they would like a free estimate.", "MEDIUM"));
  const taskFollowups = tasks
    .filter((task) => /follow/i.test(String(task.type || task.title || "")) && !/complete/i.test(String(task.status || "")))
    .slice(0, 5)
    .map((task) => followup("task", task.customerName || task.name || "Customer", task.service || "Follow-up", task.title || "Complete follow-up task.", "HIGH"));
  const all = [...estimateFollowups, ...leadFollowups, ...taskFollowups];
  return {
    todaysCalls: all.filter((item) => item.channel === "call").slice(0, 5),
    todaysFollowups: all.slice(0, 10),
    followupCompletion: tasks.length ? Math.round((tasks.filter((task) => /complete/i.test(String(task.status || ""))).length / tasks.length) * 100) : 0,
    bestTimeToFollowUp: "10:00 AM - 12:00 PM local time"
  };
}

function followup(type, customerName, service, recommendedAction, priority) {
  return {
    type,
    customerName,
    service,
    priority,
    channel: priority === "HIGH" ? "call" : "text_or_email_draft",
    recommendedAction,
    requiresApproval: true
  };
}

module.exports = {
  buildFollowups
};
