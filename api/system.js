const developer = require("../server/api-modules/developer");
const businessOs = require("../server/api-modules/business-os");
const platform = require("../server/api-modules/platform");
const titan = require("../server/api-modules/titan");
const brain = require("../server/api-modules/brain");
const memory = require("../brain/memory");
const memoryRegistry = require("../brain/memory-registry");
const memoryAgent = require("../agents/memory-agent");
const contextEngine = require("../brain/context/context-engine");
const contextAgent = require("../agents/context-agent");
const decisionEngine = require("../brain/decision/decision-engine");
const decisionAgent = require("../agents/decision-agent");
const brainOrchestrator = require("../brain/orchestrator/brain-orchestrator");
const integrationAgent = require("../agents/integration-agent");
const recommendationEngine = require("../brain/recommendation/recommendation-engine");
const recommendationAgent = require("../agents/recommendation-agent");
const executiveEngine = require("../brain/executive/executive-engine");
const executiveAgent = require("../agents/executive-agent");
const salesEngine = require("../sales/sales-engine");
const salesManagerAgent = require("../agents/sales-manager-agent");
const workflowEngine = require("../workflow/workflow-engine");
const workflowAgent = require("../agents/workflow-agent");
const operationsEngine = require("../operations/operations-engine");
const operationsAgent = require("../agents/operations-agent");
const financeEngine = require("../finance/finance-engine");
const financeAgent = require("../agents/finance-agent");
const customerSuccessEngine = require("../customer-success/customer-success-engine");
const customerSuccessAgent = require("../agents/customer-success-manager-agent");
const marketingGrowthEngine = require("../marketing/marketing-engine");
const marketingManagerAgent = require("../agents/marketing-manager-agent");

const modules = {
  developer,
  "business-os": businessOs,
  business: businessOs,
  platform,
  titan,
  brain
};

function runMemoryAction(action, payload = {}) {
  const scope = clean(payload.scope || "shortMemory", 80);
  if (action === "status") return { ok: true, data: memoryAgent.status() };
  if (action === "search") return memory.search(scope, payload.query || "");
  if (action === "save") return memory.save(scope, payload.record || payload);
  if (action === "update") return memory.update(scope, payload.id, payload.patch || payload.record || {});
  if (action === "delete") return memory.delete(scope, payload.id);
  if (action === "clear") return memory.clear(scope);
  if (action === "stats") return memory.stats(payload.scope);
  if (action === "registry") return { ok: true, data: memoryRegistry.status() };
  if (action === "validate") return { ok: true, data: memoryAgent.validate() };
  return { ok: false, error: "unknown_memory_action" };
}

function runContextAction(action, payload = {}) {
  if (action === "status") return { ok: true, data: contextAgent.status(payload) };
  if (action === "build") return { ok: true, data: contextEngine.build(payload) };
  if (action === "validate") return { ok: true, data: contextEngine.validate(payload) };
  if (action === "score") return { ok: true, data: contextEngine.score(payload) };
  if (action === "inspect") return { ok: true, data: contextEngine.inspect(payload) };
  if (action === "registry") return { ok: true, data: contextEngine.registry() };
  return { ok: false, error: "unknown_context_action" };
}

function runDecisionAction(action, payload = {}) {
  if (action === "status") return { ok: true, data: decisionAgent.status() };
  if (action === "evaluate") return decisionEngine.evaluate(payload);
  if (action === "history") return decisionEngine.history(payload.limit || 20);
  if (action === "score") return decisionEngine.score(payload);
  if (action === "validate") return decisionEngine.validate(payload);
  if (action === "explain") return decisionEngine.explain(payload);
  if (action === "policies") return decisionEngine.policies();
  return { ok: false, error: "unknown_decision_action" };
}

function runBrainOrchestratorAction(action, payload = {}) {
  if (action === "brain.status") return { ok: true, data: brainOrchestrator.status(payload) };
  if (action === "brain.health") return brainOrchestrator.health(payload);
  if (action === "brain.pipeline") return brainOrchestrator.pipeline(payload);
  if (action === "brain.metrics") return brainOrchestrator.metrics(payload);
  if (action === "brain.diagnostics") return { ok: true, data: integrationAgent.run(payload) };
  return { ok: false, error: "unknown_brain_orchestrator_action" };
}

function runRecommendationAction(action, payload = {}) {
  if (action === "recommendation.status") return { ok: true, data: recommendationEngine.status() };
  if (action === "recommendation.generate") return recommendationEngine.generate(payload);
  if (action === "recommendation.history") return recommendationEngine.history(payload.limit || 20);
  if (action === "recommendation.score") return recommendationEngine.score(payload);
  if (action === "recommendation.priority") return recommendationEngine.priority(payload);
  if (action === "recommendation.explain") return recommendationEngine.explain(payload);
  if (action === "recommendation.agent") return { ok: true, data: recommendationAgent.run(payload) };
  return { ok: false, error: "unknown_recommendation_action" };
}

function runExecutiveAction(action, payload = {}) {
  if (action === "executive.status") return { ok: true, data: executiveEngine.status() };
  if (action === "executive.dashboard") return executiveEngine.dashboard(payload);
  if (action === "executive.briefing") return executiveEngine.briefing(payload);
  if (action === "executive.kpi") return executiveEngine.kpi(payload);
  if (action === "executive.forecast") return executiveEngine.forecast(payload);
  if (action === "executive.health") return executiveEngine.health(payload);
  if (action === "executive.risks") return executiveEngine.risks(payload);
  if (action === "executive.opportunities") return executiveEngine.opportunities(payload);
  if (action === "executive.summary") return executiveEngine.summary(payload);
  if (action === "executive.agent") return { ok: true, data: executiveAgent.run(payload) };
  return { ok: false, error: "unknown_executive_action" };
}

function runSalesAction(action, payload = {}) {
  if (action === "sales.status") return { ok: true, data: salesEngine.status() };
  if (action === "sales.pipeline") return salesEngine.pipeline(payload);
  if (action === "sales.estimates") return salesEngine.estimates(payload);
  if (action === "sales.followups") return salesEngine.followups(payload);
  if (action === "sales.conversion") return salesEngine.conversion(payload);
  if (action === "sales.opportunities") return salesEngine.opportunities(payload);
  if (action === "sales.dashboard") return salesEngine.dashboard(payload);
  if (action === "sales.agent") return { ok: true, data: salesManagerAgent.run(payload) };
  return { ok: false, error: "unknown_sales_action" };
}

function runWorkflowAction(action, payload = {}) {
  if (action === "workflow.status") return { ok: true, data: workflowEngine.status() };
  if (action === "workflow.trigger") return workflowEngine.trigger(payload);
  if (action === "workflow.build") return workflowEngine.build(payload);
  if (action === "workflow.history") return workflowEngine.history(payload.limit || 20);
  if (action === "workflow.events") return { ok: true, data: workflowEngine.events(payload.limit || 20) };
  if (action === "workflow.registry") return { ok: true, data: workflowEngine.registry() };
  if (action === "workflow.validate") return { ok: true, data: workflowEngine.validate(payload) };
  if (action === "workflow.agent") return { ok: true, data: workflowAgent.run(payload) };
  return { ok: false, error: "unknown_workflow_action" };
}

function runOperationsAction(action, payload = {}) {
  if (action === "operations.status") return { ok: true, data: operationsEngine.status() };
  if (action === "operations.dashboard") return operationsEngine.dashboard(payload);
  if (action === "operations.jobs") return operationsEngine.jobs(payload);
  if (action === "operations.technicians") return operationsEngine.technicians(payload);
  if (action === "operations.dispatchSuggestions") return operationsEngine.dispatchSuggestions(payload);
  if (action === "operations.scheduleHealth") return operationsEngine.scheduleHealth(payload);
  if (action === "operations.priorities") return operationsEngine.priorities(payload);
  if (action === "operations.customerTimeline") return operationsEngine.customerTimeline(payload);
  if (action === "operations.inventoryNeeds") return operationsEngine.inventoryNeeds(payload);
  if (action === "operations.agent") return { ok: true, data: operationsAgent.run(payload) };
  return { ok: false, error: "unknown_operations_action" };
}

function runFinanceAction(action, payload = {}) {
  if (action === "finance.status") return { ok: true, data: financeEngine.status() };
  if (action === "finance.dashboard") return financeEngine.dashboard(payload);
  if (action === "finance.revenue") return financeEngine.revenue(payload);
  if (action === "finance.invoices") return financeEngine.invoices(payload);
  if (action === "finance.cashflow") return financeEngine.cashflow(payload);
  if (action === "finance.expenses") return financeEngine.expenses(payload);
  if (action === "finance.profit") return financeEngine.profit(payload);
  if (action === "finance.forecast") return financeEngine.forecast(payload);
  if (action === "finance.health") return financeEngine.health(payload);
  if (action === "finance.kpis") return financeEngine.kpis(payload);
  if (action === "finance.agent") return { ok: true, data: financeAgent.run(payload) };
  return { ok: false, error: "unknown_finance_action" };
}

function runCustomerSuccessAction(action, payload = {}) {
  if (action === "customerSuccess.status") return { ok: true, data: customerSuccessEngine.status() };
  if (action === "customerSuccess.dashboard") return customerSuccessEngine.dashboard(payload);
  if (action === "customerSuccess.health") return customerSuccessEngine.health(payload);
  if (action === "customerSuccess.timeline") return customerSuccessEngine.timeline(payload);
  if (action === "customerSuccess.ltv") return customerSuccessEngine.ltv(payload);
  if (action === "customerSuccess.risks") return customerSuccessEngine.risks(payload);
  if (action === "customerSuccess.vip") return customerSuccessEngine.vip(payload);
  if (action === "customerSuccess.lost") return customerSuccessEngine.lost(payload);
  if (action === "customerSuccess.recommendations") return customerSuccessEngine.recommendations(payload);
  if (action === "customerSuccess.agent") return { ok: true, data: customerSuccessAgent.run(payload) };
  return { ok: false, error: "unknown_customer_success_action" };
}

function runMarketingGrowthAction(action, payload = {}) {
  if (action === "marketing.status") return { ok: true, data: marketingGrowthEngine.status() };
  if (action === "marketing.dashboard") return marketingGrowthEngine.dashboard(payload);
  if (action === "marketing.leads") return marketingGrowthEngine.leads(payload);
  if (action === "marketing.campaigns") return marketingGrowthEngine.campaigns(payload);
  if (action === "marketing.localSeo") return marketingGrowthEngine.localSeo(payload);
  if (action === "marketing.reviews") return marketingGrowthEngine.reviews(payload);
  if (action === "marketing.social") return marketingGrowthEngine.social(payload);
  if (action === "marketing.email") return marketingGrowthEngine.email(payload);
  if (action === "marketing.roi") return marketingGrowthEngine.roi(payload);
  if (action === "marketing.recommendations") return marketingGrowthEngine.recommendations(payload);
  if (action === "marketing.agent") return { ok: true, data: marketingManagerAgent.run(payload) };
  return { ok: false, error: "unknown_marketing_growth_action" };
}

function clean(value, max = 120) {
  return String(value || "").trim().slice(0, max);
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (typeof req.body === "object" && req.body) return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") return sendJson(res, 204, {});
    if (req.method === "GET") {
      return sendJson(res, 200, {
        ok: true,
        data: {
          router: "system",
          modules: ["developer", "business-os", "platform", "titan", "brain", "memory", "context", "decision", "recommendation", "executive", "sales", "workflow", "operations", "finance", "customerSuccess", "marketing"],
          brainActions: ["brain.status", "brain.health", "brain.pipeline", "brain.metrics", "brain.diagnostics"],
          recommendationActions: ["recommendation.status", "recommendation.generate", "recommendation.history", "recommendation.score", "recommendation.priority", "recommendation.explain"],
          executiveActions: ["executive.status", "executive.dashboard", "executive.briefing", "executive.kpi", "executive.forecast", "executive.health", "executive.risks", "executive.opportunities", "executive.summary"],
          salesActions: ["sales.status", "sales.pipeline", "sales.estimates", "sales.followups", "sales.conversion", "sales.opportunities", "sales.dashboard"],
          workflowActions: ["workflow.status", "workflow.trigger", "workflow.build", "workflow.history", "workflow.events", "workflow.registry", "workflow.validate"],
          operationsActions: ["operations.status", "operations.dashboard", "operations.jobs", "operations.technicians", "operations.dispatchSuggestions", "operations.scheduleHealth", "operations.priorities", "operations.customerTimeline", "operations.inventoryNeeds"],
          financeActions: ["finance.status", "finance.dashboard", "finance.revenue", "finance.invoices", "finance.cashflow", "finance.expenses", "finance.profit", "finance.forecast", "finance.health", "finance.kpis"],
          customerSuccessActions: ["customerSuccess.status", "customerSuccess.dashboard", "customerSuccess.health", "customerSuccess.timeline", "customerSuccess.ltv", "customerSuccess.risks", "customerSuccess.vip", "customerSuccess.lost", "customerSuccess.recommendations"],
          marketingActions: ["marketing.status", "marketing.dashboard", "marketing.leads", "marketing.campaigns", "marketing.localSeo", "marketing.reviews", "marketing.social", "marketing.email", "marketing.roi", "marketing.recommendations"]
        }
      });
    }
    if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method_not_allowed" });

    const body = await readBody(req);
    const moduleName = clean(body.module, 80);
    const action = clean(body.action, 120);
    const target = modules[moduleName];
    if (!action) return sendJson(res, 400, { ok: false, error: "missing_system_action" });
    if (moduleName === "memory") {
      const result = runMemoryAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "context") {
      const result = runContextAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "decision") {
      const result = runDecisionAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "brain" && action.indexOf("brain.") === 0) {
      const result = runBrainOrchestratorAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "recommendation") {
      const result = runRecommendationAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "executive") {
      const result = runExecutiveAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "sales") {
      const result = runSalesAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "workflow") {
      const result = runWorkflowAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "operations") {
      const result = runOperationsAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "finance") {
      const result = runFinanceAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "customerSuccess") {
      const result = runCustomerSuccessAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "marketing") {
      const result = runMarketingGrowthAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (!target) return sendJson(res, 400, { ok: false, error: "unknown_system_module" });

    req.body = {
      ...(body.payload || {}),
      payload: body.payload || {},
      action
    };
    return target(req, res);
  } catch (error) {
    console.error("system_api_error", error);
    return sendJson(res, 500, { ok: false, error: "server_error", message: clean(error.message, 500) });
  }
};
