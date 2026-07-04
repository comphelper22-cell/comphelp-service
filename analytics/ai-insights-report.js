const { kpis } = require("./kpi-summary");
const { scorecard } = require("./business-scorecard");

function insights(input = {}) {
  const summary = kpis(input).data;
  const score = scorecard(input).data;
  const items = [
    {
      title: "Protect revenue pipeline",
      category: "Sales",
      priority: summary.conversionRate < 40 ? "HIGH" : "MEDIUM",
      insight: "Open estimates and lead follow-ups should stay visible until won or lost.",
      recommendedAction: "Review the highest value open estimates today."
    },
    {
      title: "Improve local visibility",
      category: "Marketing",
      priority: summary.marketingLeads < 5 ? "HIGH" : "MEDIUM",
      insight: "Marketing-sourced lead volume is the strongest signal for local growth.",
      recommendedAction: "Publish one local service post and request one new review."
    },
    {
      title: "Balance operations capacity",
      category: "Operations",
      priority: summary.openJobs > summary.completedJobs ? "MEDIUM" : "LOW",
      insight: "Open jobs should be watched against completed jobs to avoid missed follow-ups.",
      recommendedAction: "Review urgent and at-risk jobs before accepting new commitments."
    },
    {
      title: "Strengthen business health",
      category: "Management",
      priority: score.overall < 65 ? "HIGH" : "LOW",
      insight: `Business score is ${score.overall}/100.`,
      recommendedAction: "Focus on the weakest scorecard category this week."
    }
  ];

  return {
    ok: true,
    data: {
      insights: items,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { insights };
