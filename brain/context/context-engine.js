const { buildContext } = require("./context-builder");
const { validateContext } = require("./context-validator");
const contextRegistry = require("./context-registry");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Context Intelligence Engine",
    registry: contextRegistry.status(),
    externalAiConnected: false,
    externalApisConnected: false
  };
}

function build(input = {}) {
  return buildContext(input);
}

function validate(input = {}) {
  return validateContext(build(input));
}

function score(input = {}) {
  const context = build(input);
  return {
    ok: true,
    overallContextScore: `${context.score}%`,
    scores: context.scores,
    missing: context.missing
  };
}

function inspect(input = {}) {
  return {
    ok: true,
    context: build(input),
    validation: validate(input),
    score: score(input)
  };
}

module.exports = {
  build,
  inspect,
  registry: contextRegistry.status,
  score,
  status,
  validate
};
