const recommendationIntelligence = require("./recommendation/recommendation-engine");

function recommendation(input = {}) {
  const topic = input.topic || "platform";
  const result = recommendationIntelligence.generate({ ...input, record: false });
  return {
    ok: result.ok,
    topic,
    recommendations: result.data.recommendations,
    topRecommendation: result.data.topRecommendation,
    generatedBy: "CompHelp Brain Recommendation Engine",
    externalAiConnected: false
  };
}

module.exports = { recommendation };
