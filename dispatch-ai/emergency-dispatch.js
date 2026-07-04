function emergencyDispatch(jobs = [], technicians = []) {
  const emergencyJobs = jobs.filter((job) => job.priority === "HIGH" || /urgent|emergency|same.?day/i.test(String(job.notes || "")));
  const available = technicians.filter((tech) => tech.workload !== "busy");
  return {
    emergencyJobs: emergencyJobs.map((job, index) => ({
      jobId: job.jobId,
      title: job.title,
      customerName: job.customerName,
      city: job.city,
      service: job.service,
      suggestedTechnician: (available[index % Math.max(1, available.length)] || technicians[0] || {}).name || "Manual assignment needed",
      recommendedAction: "Call customer, confirm urgency, then assign manually.",
      priority: "HIGH"
    })),
    emergencyAvailable: available.length > 0,
    generatedAt: new Date().toISOString()
  };
}

module.exports = { emergencyDispatch };
