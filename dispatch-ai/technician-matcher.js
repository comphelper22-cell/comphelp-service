function technicianMatches(jobs = [], technicians = []) {
  return jobs.slice(0, 12).map((job) => {
    const ranked = technicians.slice().sort((a, b) => score(job, b) - score(job, a));
    const best = ranked[0] || null;
    return {
      jobId: job.jobId,
      jobTitle: job.title,
      service: job.service,
      city: job.city,
      technician: best ? best.name : "Manual assignment needed",
      technicianId: best ? best.technicianId : "",
      confidence: best ? Math.min(0.95, 0.55 + score(job, best) / 100) : 0.3,
      reason: best ? `${best.category} match with ${best.workload} workload near ${best.city}.` : "No technician profile is available.",
      alternatives: ranked.slice(1, 4).map((tech) => ({ name: tech.name, score: score(job, tech) }))
    };
  });
}

function score(job, technician) {
  let value = Number(technician.rating || 0) * 10;
  const keyword = serviceKeyword(job.service);
  if (String(technician.category || "").toLowerCase().includes(keyword)) value += 25;
  if (String(technician.serviceArea || "").toLowerCase().includes(String(job.city || "").toLowerCase())) value += 15;
  if (String(technician.city || "").toLowerCase() === String(job.city || "").toLowerCase()) value += 10;
  if (technician.workload === "available") value += 15;
  if (technician.workload === "busy") value -= 15;
  if (job.priority === "HIGH") value += 5;
  return value;
}

function serviceKeyword(service) {
  const value = String(service || "").toLowerCase();
  if (value.includes("camera")) return "camera";
  if (value.includes("wifi") || value.includes("network")) return "wifi";
  if (value.includes("smart")) return "smart";
  if (value.includes("data")) return "data";
  if (value.includes("computer")) return "computer";
  return value.split(" ")[0] || "";
}

module.exports = { technicianMatches };
