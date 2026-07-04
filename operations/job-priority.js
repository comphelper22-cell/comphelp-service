function jobPriorityQueue(jobs = []) {
  return jobs.slice().map((job) => {
    const urgency = job.priority === "HIGH" ? 40 : 15;
    const risk = job.atRisk ? 35 : 0;
    const unassigned = /unassigned/i.test(String(job.technician || "")) ? 15 : 0;
    const score = Math.min(100, urgency + risk + unassigned + 20);
    return {
      ...job,
      priorityScore: score,
      priority: score >= 75 ? "HIGH" : score >= 45 ? "MEDIUM" : "LOW",
      recommendedAction: actionFor(job, score)
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}

function actionFor(job, score) {
  if (job.atRisk) return "Review job risk and contact customer if approved.";
  if (/unassigned/i.test(String(job.technician || ""))) return "Assign best available technician.";
  if (score >= 75) return "Confirm schedule and materials today.";
  return "Keep job on today's dispatch board.";
}

module.exports = {
  jobPriorityQueue
};
