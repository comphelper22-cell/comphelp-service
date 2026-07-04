const assert = require("assert");
const { betaDashboard } = require("../launch/beta-dashboard");
const { demoMode } = require("../launch/demo-mode");
const { demoData } = require("../launch/demo-data");
const { demoScenarios } = require("../launch/demo-scenarios");
const { betaChecklist } = require("../launch/beta-checklist");
const { feedbackCenter } = require("../launch/feedback-center");
const { featureTour } = require("../launch/feature-tour");
const { releaseReadiness } = require("../launch/release-readiness");
const { customerDemo } = require("../launch/customer-demo");
const { knownLimitations } = require("../launch/known-limitations");
const betaAgent = require("../agents/beta-manager-agent");

function run() {
  const data = demoData();
  const dashboard = betaDashboard({ data });
  const mode = demoMode({ data });
  const scenarios = demoScenarios();
  const checklist = betaChecklist();
  const feedback = feedbackCenter();
  const tour = featureTour();
  const readiness = releaseReadiness();
  const demo = customerDemo({ data });
  const limitations = knownLimitations();
  const agent = betaAgent.run({ data });

  assert.strictEqual(dashboard.ok, true, "Beta dashboard should return ok.");
  assert.strictEqual(mode.data.externalServicesConnected, false, "Demo mode must not connect external services.");
  assert.ok(data.customers.length >= 3, "Demo customers should exist.");
  assert.ok(data.jobs.length >= 3, "Demo jobs should exist.");
  assert.ok(data.estimates.length >= 2, "Demo estimates should exist.");
  assert.ok(data.invoices.length >= 2, "Demo invoices should exist.");
  assert.ok(scenarios.data.scenarios.length >= 4, "Demo scenarios should exist.");
  assert.ok(checklist.data.items.length >= 5, "Beta checklist should exist.");
  assert.ok(feedback.data.fields.length >= 5, "Feedback fields should exist.");
  assert.ok(tour.data.tour.length >= 6, "Feature tour should exist.");
  assert.ok(readiness.data.betaReadinessScore >= 80, "Readiness score should be demo-ready.");
  assert.ok(demo.data.promise.includes("10 minutes"), "Customer demo should explain the 10-minute promise.");
  assert.ok(limitations.data.limitations.length >= 5, "Known limitations should exist.");
  assert.strictEqual(agent.ok, true, "Beta manager agent should return ok.");

  return {
    ok: true,
    readinessScore: readiness.data.betaReadinessScore,
    customers: data.customers.length,
    jobs: data.jobs.length,
    scenarios: scenarios.data.scenarios.length,
    limitations: limitations.data.limitations.length
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
