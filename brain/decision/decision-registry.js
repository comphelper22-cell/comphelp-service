const DECISION_TYPES = {
  leadQualification: "Qualify and prioritize an incoming lead.",
  estimatePriority: "Decide estimate urgency and owner review priority.",
  jobScheduling: "Recommend scheduling posture for a job.",
  technicianAssignment: "Recommend technician assignment readiness.",
  warrantyDecision: "Decide whether warranty handling may apply.",
  upsellOpportunity: "Identify customer-safe upsell opportunities.",
  followUpReminder: "Recommend follow-up timing.",
  customerRisk: "Assess customer relationship or project risk.",
  vendorSelection: "Recommend vendor selection posture."
};

function registry() {
  return Object.entries(DECISION_TYPES).map(([type, description]) => ({
    type,
    description,
    status: "registered"
  }));
}

function status() {
  return {
    ok: true,
    status: "ready",
    decisionTypes: registry(),
    count: registry().length
  };
}

module.exports = { DECISION_TYPES, registry, status };
