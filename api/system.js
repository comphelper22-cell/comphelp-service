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
const analyticsEngine = require("../analytics/analytics-engine");
const analyticsAgent = require("../agents/analytics-agent");
const dispatchAiEngine = require("../dispatch-ai/dispatch-ai-engine");
const aiDispatcherAgent = require("../agents/ai-dispatcher-agent");
const saasEngine = require("../saas/tenant-engine");
const saasAgent = require("../agents/saas-agent");
const billingEngine = require("../billing/billing-engine");
const billingAgent = require("../agents/billing-agent");
const integrationEngine = require("../integrations/integration-engine");
const integrationManagerAgent = require("../agents/integration-manager-agent");
const databaseAgent = require("../agents/database-agent");
const { databaseHealth } = require("../database/core/database-health");
const { databaseConfig } = require("../database/core/database-config");
const { listMigrations } = require("../database/core/database-migrations");
const { seedStatus } = require("../database/core/database-seed");
const identityEngine = require("../identity/identity-engine");
const authEngine = require("../auth/auth-engine");
const organizationEngine = require("../organizations/organization-engine");
const { rbacStatus } = require("../roles/rbac-engine");
const identityAgent = require("../agents/identity-agent");
const { customerCrm } = require("../crm/customer-crm");
const { jobDispatch } = require("../job-dispatch/job-dispatch");
const { revenueFlow } = require("../revenue-flow/revenue-flow");
const { aiOperationsAssistant } = require("../ai-operations-assistant/assistant");

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
  if (action === "marketing.leadIntelligence") return marketingGrowthEngine.leadIntelligence(payload);
  if (action === "marketing.marketWatcher") return marketingGrowthEngine.marketWatcher(payload);
  if (action === "marketing.scoreLead") return marketingGrowthEngine.scoreLead(payload.lead || payload);
  if (action === "marketing.strategy") return marketingGrowthEngine.strategy(payload);
  if (action === "marketing.saveLeadToCrm") return marketingGrowthEngine.saveLeadToCrm(payload);
  if (action === "marketing.outreachPolicy") return marketingGrowthEngine.outreachPolicy(payload);
  if (action === "marketing.agent") return { ok: true, data: marketingManagerAgent.run(payload) };
  return { ok: false, error: "unknown_marketing_growth_action" };
}

function runAnalyticsAction(action, payload = {}) {
  if (action === "analytics.status") return { ok: true, data: analyticsEngine.status() };
  if (action === "analytics.dashboard") return analyticsEngine.dashboard(payload);
  if (action === "analytics.kpis") return analyticsEngine.kpis(payload);
  if (action === "analytics.trends") return analyticsEngine.trends(payload);
  if (action === "analytics.reports") return analyticsEngine.reports(payload);
  if (action === "analytics.scorecard") return analyticsEngine.scorecard(payload);
  if (action === "analytics.export") return analyticsEngine.export(payload);
  if (action === "analytics.insights") return analyticsEngine.insights(payload);
  if (action === "analytics.agent") return { ok: true, data: analyticsAgent.run(payload) };
  return { ok: false, error: "unknown_analytics_action" };
}

function runDispatchAiAction(action, payload = {}) {
  if (action === "dispatchAI.status") return { ok: true, data: dispatchAiEngine.status() };
  if (action === "dispatchAI.dashboard") return dispatchAiEngine.dashboard(payload);
  if (action === "dispatchAI.schedule") return dispatchAiEngine.schedule(payload);
  if (action === "dispatchAI.optimize") return dispatchAiEngine.optimize(payload);
  if (action === "dispatchAI.technicians") return dispatchAiEngine.technicians(payload);
  if (action === "dispatchAI.routes") return dispatchAiEngine.routes(payload);
  if (action === "dispatchAI.eta") return dispatchAiEngine.eta(payload);
  if (action === "dispatchAI.capacity") return dispatchAiEngine.capacity(payload);
  if (action === "dispatchAI.emergency") return dispatchAiEngine.emergency(payload);
  if (action === "dispatchAI.agent") return { ok: true, data: aiDispatcherAgent.run(payload) };
  return { ok: false, error: "unknown_dispatch_ai_action" };
}

function runSaasAction(action, payload = {}) {
  if (action === "saas.status") return { ok: true, data: saasEngine.status() };
  if (action === "saas.organizations") return saasEngine.organizations(payload);
  if (action === "saas.teams") return saasEngine.teams(payload);
  if (action === "saas.permissions") return saasEngine.permissions(payload);
  if (action === "saas.settings") return saasEngine.settings(payload);
  if (action === "saas.dashboard") return saasEngine.dashboard(payload);
  if (action === "saas.agent") return { ok: true, data: saasAgent.run(payload) };
  return { ok: false, error: "unknown_saas_action" };
}

function runBillingAction(action, payload = {}) {
  if (action === "billing.status") return { ok: true, data: billingEngine.status() };
  if (action === "billing.plans") return billingEngine.plans(payload);
  if (action === "billing.subscriptions") return billingEngine.subscriptions(payload);
  if (action === "billing.invoices") return billingEngine.invoices(payload);
  if (action === "billing.usage") return billingEngine.usage(payload);
  if (action === "billing.dashboard") return billingEngine.dashboard(payload);
  if (action === "billing.paymentStatus") return billingEngine.paymentStatus(payload);
  if (action === "billing.agent") return { ok: true, data: billingAgent.run(payload) };
  return { ok: false, error: "unknown_billing_action" };
}

function runIntegrationsAction(action, payload = {}) {
  if (action === "integrations.status") return { ok: true, data: integrationEngine.status() };
  if (action === "integrations.registry") return integrationEngine.registry(payload);
  if (action === "integrations.apiKeys") return integrationEngine.apiKeys(payload);
  if (action === "integrations.webhooks") return integrationEngine.webhooks(payload);
  if (action === "integrations.logs") return integrationEngine.logs(payload);
  if (action === "integrations.dashboard") return integrationEngine.dashboard(payload);
  if (action === "integrations.agent") return { ok: true, data: integrationManagerAgent.run(payload) };
  return { ok: false, error: "unknown_integrations_action" };
}

function runDatabaseAction(action, payload = {}) {
  if (action === "database.status") return databaseAgent.run(payload);
  if (action === "database.health") return { ok: true, data: databaseHealth() };
  if (action === "database.schema") return databaseAgent.schemaReport(payload);
  if (action === "database.repositories") return databaseAgent.repositoryReport(payload);
  if (action === "database.migrations") return listMigrations(payload);
  if (action === "database.seed") return seedStatus(payload);
  if (action === "database.supabaseReady") {
    const config = databaseConfig();
    return {
      ok: true,
      data: {
        configured: config.supabaseConfigured,
        missingEnv: config.missingEnv,
        jsonFallbackEnabled: config.jsonFallbackEnabled,
        productionConnectionActive: false,
        readyForManualConfiguration: true
      }
    };
  }
  return { ok: false, error: "unknown_database_action" };
}

function runIdentityAction(action, payload = {}) {
  if (action === "identity.status") return identityEngine.status(payload);
  if (action === "identity.health") return identityEngine.health(payload);
  if (action === "identity.agent") return identityAgent.run(payload);
  return { ok: false, error: "unknown_identity_action" };
}

function runAuthAction(action, payload = {}) {
  if (action === "auth.status") return authEngine.status(payload);
  if (action === "auth.login") return authEngine.login(payload);
  if (action === "auth.logout") return authEngine.logout(payload);
  if (action === "auth.register") return authEngine.register(payload);
  if (action === "auth.refresh") return authEngine.refreshToken(payload);
  if (action === "auth.passwordReset") return authEngine.passwordReset(payload);
  if (action === "session.status") return authEngine.sessionStatus(payload);
  return { ok: false, error: "unknown_auth_action" };
}

function runOrganizationAction(action, payload = {}) {
  if (action === "organization.status") return organizationEngine.status(payload);
  return { ok: false, error: "unknown_organization_action" };
}

function runRolesAction(action, payload = {}) {
  if (action === "roles.status") return rbacStatus(payload);
  return { ok: false, error: "unknown_roles_action" };
}

function runCustomerAction(action, payload = {}) {
  if (action === "customer.create") return customerCrm.create(payload);
  if (action === "customer.update") return customerCrm.update(payload.id || payload.customerId, payload);
  if (action === "customer.delete") return customerCrm.delete(payload.id || payload.customerId);
  if (action === "customer.archive") return customerCrm.archive(payload.id || payload.customerId);
  if (action === "customer.restore") return customerCrm.restore(payload.id || payload.customerId);
  if (action === "customer.search") return customerCrm.search(payload);
  if (action === "customer.profile") return customerCrm.profile(payload.id || payload.customerId);
  if (action === "customer.timeline") return customerCrm.timeline(payload.id || payload.customerId);
  if (action === "customer.note") return customerCrm.note(payload);
  if (action === "customer.summary") return customerCrm.summary(payload.id || payload.customerId);
  if (action === "customer.dashboard") return customerCrm.dashboard(payload);
  if (action === "customer.recent") return customerCrm.recent(payload.limit || 10);
  return { ok: false, error: "unknown_customer_action" };
}

function runJobAction(action, payload = {}) {
  if (action === "job.create") return jobDispatch.create(payload);
  if (action === "job.update") return jobDispatch.update(payload.id || payload.jobId, payload);
  if (action === "job.assign") return jobDispatch.assign(payload.id || payload.jobId, payload);
  if (action === "job.schedule") return jobDispatch.schedule(payload.id || payload.jobId, payload);
  if (action === "job.status") return jobDispatch.status(payload.id || payload.jobId, payload.status, payload.notes);
  if (action === "job.timeline") return jobDispatch.timeline(payload.id || payload.jobId);
  if (action === "job.complete") return jobDispatch.complete(payload.id || payload.jobId, payload);
  if (action === "job.dashboard") return jobDispatch.dashboard(payload);
  if (action === "job.details") return jobDispatch.details(payload.id || payload.jobId);
  if (action === "job.aiDispatch") return { ok: true, data: jobDispatch.aiDispatch(), error: null, warnings: [], generatedAt: new Date().toISOString() };
  return { ok: false, data: null, error: "unknown_job_action", warnings: [], generatedAt: new Date().toISOString() };
}

function runRevenueAction(action, payload = {}) {
  if (action === "estimate.create") return revenueFlow.createEstimate(payload);
  if (action === "estimate.update") return revenueFlow.updateEstimate(payload.id || payload.estimateId, payload);
  if (action === "estimate.approve") return revenueFlow.approveEstimate(payload.id || payload.estimateId);
  if (action === "estimate.reject") return revenueFlow.rejectEstimate(payload.id || payload.estimateId, payload.reason);
  if (action === "estimate.convertToJob") return revenueFlow.convertEstimateToJob(payload.id || payload.estimateId);
  if (action === "invoice.create") return payload.jobId ? revenueFlow.createInvoiceFromJob(payload.jobId) : revenueFlow.createInvoice(payload);
  if (action === "invoice.update") return revenueFlow.updateInvoice(payload.id || payload.invoiceId, payload);
  if (action === "invoice.markSent") return revenueFlow.markInvoice(payload.id || payload.invoiceId, "sent", payload);
  if (action === "invoice.markPaid") return revenueFlow.markInvoice(payload.id || payload.invoiceId, "paid", payload);
  if (action === "invoice.markOverdue") return revenueFlow.markInvoice(payload.id || payload.invoiceId, "overdue", payload);
  if (action === "payment.record") return revenueFlow.recordPayment(payload);
  if (action === "revenue.dashboard") return revenueFlow.dashboard(payload);
  if (action === "customer.financials") return revenueFlow.customerFinancials(payload.customerId || payload.customerName || payload.id);
  return { ok: false, data: null, error: "unknown_revenue_action", warnings: [], generatedAt: new Date().toISOString() };
}

function runAssistantAction(action, payload = {}) {
  if (action === "assistant.ask") return aiOperationsAssistant.ask(payload);
  if (action === "assistant.summary") return aiOperationsAssistant.summary(payload);
  if (action === "assistant.dashboard") return aiOperationsAssistant.dashboard(payload);
  if (action === "assistant.recommendations") return aiOperationsAssistant.recommendations(payload);
  if (action === "assistant.businessHealth") return aiOperationsAssistant.businessHealth(payload.data);
  if (action === "assistant.customerInsights") return aiOperationsAssistant.customerInsights(payload.data);
  if (action === "assistant.jobInsights") return aiOperationsAssistant.jobInsights(payload.data);
  if (action === "assistant.revenueInsights") return aiOperationsAssistant.revenueInsights(payload.data);
  return { ok: false, data: null, error: "unknown_assistant_action", warnings: [], generatedAt: new Date().toISOString() };
}

function chatFallback(message) {
  const text = clean(message, 1000).toLowerCase();
  if (/camera|security|cctv/.test(text)) return "CompHelp Service can help with security camera installation. I can collect your name, phone, service, and address for a free estimate.";
  if (/wifi|network|router|mesh/.test(text)) return "CompHelp Service can help with WiFi and network installation, dead zones, routers, and mesh setup. I can collect your details for a free estimate.";
  if (/smart|doorbell|lock|home/.test(text)) return "CompHelp Service can help set up smart home devices, doorbells, locks, lights, cameras, and apps. I can collect your details for follow-up.";
  if (/computer|laptop|repair|data|file/.test(text)) return "CompHelp Service can help with computer repair, setup, troubleshooting, and data recovery requests. I can collect your details for a free estimate.";
  return "I can help with security cameras, smart home setup, WiFi installation, computer repair, and data recovery. What service do you need help with?";
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
          modules: ["developer", "business-os", "platform", "titan", "brain", "memory", "context", "decision", "recommendation", "executive", "sales", "workflow", "operations", "finance", "customerSuccess", "marketing", "analytics", "dispatchAI", "saas", "billing", "integrations", "database", "identity", "auth", "organization", "roles", "customer", "job", "revenue", "assistant"],
          brainActions: ["brain.status", "brain.health", "brain.pipeline", "brain.metrics", "brain.diagnostics"],
          recommendationActions: ["recommendation.status", "recommendation.generate", "recommendation.history", "recommendation.score", "recommendation.priority", "recommendation.explain"],
          executiveActions: ["executive.status", "executive.dashboard", "executive.briefing", "executive.kpi", "executive.forecast", "executive.health", "executive.risks", "executive.opportunities", "executive.summary"],
          salesActions: ["sales.status", "sales.pipeline", "sales.estimates", "sales.followups", "sales.conversion", "sales.opportunities", "sales.dashboard"],
          workflowActions: ["workflow.status", "workflow.trigger", "workflow.build", "workflow.history", "workflow.events", "workflow.registry", "workflow.validate"],
          operationsActions: ["operations.status", "operations.dashboard", "operations.jobs", "operations.technicians", "operations.dispatchSuggestions", "operations.scheduleHealth", "operations.priorities", "operations.customerTimeline", "operations.inventoryNeeds"],
          financeActions: ["finance.status", "finance.dashboard", "finance.revenue", "finance.invoices", "finance.cashflow", "finance.expenses", "finance.profit", "finance.forecast", "finance.health", "finance.kpis"],
          customerSuccessActions: ["customerSuccess.status", "customerSuccess.dashboard", "customerSuccess.health", "customerSuccess.timeline", "customerSuccess.ltv", "customerSuccess.risks", "customerSuccess.vip", "customerSuccess.lost", "customerSuccess.recommendations"],
          marketingActions: [
            "marketing.status",
            "marketing.dashboard",
            "marketing.leads",
            "marketing.campaigns",
            "marketing.localSeo",
            "marketing.reviews",
            "marketing.social",
            "marketing.email",
            "marketing.roi",
            "marketing.recommendations",
            "marketing.leadIntelligence",
            "marketing.marketWatcher",
            "marketing.scoreLead",
            "marketing.strategy",
            "marketing.saveLeadToCrm",
            "marketing.outreachPolicy"
          ],
          analyticsActions: ["analytics.status", "analytics.dashboard", "analytics.kpis", "analytics.trends", "analytics.reports", "analytics.scorecard", "analytics.export", "analytics.insights"],
          dispatchAIActions: ["dispatchAI.status", "dispatchAI.dashboard", "dispatchAI.schedule", "dispatchAI.optimize", "dispatchAI.technicians", "dispatchAI.routes", "dispatchAI.eta", "dispatchAI.capacity", "dispatchAI.emergency"],
          saasActions: ["saas.status", "saas.organizations", "saas.teams", "saas.permissions", "saas.settings", "saas.dashboard"],
          billingActions: ["billing.status", "billing.plans", "billing.subscriptions", "billing.invoices", "billing.usage", "billing.dashboard"],
          integrationsActions: ["integrations.status", "integrations.registry", "integrations.apiKeys", "integrations.webhooks", "integrations.logs", "integrations.dashboard"],
          databaseActions: ["database.status", "database.health", "database.schema", "database.repositories", "database.migrations", "database.seed", "database.supabaseReady"],
          identityActions: ["identity.status", "identity.health"],
          authActions: ["auth.status", "auth.login", "auth.logout", "auth.register", "auth.refresh", "auth.passwordReset", "session.status"],
          organizationActions: ["organization.status"],
          rolesActions: ["roles.status"],
          customerActions: ["customer.create", "customer.update", "customer.delete", "customer.archive", "customer.restore", "customer.search", "customer.profile", "customer.timeline", "customer.note", "customer.summary", "customer.dashboard", "customer.recent"],
          jobActions: ["job.create", "job.update", "job.assign", "job.schedule", "job.status", "job.timeline", "job.complete", "job.dashboard", "job.details", "job.aiDispatch"],
          revenueActions: ["estimate.create", "estimate.update", "estimate.approve", "estimate.reject", "estimate.convertToJob", "invoice.create", "invoice.update", "invoice.markSent", "invoice.markPaid", "invoice.markOverdue", "payment.record", "revenue.dashboard", "customer.financials"],
          assistantActions: ["assistant.ask", "assistant.summary", "assistant.dashboard", "assistant.recommendations", "assistant.businessHealth", "assistant.customerInsights", "assistant.jobInsights", "assistant.revenueInsights"]
        }
      });
    }
    if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method_not_allowed" });

    const body = await readBody(req);
    if (!body.module && !body.action && body.message !== undefined) {
      return sendJson(res, 200, {
        ok: true,
        reply: chatFallback(body.message),
        mode: "beta_demo_fallback"
      });
    }
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
    if (moduleName === "analytics") {
      const result = runAnalyticsAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "dispatchAI") {
      const result = runDispatchAiAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "saas") {
      const result = runSaasAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "billing") {
      const result = runBillingAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "integrations") {
      const result = runIntegrationsAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "database") {
      const result = runDatabaseAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "identity") {
      const result = runIdentityAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "auth") {
      const result = runAuthAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "organization") {
      const result = runOrganizationAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "roles") {
      const result = runRolesAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "customer") {
      const result = runCustomerAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "job") {
      const result = runJobAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "revenue") {
      const result = runRevenueAction(action, body.payload || {});
      return sendJson(res, result.ok ? 200 : 400, result);
    }
    if (moduleName === "assistant") {
      const result = runAssistantAction(action, body.payload || {});
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
