const contextEngine = require("../brain/context/context-engine");
const decisionEngine = require("../brain/decision/decision-engine");
const recommendationEngine = require("../brain/recommendation/recommendation-engine");
const executiveEngine = require("../brain/executive/executive-engine");
const actions = require("./workflow-actions");
const approval = require("./workflow-approval");

function build(workflow = {}, input = {}) {
  const context = contextEngine.build({ ...input, workflow: workflow.name, event: workflow.event });
  const decision = decisionEngine.evaluate({
    type: "workflowExecution",
    context,
    record: false,
    flags: { businessHours: true }
  });
  const recommendation = recommendationEngine.generate({
    category: workflow.event === "New Lead" || workflow.event === "New Estimate" ? "Sales" : "Management",
    service: input.service,
    city: input.city,
    record: false
  }).data.topRecommendation || {};
  const executiveSummary = executiveEngine.summary({ data: input.data }).data.executiveSummary;
  const intelligence = {
    contextScore: context.score,
    decision: decision.data ? decision.data.decision : null,
    recommendedAction: recommendation.description || recommendation.title,
    executiveSummary
  };
  const approvalStatus = approval.approvalStatus(workflow, input);
  return {
    ok: true,
    data: {
      workflow,
      input,
      approval: approvalStatus,
      actions: actions.buildActions(workflow, input, intelligence),
      intelligence,
      builtAt: new Date().toISOString()
    }
  };
}

module.exports = {
  build
};
