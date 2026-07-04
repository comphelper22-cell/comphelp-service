const events = [];

function emit(type, message, metadata = {}) {
  const event = {
    id: `workflow_evt_${Date.now()}_${events.length + 1}`,
    type,
    message,
    metadata,
    timestamp: new Date().toISOString()
  };
  events.unshift(event);
  if (events.length > 100) events.pop();
  return event;
}

function list(limit = 20) {
  return events.slice(0, Number(limit) || 20);
}

function status() {
  return {
    ok: true,
    status: "ready",
    retainedEvents: events.length
  };
}

module.exports = {
  emit,
  list,
  status
};
