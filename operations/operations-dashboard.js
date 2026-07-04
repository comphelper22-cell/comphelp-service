const { readMarketplaceData } = require("../brain/executive/executive-kpi");
const recommendationEngine = require("../brain/recommendation/recommendation-engine");
const workflowEngine = require("../workflow/workflow-engine");
const { jobsBoard } = require("./jobs-board");
const { technicianBoard } = require("./technician-board");
const { dispatchSuggestions } = require("./dispatch-suggestions");
const { scheduleHealth } = require("./schedule-health");
const { jobPriorityQueue } = require("./job-priority");
const { customerTimeline } = require("./customer-timeline");
const { inventoryNeeds } = require("./inventory-needs");

function operationsDashboard(input = {}) {
  const data = readMarketplaceData(input);
  const jobs = jobsBoard(data);
  const techs = technicianBoard(data, jobs.jobs);
  const priorities = jobPriorityQueue(jobs.jobs);
  const suggestions = dispatchSuggestions(priorities, techs.technicians);
  const health = scheduleHealth(jobs.jobs, techs.technicians);
  const timeline = customerTimeline(data, jobs.jobs);
  const inventory = inventoryNeeds(data, jobs.jobs);
  const recommendations = recommendationEngine.generate({ category: "Operations", record: false }).data.recommendations;
  const workflowStatus = workflowEngine.status();
  return {
    ok: true,
    data: {
      todaysJobs: jobs.todaysJobs,
      technicianBoard: techs.technicians,
      urgentJobs: jobs.urgentJobs,
      atRiskJobs: jobs.atRiskJobs,
      dispatchSuggestions: suggestions,
      scheduleHealth: health,
      customerWaiting: timeline.waiting,
      inventoryNeeded: inventory,
      jobPriorityQueue: priorities,
      operationsKpis: {
        openJobs: jobs.openJobs,
        completedJobs: jobs.completedJobs,
        urgentJobs: jobs.urgentJobs.length,
        atRiskJobs: jobs.atRiskJobs.length,
        availableTechnicians: techs.available,
        busyTechnicians: techs.busy,
        customerWaiting: timeline.waitingCount,
        scheduleScore: health.score
      },
      aiRecommendations: recommendations,
      workflowStatus: workflowStatus.data || workflowStatus,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  operationsDashboard
};
