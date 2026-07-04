const { technicianMatches } = require("./technician-matcher");

function optimizeSchedule(jobs = [], technicians = []) {
  const openJobs = jobs.filter((job) => !/complete|completed|done|closed/i.test(String(job.status || "")));
  const ordered = openJobs.slice().sort((a, b) => priorityScore(b) - priorityScore(a));
  const matches = technicianMatches(ordered, technicians);
  const schedule = matches.map((match, index) => ({
    ...match,
    recommendedWindow: timeWindow(index),
    action: match.technicianId ? "Confirm availability and assign." : "Manually assign technician.",
    conflict: match.confidence < 0.55
  }));

  return {
    todaySchedule: schedule,
    scheduleConflicts: schedule.filter((item) => item.conflict),
    aiDispatchSuggestions: schedule.slice(0, 8),
    generatedAt: new Date().toISOString()
  };
}

function priorityScore(job) {
  let score = job.priority === "HIGH" ? 100 : job.priority === "MEDIUM" ? 60 : 30;
  if (job.atRisk) score += 25;
  if (/urgent|emergency|same.?day/i.test(String(job.notes || ""))) score += 30;
  if (/unassigned/i.test(String(job.technician || ""))) score += 10;
  return score;
}

function timeWindow(index) {
  const windows = ["8:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "12:00 PM - 2:00 PM", "2:00 PM - 4:00 PM", "4:00 PM - 6:00 PM"];
  return windows[index % windows.length];
}

module.exports = { optimizeSchedule };
