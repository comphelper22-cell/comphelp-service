const { demoMode } = require("./demo-mode");
const { demoData } = require("./demo-data");
const { demoScenarios } = require("./demo-scenarios");
const { betaChecklist } = require("./beta-checklist");
const { feedbackCenter } = require("./feedback-center");
const { featureTour } = require("./feature-tour");
const { releaseReadiness } = require("./release-readiness");
const { customerDemo } = require("./customer-demo");
const { knownLimitations } = require("./known-limitations");

function betaDashboard(input = {}) {
  const data = input.data || demoData();
  return {
    ok: true,
    data: {
      welcomeWizard: ["Choose demo company", "Review tour", "Walk through scenarios", "Collect feedback", "Review next steps"],
      demoMode: demoMode({ data }).data,
      demoCompany: data.company,
      demoCustomers: data.customers,
      demoJobs: data.jobs,
      demoEstimates: data.estimates,
      demoInvoices: data.invoices,
      productTour: featureTour().data.tour,
      scenarios: demoScenarios().data.scenarios,
      betaChecklist: betaChecklist().data.items,
      feedbackCenter: feedbackCenter().data,
      readiness: releaseReadiness().data,
      customerDemo: customerDemo({ data }).data,
      knownLimitations: knownLimitations().data.limitations,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { betaDashboard };
