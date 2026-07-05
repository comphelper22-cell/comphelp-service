const { LOGIN_FLOW } = require("../identity/identity-service");
const { validateIdentity } = require("../identity/identity-validator");
const { createSession } = require("./session-manager");
const { issuePlaceholderToken } = require("./token-manager");

function login(input = {}) {
  const validation = validateIdentity(input);
  if (!validation.ok) return { ok: false, error: validation.errors.join(",") };
  return {
    ok: true,
    data: {
      authenticated: false,
      architectureOnly: true,
      flow: LOGIN_FLOW,
      validation,
      session: createSession(input).data,
      token: issuePlaceholderToken(input).data,
      dashboardRoute: "/marketplace.html",
      warning: "Real credential checks are disabled until approved auth provider integration."
    }
  };
}

module.exports = {
  login
};
