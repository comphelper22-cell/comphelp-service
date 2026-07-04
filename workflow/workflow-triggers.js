const registry = require("./workflow-registry");

function trigger(eventName, payload = {}) {
  const workflows = registry.findByEvent(eventName);
  return {
    ok: workflows.length > 0,
    event: eventName,
    payload,
    workflows,
    triggeredAt: new Date().toISOString()
  };
}

function status() {
  return {
    ok: true,
    status: "ready",
    supportedEvents: registry.events()
  };
}

module.exports = {
  status,
  trigger
};
