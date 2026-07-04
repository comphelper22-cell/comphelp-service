function capacityPlan(jobs = [], technicians = []) {
  const openJobs = jobs.filter((job) => !/complete|completed|done|closed/i.test(String(job.status || ""))).length;
  const available = technicians.filter((tech) => tech.workload !== "busy").length;
  const dailyCapacity = Math.max(1, technicians.length * 3);
  const loadPercent = Math.round((openJobs / dailyCapacity) * 100);
  return {
    openJobs,
    technicianCount: technicians.length,
    availableTechnicians: available,
    dailyCapacity,
    loadPercent,
    status: loadPercent >= 90 ? "overloaded" : loadPercent >= 70 ? "tight" : "healthy",
    recommendation: loadPercent >= 90 ? "Move low priority jobs or add partner capacity." : "Schedule is within workable capacity.",
    generatedAt: new Date().toISOString()
  };
}

module.exports = { capacityPlan };
