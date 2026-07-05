const { SESSION_MODEL } = require("../identity/identity-service");

function sessionStatus() {
  return {
    ok: true,
    data: {
      status: "architecture_ready",
      activeSessionStore: false,
      model: SESSION_MODEL,
      expirationMinutes: 60,
      rememberMeDays: 30,
      ipAndLocationArePlaceholders: true,
      generatedAt: new Date().toISOString()
    }
  };
}

function createSession(input = {}) {
  return {
    ok: true,
    data: {
      ...SESSION_MODEL,
      sessionId: input.sessionId || `session_${Date.now()}`,
      device: input.device || SESSION_MODEL.device,
      browser: input.browser || SESSION_MODEL.browser,
      rememberMe: Boolean(input.rememberMe),
      lastActivity: new Date().toISOString(),
      expiration: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    }
  };
}

module.exports = {
  createSession,
  sessionStatus
};
