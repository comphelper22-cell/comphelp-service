const strategyAgent = require("../agents/strategy-agent");
const productAgent = require("../agents/product-agent");
const customerSuccessAgent = require("../agents/customer-success-agent");
const performanceAgent = require("../agents/performance-agent");
const reliabilityAgent = require("../agents/reliability-agent");
const securityAgent = require("../agents/security-agent");
const qaAgent = require("../agents/qa-agent");
const innovationAgent = require("../agents/innovation-agent");
const projectControlAgent = require("../agents/project-control-agent");

const agents = [
  strategyAgent,
  productAgent,
  customerSuccessAgent,
  performanceAgent,
  reliabilityAgent,
  securityAgent,
  qaAgent,
  innovationAgent
];

function clean(value, max = 500) {
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

function requireAccess(req) {
  const secret = clean(req.headers["x-marketplace-admin-secret"], 500);
  const configured = [
    process.env.MARKETPLACE_ADMIN_SECRET,
    process.env.MARKETPLACE_MANAGER_SECRET,
    process.env.MARKETPLACE_VIEWER_SECRET,
    process.env.ADMIN_UPLOAD_SECRET
  ].filter(Boolean);
  if (!secret) return { ok: false, status: 401, error: "Missing admin code." };
  if (!configured.length && process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production") {
    return ["123456", "222222", "111111"].includes(secret) ? { ok: true } : { ok: false, status: 401, error: "Invalid admin code." };
  }
  if (!configured.length) return { ok: false, status: 500, error: "Titan secrets are not configured." };
  return configured.includes(secret) ? { ok: true } : { ok: false, status: 401, error: "Invalid admin code." };
}

function runAgents(context) {
  return agents.map((agent) => agent.run(context));
}

function averageScore(reports) {
  return Math.round(reports.reduce((sum, report) => sum + Number(report.score || 0), 0) / Math.max(1, reports.length));
}

function executiveBoard(context = {}) {
  const reports = runAgents(context);
  return {
    status: "foundation_ready",
    boardMembers: reports.map((report) => ({ agent: report.agent, role: report.role, score: report.score, summary: report.summary })),
    recommendations: reports.flatMap((report) => report.recommendations || []).slice(0, 12),
    risks: reports.flatMap((report) => report.risks || []).slice(0, 12)
  };
}

function aiScore(context = {}) {
  const reports = runAgents(context);
  const score = averageScore(reports);
  return {
    score,
    grade: score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "Needs Review",
    dimensions: {
      strategy: strategyAgent.run(context).score,
      product: productAgent.run(context).score,
      customerSuccess: customerSuccessAgent.run(context).score,
      performance: performanceAgent.run(context).score,
      reliability: reliabilityAgent.run(context).score,
      security: securityAgent.run(context).score,
      qa: qaAgent.run(context).score,
      innovation: innovationAgent.run(context).score
    }
  };
}

function qualityGates() {
  return {
    status: "approval_required",
    gates: [
      { name: "Validation", requirement: "npm run check-project passes", status: "required" },
      { name: "Git Review", requirement: "git status and git diff --stat reviewed", status: "required" },
      { name: "Security", requirement: "No secrets, .env, or logs/*.jsonl staged", status: "required" },
      { name: "API Safety", requirement: "Touched APIs return safe JSON", status: "required" },
      { name: "Owner Approval", requirement: "Push and deploy require explicit approval", status: "required" }
    ]
  };
}

function productStrategy() {
  return {
    status: "foundation",
    priorities: [
      "Finish Supabase readiness with JSON fallback intact.",
      "Build CRM v2 timeline and pipeline workflows.",
      "Improve estimate accuracy before dispatch automation.",
      "Use Project Titan to review quality before expanding automation."
    ],
    nextDecision: "Choose the first v0.7 CRM v2 workflow to ship."
  };
}

function customerFeedback() {
  return {
    status: "draft_loop",
    channels: ["lead form", "chat", "project notes", "review requests", "support messages"],
    rules: ["No automated customer contact without approval.", "Escalate negative reviews and privacy concerns.", "Summarize patterns before changing product scope."]
  };
}

function competitorMatrix() {
  return {
    status: "internal_template",
    note: "No competitor scraping or external research is performed by this endpoint.",
    categories: [
      { category: "CRM", comparisonFocus: "speed, simplicity, service-business fit" },
      { category: "Field service", comparisonFocus: "dispatch, estimates, scheduling" },
      { category: "AI assistants", comparisonFocus: "approval safety, agent specialization" },
      { category: "Marketing tools", comparisonFocus: "local SEO, content workflow, review loop" }
    ]
  };
}

function titanStatus(context = {}) {
  const board = executiveBoard(context);
  const score = aiScore(context);
  return {
    name: "Project Titan Sprint Alpha",
    status: "foundation_ready",
    automationEnabled: false,
    externalApisEnabled: false,
    ownerApprovalRequired: true,
    score: score.score,
    grade: score.grade,
    boardMembers: board.boardMembers.length,
    timestamp: new Date().toISOString()
  };
}

function projectControlStatus(context = {}) {
  return projectControlAgent.run(context);
}

function runAction(action, payload = {}) {
  const context = payload.context || {};
  if (action === "titanStatus") return { ok: true, data: titanStatus(context) };
  if (action === "executiveBoard") return { ok: true, data: executiveBoard(context) };
  if (action === "aiScore") return { ok: true, data: aiScore(context) };
  if (action === "qualityGates") return { ok: true, data: qualityGates(context) };
  if (action === "productStrategy") return { ok: true, data: productStrategy(context) };
  if (action === "customerFeedback") return { ok: true, data: customerFeedback(context) };
  if (action === "competitorMatrix") return { ok: true, data: competitorMatrix(context) };
  if (action === "projectControlStatus") return { ok: true, data: projectControlStatus(context) };
  if (action === "roadmapSummary") return { ok: true, data: projectControlAgent.roadmapSummary() };
  if (action === "backlogSummary") return { ok: true, data: projectControlAgent.backlogSummary() };
  if (action === "sprintPlan") return { ok: true, data: projectControlAgent.sprintPlan() };
  if (action === "releasePlan") return { ok: true, data: projectControlAgent.releasePlan() };
  if (action === "decisionLog") return { ok: true, data: projectControlAgent.decisionLog() };
  if (action === "focusRules") return { ok: true, data: projectControlAgent.focusRules() };
  return { ok: false, error: "unknown_titan_action" };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") return sendJson(res, 204, {});
    const auth = requireAccess(req);
    if (!auth.ok) return sendJson(res, auth.status, { ok: false, error: auth.error });
    if (req.method === "GET") return sendJson(res, 200, runAction("titanStatus", {}));
    if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    const body = await readBody(req);
    const result = runAction(clean(body.action || "titanStatus", 80), body.payload || body);
    return sendJson(res, result.ok ? 200 : 400, result);
  } catch (error) {
    console.error("titan_api_error", error);
    return sendJson(res, 500, { ok: false, error: "server_error", message: clean(error.message, 500) });
  }
};

module.exports._internal = {
  aiScore,
  competitorMatrix,
  customerFeedback,
  executiveBoard,
  productStrategy,
  projectControlStatus,
  qualityGates,
  roadmapSummary: projectControlAgent.roadmapSummary,
  backlogSummary: projectControlAgent.backlogSummary,
  sprintPlan: projectControlAgent.sprintPlan,
  releasePlan: projectControlAgent.releasePlan,
  decisionLog: projectControlAgent.decisionLog,
  focusRules: projectControlAgent.focusRules,
  titanStatus
};
