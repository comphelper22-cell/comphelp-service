const executiveKpi = require("../brain/executive/executive-kpi");
const { buildPipeline } = require("./pipeline-manager");
const { scoreEstimates } = require("./estimate-scoring");
const { buildFollowups } = require("./followup-engine");
const { conversionMetrics } = require("./conversion-engine");
const { findRevenueOpportunities } = require("./revenue-opportunities");
const { dashboard } = require("./sales-dashboard");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "AI Sales Manager",
    pipeline: ["Lead", "Qualification", "Estimate", "Follow-up", "Negotiation", "Won / Lost"],
    externalAiConnected: false,
    jsonCompatible: true,
    generatedAt: new Date().toISOString()
  };
}

function pipeline(input = {}) {
  return { ok: true, data: buildPipeline(executiveKpi.readMarketplaceData(input)) };
}

function estimates(input = {}) {
  return { ok: true, data: scoreEstimates(executiveKpi.readMarketplaceData(input)) };
}

function followups(input = {}) {
  const data = executiveKpi.readMarketplaceData(input);
  const pipelineData = buildPipeline(data);
  return { ok: true, data: buildFollowups(data, pipelineData.prioritizedDeals) };
}

function conversion(input = {}) {
  const data = executiveKpi.readMarketplaceData(input);
  const pipelineData = buildPipeline(data);
  const followupsData = buildFollowups(data, pipelineData.prioritizedDeals);
  return { ok: true, data: conversionMetrics(data, pipelineData.prioritizedDeals, followupsData) };
}

function opportunities(input = {}) {
  const data = executiveKpi.readMarketplaceData(input);
  const pipelineData = buildPipeline(data);
  return { ok: true, data: findRevenueOpportunities(pipelineData.prioritizedDeals, pipelineData.customerIntel) };
}

module.exports = {
  conversion,
  dashboard,
  estimates,
  followups,
  opportunities,
  pipeline,
  status
};
