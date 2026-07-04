function dispatchSuggestions(jobs = [], technicians = []) {
  const available = technicians.filter((tech) => tech.workload !== "busy");
  return jobs.slice(0, 10).map((job) => {
    const best = findBestTechnician(job, available.length ? available : technicians);
    return {
      jobId: job.jobId,
      jobTitle: job.title,
      customerName: job.customerName,
      service: job.service,
      suggestedTechnician: best ? best.name : "Manual assignment needed",
      reason: best ? `${best.category} match near ${best.city || job.city}.` : "No technician/vendor profile is available yet.",
      confidence: best ? Math.min(0.9, 0.55 + Number(best.rating || 0) / 20) : 0.35,
      recommendedAction: best ? "Owner/dispatcher should confirm availability before assigning." : "Add technician/vendor profiles."
    };
  });
}

function findBestTechnician(job, technicians) {
  return technicians.slice().sort((a, b) => score(job, b) - score(job, a))[0] || null;
}

function score(job, technician) {
  let value = Number(technician.rating || 0) * 10;
  if (String(technician.category || "").toLowerCase().includes(serviceKeyword(job.service))) value += 20;
  if (String(technician.serviceArea || "").toLowerCase().includes(String(job.city || "").toLowerCase())) value += 10;
  if (technician.workload === "available") value += 10;
  return value;
}

function serviceKeyword(service) {
  const value = String(service || "").toLowerCase();
  if (value.includes("camera")) return "camera";
  if (value.includes("wifi") || value.includes("network")) return "wifi";
  if (value.includes("data")) return "data";
  if (value.includes("computer")) return "computer";
  return value.split(" ")[0] || "";
}

module.exports = {
  dispatchSuggestions
};
