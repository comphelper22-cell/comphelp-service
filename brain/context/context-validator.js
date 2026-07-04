function scoreContext(sections = {}, supporting = {}) {
  const providerScores = Object.fromEntries(Object.entries(sections).map(([key, value]) => [key, value.score || 0]));
  const memoryScore = supporting.memory && supporting.memory.ok ? 97 : 60;
  const knowledgeScore = supporting.knowledge && supporting.knowledge.ok ? 89 : 60;
  const scores = { ...providerScores, memory: memoryScore, knowledge: knowledgeScore };
  const values = Object.values(scores);
  const overall = Math.round(values.reduce((sum, score) => sum + score, 0) / Math.max(1, values.length));
  const missing = Object.values(sections).flatMap((section) => section.missing || []);
  if (!supporting.preferences || supporting.preferences.status === "not_attached") missing.push("preferences");
  if (!supporting.permissions || supporting.permissions.status === "not_attached") missing.push("permissions");
  return { overall, scores, missing };
}

function validateContext(contextPackage = {}) {
  const missing = contextPackage.missing || [];
  return {
    ok: missing.length === 0,
    status: missing.length ? "missing_context" : "complete",
    missing,
    score: contextPackage.score || 0
  };
}

module.exports = { scoreContext, validateContext };
