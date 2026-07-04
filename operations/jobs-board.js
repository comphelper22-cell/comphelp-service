function jobsBoard(data = {}) {
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const estimates = Array.isArray(data.estimates) ? data.estimates : [];
  const jobs = projects.length ? projects.map(normalizeProject) : fallbackJobs(estimates);
  const todaysJobs = jobs.filter((job) => isToday(job.scheduledDate) || job.status === "scheduled" || job.status === "in_progress");
  const urgentJobs = jobs.filter((job) => job.priority === "HIGH" || /urgent|emergency/i.test(job.notes || ""));
  const atRiskJobs = jobs.filter((job) => job.atRisk);
  return {
    jobs,
    todaysJobs,
    urgentJobs,
    atRiskJobs,
    openJobs: jobs.filter((job) => !isComplete(job.status)).length,
    completedJobs: jobs.filter((job) => isComplete(job.status)).length
  };
}

function normalizeProject(project = {}) {
  const status = String(project.status || "scheduled").toLowerCase();
  const scheduledDate = project.scheduledDate || project.date || project.preferredDate || project.completionDate || "";
  return {
    jobId: project.id || project.projectId || `job_${String(project.title || project.service || "project").replace(/\W+/g, "_").toLowerCase()}`,
    title: project.title || project.service || "Service job",
    customerName: project.customerName || project.name || "Customer",
    service: project.service || "Service",
    city: project.city || "Los Angeles",
    address: project.address || "",
    status,
    scheduledDate,
    technician: project.technician || project.vendorSelected || project.vendorName || "Unassigned",
    priority: priorityFor(project),
    atRisk: isAtRisk(project),
    notes: project.notes || project.beforeAfterNotes || ""
  };
}

function fallbackJobs(estimates = []) {
  return estimates
    .filter((estimate) => /approved|accepted|won/i.test(String(estimate.status || "")))
    .map((estimate) => ({
      jobId: estimate.id || estimate.estimateId || "approved_estimate",
      title: estimate.service || "Approved estimate",
      customerName: estimate.customerName || estimate.name || "Customer",
      service: estimate.service || "Service",
      city: estimate.city || "Los Angeles",
      address: estimate.address || "",
      status: "scheduled",
      scheduledDate: estimate.preferredDate || estimate.date || "",
      technician: "Unassigned",
      priority: "MEDIUM",
      atRisk: false,
      notes: "Created from approved estimate fallback."
    }));
}

function priorityFor(project) {
  if (/urgent|emergency|same.?day/i.test(String(project.urgency || project.notes || ""))) return "HIGH";
  if (/late|risk|blocked/i.test(String(project.status || project.notes || ""))) return "HIGH";
  return "MEDIUM";
}

function isAtRisk(project) {
  return /late|risk|blocked|waiting|conflict/i.test(String(project.status || project.notes || ""));
}

function isComplete(status) {
  return /complete|completed|done|closed/i.test(String(status || ""));
}

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return false;
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

module.exports = {
  jobsBoard
};
