const assert = require("assert");
const releaseManager = require("../release/release-manager");
const { releaseReport } = require("../release/release-report");
const { releaseValidator } = require("../release/release-validator");
const { systemHealth } = require("../release/system-health");
const { versionManager } = require("../release/version-manager");
const { qualityScore } = require("../release/quality-score");
const { performanceReview } = require("../release/performance-review");

function run() {
  const status = releaseManager.status();
  const health = systemHealth();
  const version = versionManager();
  const quality = qualityScore();
  const performance = performanceReview();
  const validation = releaseValidator();
  const report = releaseReport();

  assert.strictEqual(status.ok, true, "Release manager status should return ok.");
  assert.strictEqual(health.ok, true, "System health should return ok.");
  assert.strictEqual(version.ok, true, "Version manager should return ok.");
  assert.strictEqual(quality.ok, true, "Quality score should return ok.");
  assert.strictEqual(performance.ok, true, "Performance review should return ok.");
  assert.strictEqual(validation.ok, true, "Release validator should return ok.");
  assert.strictEqual(report.ok, true, "Release report should return ok.");
  assert.ok(quality.data.overall >= 70, "Overall quality score should be release-candidate viable.");
  assert.ok(report.data.readinessScore >= 70, "Readiness score should be release-candidate viable.");
  assert.ok(report.data.version.candidateVersion.includes("rc"), "Candidate version should be release-candidate labeled.");
  assert.strictEqual(report.data.uiReview.status, "consistent", "Navigation should be consistent.");

  return {
    ok: true,
    candidateVersion: report.data.version.candidateVersion,
    overallProductScore: report.data.overallProductScore,
    readinessScore: report.data.readinessScore,
    navigationStatus: report.data.uiReview.status,
    docsStatus: report.data.documentationReview.status
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
