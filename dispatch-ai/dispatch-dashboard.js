const { readMarketplaceData } = require("../brain/executive/executive-kpi");
const { jobsBoard } = require("../operations/jobs-board");
const { technicianBoard } = require("../operations/technician-board");
const { scheduleHealth } = require("../operations/schedule-health");
const { optimizeSchedule } = require("./schedule-optimizer");
const { planRoutes } = require("./route-planner");
const { calculateEta } = require("./eta-engine");
const { capacityPlan } = require("./capacity-planner");
const { emergencyDispatch } = require("./emergency-dispatch");

function dispatchDashboard(input = {}) {
  const data = readMarketplaceData(input);
  const jobs = jobsBoard(data);
  const techs = technicianBoard(data, jobs.jobs);
  const optimized = optimizeSchedule(jobs.jobs, techs.technicians);
  const routes = planRoutes(optimized.todaySchedule);
  const eta = calculateEta(optimized.todaySchedule, routes.routes);
  const capacity = capacityPlan(jobs.jobs, techs.technicians);
  const emergency = emergencyDispatch(jobs.jobs, techs.technicians);
  const health = scheduleHealth(jobs.jobs, techs.technicians);

  return {
    ok: true,
    data: {
      todaySchedule: optimized.todaySchedule,
      technicianAvailability: techs.technicians,
      routeSuggestions: routes.routeSuggestions,
      routes: routes.routes,
      eta: eta.eta,
      emergencyJobs: emergency.emergencyJobs,
      scheduleConflicts: optimized.scheduleConflicts.concat(health.warnings.map((warning) => ({ title: warning, conflict: true }))),
      aiDispatchSuggestions: optimized.aiDispatchSuggestions,
      capacity,
      scheduleHealth: health,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { dispatchDashboard };
