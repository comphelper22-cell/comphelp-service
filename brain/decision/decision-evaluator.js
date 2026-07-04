const contextEngine = require("../context/context-engine");
const memory = require("../memory");
const { buildDecision } = require("./decision-builder");
const { validateDecision } = require("./decision-validator");
const { recordDecision } = require("./decision-history");

function evaluate(input = {}) {
  const context = contextEngine.build(input.context || input);
  const memoryStats = memory.stats().data;
  const decision = buildDecision({
    ...input,
    contextScore: context.score,
    usedContext: Object.keys(context).filter((key) => ["customer", "organization", "currentUser", "currentSession", "currentJob", "memory", "knowledge", "recommendations", "preferences", "permissions"].includes(key)),
    usedMemory: memoryStats.map((item) => item.scope)
  });
  const validation = validateDecision(decision);
  if (input.record !== false) recordDecision(decision);
  return { ok: validation.ok, data: { decision, validation, contextScore: context.score } };
}

module.exports = { evaluate };
