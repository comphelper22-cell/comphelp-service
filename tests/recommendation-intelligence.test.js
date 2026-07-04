const assert = require("assert");
const recommendationEngine = require("../brain/recommendation/recommendation-engine");

function run() {
  const result = recommendationEngine.generate({
    service: "Security Camera Installation",
    city: "Los Angeles",
    projectValue: 1200,
    record: false
  });

  assert.strictEqual(result.ok, true, "Recommendation generation should pass.");
  assert.ok(result.data.recommendations.length > 0, "Recommendations should be generated.");
  assert.ok(result.data.topRecommendation, "Top recommendation should exist.");
  assert.ok(result.data.aiPriorityQueue.length > 0, "Priority queue should exist.");
  assert.ok(result.data.topRecommendation.recommendationId, "Recommendation must include an id.");
  assert.ok(Array.isArray(result.data.topRecommendation.reasoning), "Recommendation must include reasoning.");

  return {
    ok: true,
    recommendations: result.data.recommendations.length,
    topRecommendation: result.data.topRecommendation.title,
    priority: result.data.topRecommendation.priority
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
