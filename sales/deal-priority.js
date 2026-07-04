function prioritizeDeals(scoredEstimates = [], customerIntel = {}) {
  const deals = scoredEstimates.map((estimate) => {
    const vipBoost = customerIntel.vipCustomers && customerIntel.vipCustomers.some((customer) => customer.name && customer.name === estimate.customerName) ? 10 : 0;
    const finalScore = Math.min(100, Number(estimate.priorityScore || 0) + vipBoost);
    return {
      ...estimate,
      finalScore,
      priority: finalScore >= 80 ? "HIGH" : finalScore >= 55 ? "MEDIUM" : "LOW",
      recommendedAction: actionFor(estimate, finalScore)
    };
  });
  return deals.sort((a, b) => b.finalScore - a.finalScore);
}

function actionFor(estimate, score) {
  if (/won|approved|accepted/i.test(String(estimate.status || ""))) return "Schedule project and confirm next steps.";
  if (/lost|rejected|cancel/i.test(String(estimate.status || ""))) return "Create a lost deal recovery draft if appropriate.";
  if (score >= 80) return "Call this customer today and ask one clear booking question.";
  if (estimate.ageDays > 2) return "Send a polite estimate follow-up draft.";
  return "Keep warm and follow up at the best available time.";
}

module.exports = {
  prioritizeDeals
};
