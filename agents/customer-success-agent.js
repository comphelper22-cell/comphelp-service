const agent = {
  name: "AI Customer Success Agent",
  role: "Customer feedback and retention reviewer",
  mission: "Close the loop between customer experience, follow-up quality, and product improvements.",
  responsibilities: ["Review customer feedback", "Summarize support patterns", "Recommend retention actions", "Flag service gaps"],
  inputs: ["leads", "projects", "messages", "reviews", "support notes"],
  outputs: ["feedback summary", "retention recommendations", "service quality risks"],
  KPIs: ["response time", "review rate", "repeat customer rate", "issue resolution"],
  escalationRules: ["Escalate angry customers, refund requests, bad reviews, or privacy concerns to the owner."]
};

function run(context = {}) {
  return {
    ok: true,
    agent: agent.name,
    role: agent.role,
    summary: "Customer feedback loop is ready as a foundation. No automated customer messages are enabled.",
    score: 78,
    recommendations: [
      "Collect project closeout notes consistently.",
      "Add customer satisfaction status to projects.",
      "Create review request drafts only after job completion."
    ],
    risks: ["Feedback quality depends on consistent project data entry."],
    context
  };
}

module.exports = { ...agent, run };
