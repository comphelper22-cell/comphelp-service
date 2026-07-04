function scoreEstimates(data = {}) {
  const estimates = Array.isArray(data.estimates) ? data.estimates : [];
  return estimates.map(scoreEstimate).sort((a, b) => b.priorityScore - a.priorityScore);
}

function scoreEstimate(estimate = {}) {
  const value = Number(estimate.recommendedPrice || estimate.recommended || estimate.total || estimate.projectValue || 0);
  const ageDays = daysOld(estimate.createdAt || estimate.timestamp || estimate.date);
  const status = String(estimate.status || "open").toLowerCase();
  const probability = estimateProbability(estimate, value, ageDays);
  const priorityScore = Math.round((probability * 55) + Math.min(35, value / 50) + (ageDays > 2 ? 10 : 0));
  return {
    ...estimate,
    estimateId: estimate.id || estimate.estimateId || `estimate_${Math.abs(JSON.stringify(estimate).length)}`,
    customerName: estimate.customerName || estimate.name || "Estimate Customer",
    value,
    ageDays,
    status,
    probability,
    priorityScore,
    priority: priorityScore >= 80 ? "HIGH" : priorityScore >= 55 ? "MEDIUM" : "LOW",
    expectedRevenue: Math.round(value * probability)
  };
}

function estimateProbability(estimate, value, ageDays) {
  const status = String(estimate.status || "").toLowerCase();
  if (/won|approved|accepted/.test(status)) return 0.95;
  if (/lost|rejected|cancel/.test(status)) return 0.05;
  let probability = 0.48;
  if (value >= 1000) probability += 0.12;
  if (/security camera|wifi|network/i.test(String(estimate.service || ""))) probability += 0.08;
  if (ageDays <= 1) probability += 0.1;
  if (ageDays > 7) probability -= 0.15;
  return Number(Math.max(0.05, Math.min(0.95, probability)).toFixed(2));
}

function daysOld(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return 0;
  return Math.max(0, Math.floor((Date.now() - time) / 86400000));
}

module.exports = {
  scoreEstimate,
  scoreEstimates
};
