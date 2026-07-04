function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, Number(value || 0)));
}

function scoreDecision(input = {}) {
  const contextScore = Number(input.contextScore || 78);
  const policyBoost = Number(input.policyBoost || 0);
  const riskPenalty = String(input.risk || "LOW").toUpperCase() === "HIGH" ? 18 : String(input.risk || "LOW").toUpperCase() === "MEDIUM" ? 8 : 0;
  const raw = Math.max(0, Math.min(100, contextScore + policyBoost - riskPenalty));
  return {
    score: raw,
    confidence: clamp(raw / 100),
    grade: raw >= 90 ? "A" : raw >= 80 ? "B" : raw >= 70 ? "C" : "REVIEW"
  };
}

module.exports = { scoreDecision };
