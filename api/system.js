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
          modules: ["developer", "business-os", "platform", "titan", "brain", "memory", "context", "decision", "recommendation"],
          brainActions: ["brain.status", "brain.health", "brain.pipeline", "brain.metrics", "brain.diagnostics"],
          recommendationActions: ["recommendation.status", "recommendation.generate", "recommendation.history", "recommendation.score", "recommendation.priority", "recommendation.explain"]
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
