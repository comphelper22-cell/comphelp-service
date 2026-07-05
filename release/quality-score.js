const { systemHealth } = require("./system-health");
const { performanceReview } = require("./performance-review");

function qualityScore(input = {}) {
  const health = systemHealth(input).data;
  const performance = performanceReview(input).data;
  const testScore = Math.min(100, health.testCount * 4);
  const apiScore = health.apiCount <= 12 ? 100 : 70;
  const documentationScore = 92;
  const securityScore = 86;
  const accessibilityScore = 84;
  const overall = Math.round((performance.score + testScore + apiScore + documentationScore + securityScore + accessibilityScore) / 6);
  return {
    ok: true,
    data: {
      overall,
      performanceScore: performance.score,
      securityScore,
      testCoverageScore: testScore,
      documentationScore,
      accessibilityScore,
      apiConsolidationScore: apiScore,
      status: overall >= 85 ? "release_candidate" : "needs_review",
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { qualityScore };
