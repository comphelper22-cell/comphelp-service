function clean(value, fallback = "") {
  return String(value || fallback).trim();
}

function createContext(input = {}) {
  return {
    currentUser: input.currentUser || null,
    currentOrganization: input.currentOrganization || null,
    currentCustomer: input.currentCustomer || null,
    currentProject: input.currentProject || null,
    currentTask: input.currentTask || null,
    currentAgent: input.currentAgent || "CompHelp Brain",
    currentSession: input.currentSession || null,
    scope: clean(input.scope, "internal"),
    timestamp: new Date().toISOString()
  };
}

function contextStatus(input = {}) {
  const context = createContext(input);
  return {
    ok: true,
    status: "ready",
    populated: Object.entries(context).filter(([, value]) => Boolean(value)).map(([key]) => key),
    missing: ["currentUser", "currentOrganization", "currentCustomer", "currentProject", "currentTask", "currentSession"].filter((key) => !context[key]),
    context
  };
}

module.exports = { createContext, contextStatus };
