const assert = require("assert");
const analyticsEngine = require("../analytics/analytics-engine");

function run() {
  const input = { data: sampleData() };
  const dashboard = analyticsEngine.dashboard(input);
  const kpis = analyticsEngine.kpis(input);
  const trends = analyticsEngine.trends(input);
  const reports = analyticsEngine.reports(input);
  const scorecard = analyticsEngine.scorecard(input);
  const exported = analyticsEngine.export(input);
  const insights = analyticsEngine.insights(input);

  assert.strictEqual(dashboard.ok, true, "Analytics dashboard should return ok.");
  assert.ok(dashboard.data.businessScorecard, "Business scorecard should exist.");
  assert.ok(dashboard.data.kpis, "Dashboard KPIs should exist.");
  assert.ok(Array.isArray(dashboard.data.aiInsightsReport), "AI insights report should exist.");
  assert.strictEqual(kpis.ok, true, "KPIs should return ok.");
  assert.strictEqual(trends.ok, true, "Trends should return ok.");
  assert.strictEqual(reports.ok, true, "Reports should return ok.");
  assert.strictEqual(scorecard.ok, true, "Scorecard should return ok.");
  assert.strictEqual(exported.ok, true, "Export should return ok.");
  assert.strictEqual(insights.ok, true, "Insights should return ok.");

  return {
    ok: true,
    businessScore: dashboard.data.businessScorecard.overall,
    revenue: kpis.data.revenue,
    conversionRate: kpis.data.conversionRate,
    insights: insights.data.insights.length
  };
}

function sampleData() {
  const now = new Date().toISOString();
  return {
    leads: [
      { name: "Camera Lead", source: "website", createdAt: now },
      { name: "Social Lead", source: "instagram", createdAt: now }
    ],
    estimates: [
      { customerName: "Camera Lead", status: "won", recommendedPrice: 1200, createdAt: now },
      { customerName: "Network Lead", status: "open", recommendedPrice: 700, createdAt: now }
    ],
    projects: [
      { customerName: "Camera Lead", status: "completed", value: 1200, date: now },
      { customerName: "Repair Customer", status: "scheduled", value: 350, date: now }
    ],
    customers: [
      { name: "Camera Lead", status: "vip" },
      { name: "Repair Customer", status: "active" }
    ],
    vendors: [
      { name: "Camera Partner", status: "active", rating: 4.8 }
    ],
    invoices: [
      { customerName: "Camera Lead", status: "paid", amount: 1200 }
    ]
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
