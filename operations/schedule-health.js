function scheduleHealth(jobs = [], technicians = []) {
  const openJobs = jobs.filter((job) => !/complete|completed|done/i.test(String(job.status || ""))).length;
  const atRisk = jobs.filter((job) => job.atRisk).length;
  const unassigned = jobs.filter((job) => /unassigned/i.test(String(job.technician || ""))).length;
  const capacity = Math.max(1, technicians.length * 3);
  const load = Math.round((openJobs / capacity) * 100);
  const score = Math.max(0, Math.min(100, 100 - atRisk * 12 - unassigned * 8 - Math.max(0, load - 80)));
  return {
    score,
    status: score >= 80 ? "healthy" : score >= 60 ? "watch" : "needs_attention",
    openJobs,
    atRisk,
    unassigned,
    capacity,
    load,
    warnings: buildWarnings(atRisk, unassigned, load)
  };
}

function buildWarnings(atRisk, unassigned, load) {
  const warnings = [];
  if (atRisk) warnings.push(`${atRisk} job(s) are late or at risk.`);
  if (unassigned) warnings.push(`${unassigned} job(s) need technician assignment.`);
  if (load > 90) warnings.push("Technician capacity is tight.");
  return warnings;
}

module.exports = {
  scheduleHealth
};
