"use strict";

// Development-only process state. Production stays fail-closed until a durable,
// authenticated shared emergency-control provider is connected.
const state = {
  active: false,
  actorId: "",
  reason: "",
  activatedAt: ""
};

function productionFailClosed() {
  return process.env.NODE_ENV === "production";
}

function activate(input = {}) {
  if (!input.actorId || typeof input.actorId !== "string" || !input.actorId.trim() || !input.reason || typeof input.reason !== "string" || !input.reason.trim()) {
    return { ok: false, error: "actor_and_reason_required", data: status() };
  }
  state.active = true;
  state.actorId = input.actorId.trim();
  state.reason = input.reason.trim();
  state.activatedAt = new Date().toISOString();
  return { ok: true, data: status() };
}

function isActive() {
  return productionFailClosed() || state.active === true;
}

function status() {
  return {
    active: isActive(),
    actorId: state.actorId,
    reason: productionFailClosed() ? "Production workflow execution is fail-closed until a durable shared emergency control is connected." : state.reason,
    activatedAt: state.activatedAt,
    scope: "process_local",
    productionFailClosed: productionFailClosed(),
    durableSharedControlConnected: false
  };
}

function resetForTests() {
  if (process.env.NODE_ENV === "production") throw new Error("Emergency-stop test reset is unavailable in production.");
  state.active = false;
  state.actorId = "";
  state.reason = "";
  state.activatedAt = "";
}

module.exports = { activate, isActive, resetForTests, status };
