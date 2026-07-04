const { demoData } = require("./demo-data");
const { featureTour } = require("./feature-tour");
const { demoScenarios } = require("./demo-scenarios");
const { releaseReadiness } = require("./release-readiness");

function customerDemo(input = {}) {
  const data = input.data || demoData();
  return {
    ok: true,
    data: {
      title: "CompHelp AI Beta Demo",
      promise: "Understand the platform in less than 10 minutes.",
      demoCompany: data.company,
      tour: featureTour().data.tour,
      scenarios: demoScenarios().data.scenarios,
      readiness: releaseReadiness().data,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { customerDemo };
