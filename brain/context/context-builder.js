const registry = require("./context-registry");
const { resolveSupportingContext } = require("./context-resolver");
const { scoreContext } = require("./context-validator");

function buildContext(input = {}) {
  const sections = {};
  Object.entries(registry.providers).forEach(([key, provider]) => {
    sections[key] = provider(input);
  });
  const supporting = resolveSupportingContext(input);
  const score = scoreContext(sections, supporting);
  return {
    ok: true,
    type: "ai_ready_context_package",
    score: score.overall,
    scores: score.scores,
    missing: score.missing,
    customer: sections.customer.data,
    organization: sections.organization.data,
    currentUser: sections.session.data.user,
    currentSession: sections.session.data.session,
    currentJob: sections.job.data.currentJob,
    previousJobs: sections.job.data.previousJobs,
    currentTask: input.currentTask || input.task || { status: "not_attached" },
    conversation: sections.conversation.data,
    technician: sections.technician.data,
    memory: supporting.memory,
    knowledge: supporting.knowledge,
    recommendations: supporting.recommendations,
    preferences: supporting.preferences,
    permissions: supporting.permissions,
    generatedAt: new Date().toISOString()
  };
}

module.exports = { buildContext };
