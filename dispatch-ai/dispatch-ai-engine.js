const { readMarketplaceData } = require("../brain/executive/executive-kpi");
const { jobsBoard } = require("../operations/jobs-board");
const { technicianBoard } = require("../operations/technician-board");
const { dispatchDashboard } = require("./dispatch-dashboard");
const { optimizeSchedule } = require("./schedule-optimizer");
const { technicianMatches } = require("./technician-matcher");
const { planRoutes } = require("./route-planner");
const { calculateEta } = require("./eta-engine");
const { capacityPlan } = require("./capacity-planner");
const { emergencyDispatch } = require("./emergency-dispatch");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Scheduling & Dispatch AI",
    modules: ["dashboard", "schedule", "optimize", "technicians", "routes", "eta", "capacity", "emergency"],
    externalMapsConnected: false,
    automaticDispatchEnabled: false,
    jsonCompatible: true,
    generatedAt: new Date().toISOString()
  };
}

function dashboard(input = {}) {
  return dispatchDashboard(input);
}

function schedule(input = {}) {
  const context = buildContext(input);
  return { ok: true, data: optimizeSchedule(context.jobs.jobs, context.techs.technicians) };
}

function optimize(input = {}) {
  return schedule(input);
}

function technicians(input = {}) {
  const context = buildContext(input);
  return { ok: true, data: { technicians: context.techs.technicians, available: context.techs.available, busy: context.techs.busy, matches: technicianMatches(context.jobs.jobs, context.techs.technicians) } };
}

function routes(input = {}) {
  const optimized = schedule(input).data;
  return { ok: true, data: planRoutes(optimized.todaySchedule) };
}

function eta(input = {}) {
  const optimized = schedule(input).data;
  const planned = planRoutes(optimized.todaySchedule);
  return { ok: true, data: calculateEta(optimized.todaySchedule, planned.routes) };
}

function capacity(input = {}) {
  const context = buildContext(input);
  return { ok: true, data: capacityPlan(context.jobs.jobs, context.techs.technicians) };
}

function emergency(input = {}) {
  const context = buildContext(input);
  return { ok: true, data: emergencyDispatch(context.jobs.jobs, context.techs.technicians) };
}

function buildContext(input = {}) {
  const data = readMarketplaceData(input);
  const jobs = jobsBoard(data);
  const techs = technicianBoard(data, jobs.jobs);
  return { data, jobs, techs };
}

module.exports = {
  capacity,
  dashboard,
  emergency,
  eta,
  optimize,
  routes,
  schedule,
  status,
  technicians
};
