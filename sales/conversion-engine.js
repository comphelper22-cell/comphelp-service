function conversionMetrics(data = {}, prioritizedDeals = [], followups = {}) {
  const estimates = Array.isArray(data.estimates) ? data.estimates : [];
  const won = estimates.filter((estimate) => /won|approved|accepted/i.test(String(estimate.status || "")));
  const lost = estimates.filter((estimate) => /lost|rejected|cancel/i.test(String(estimate.status || "")));
  const open = estimates.filter((estimate) => !won.includes(estimate) && !lost.includes(estimate));
  const totalWonValue = won.reduce((sum, estimate) => sum + valueOf(estimate), 0);
  const revenuePipeline = prioritizedDeals.reduce((sum, deal) => sum + Number(deal.expectedRevenue || 0), 0);
  return {
    openEstimates: open.length,
    wonEstimates: won.length,
    lostEstimates: lost.length,
    conversionRate: estimates.length ? Math.round((won.length / estimates.length) * 100) : 0,
    averageDealSize: won.length ? Math.round(totalWonValue / won.length) : 0,
    revenuePipeline,
    followupCompletion: followups.followupCompletion || 0,
    averageCloseTime: "not_enough_data"
  };
}

function valueOf(estimate = {}) {
  return Number(estimate.recommendedPrice || estimate.recommended || estimate.total || estimate.projectValue || 0);
}

module.exports = {
  conversionMetrics
};
