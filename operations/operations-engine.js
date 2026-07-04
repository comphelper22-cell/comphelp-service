const { readMarketplaceData } = require("../brain/executive/executive-kpi");
const { operationsDashboard } = require("./operations-dashboard");
const { jobsBoard } = require("./jobs-board");
const { technicianBoard } = require("./technician-board");
const { dispatchSuggestions } = require("./dispatch-suggestions");
const { scheduleHealth } = require("./schedule-health");
const { jobPriorityQueue } = require("./job-priority");
const { customerTimeline } = require("./customer-timeline");
const { inventoryNeeds } = require("./inventory-needs");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Operations Center",
    modules: ["jobs", "technicians", "dispatchSuggestions", "scheduleHealth", "priorities", "customerTimeline", "inventoryNeeds", "dashboard"],
    externalAiConnected: false,
    jsonCompatible: true,
    generatedAt: new Date().toISOString()
  };
}

function dashboard(input = {}) {
  return operationsDashboard(input);
}

function jobs(input = {}) {
  return { ok: true, data: jobsBoard(readMarketplaceData(input)) };
}

function technicians(input = {}) {
  const data = readMarketplaceData(input);
  const jobs = jobsBoard(data);
  return { ok: true, data: technicianBoard(data, jobs.jobs) };
}

function suggestions(input = {}) {
  const data = readMarketplaceData(input);
  const jobs = jobsBoard(data);
  const techs = technicianBoard(data, jobs.jobs);
  return { ok: true, data: dispatchSuggestions(jobPriorityQueue(jobs.jobs), techs.technicians) };
}

function health(input = {}) {
  const data = readMarketplaceData(input);
  const jobs = jobsBoard(data);
  const techs = technicianBoard(data, jobs.jobs);
  return { ok: true, data: scheduleHealth(jobs.jobs, techs.technicians) };
}

function priorities(input = {}) {
  const data = readMarketplaceData(input);
  return { ok: true, data: jobPriorityQueue(jobsBoard(data).jobs) };
}

function timeline(input = {}) {
  const data = readMarketplaceData(input);
  const jobs = jobsBoard(data);
  return { ok: true, data: customerTimeline(data, jobs.jobs) };
}

function inventory(input = {}) {
  const data = readMarketplaceData(input);
  const jobs = jobsBoard(data);
  return { ok: true, data: inventoryNeeds(data, jobs.jobs) };
}

module.exports = {
  dashboard,
  dispatchSuggestions: suggestions,
  inventoryNeeds: inventory,
  jobs,
  priorities,
  scheduleHealth: health,
  status,
  technicians,
  customerTimeline: timeline
};
