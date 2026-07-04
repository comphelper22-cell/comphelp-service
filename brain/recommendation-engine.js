const { createDecision } = require("./decision-engine");

function recommendation(input = {}) {
  const topic = input.topic || "platform";
  const recommendations = [
    createDecision({
      confidence: 0.86,
      priority: "high",
      risk: "low",
      reason: "The Brain Kernel needs stable local interfaces before AI provider integration.",
      recommendedAction: "Keep Brain Beta 1 architecture-only and validate with npm run check-project."
    }),
    createDecision({
      confidence: 0.8,
      priority: "medium",
      risk: "medium",
      reason: "Future memory features need clear privacy and approval rules.",
      recommendedAction: "Define Brain memory write policy in Beta 2 before persisting learned facts."
    })
  ];
  return {
    ok: true,
    topic,
    recommendations,
    generatedBy: "CompHelp Brain Recommendation Engine",
    externalAiConnected: false
  };
}

module.exports = { recommendation };
