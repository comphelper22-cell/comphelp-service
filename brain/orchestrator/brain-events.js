const events = [];

function createEvent(type, message, metadata = {}) {
  const event = {
    id: `brain_evt_${Date.now()}_${events.length + 1}`,
    type: String(type || "info"),
    message: String(message || "Brain event recorded."),
    metadata,
    timestamp: new Date().toISOString()
  };
  events.unshift(event);
  if (events.length > 100) events.pop();
  return event;
}

function listEvents(limit = 20) {
  return events.slice(0, Number(limit) || 20);
}

function status() {
  return {
    status: "ready",
    retainedEvents: events.length,
    maxEvents: 100
  };
}

module.exports = {
  createEvent,
  listEvents,
  status
};
