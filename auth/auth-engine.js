const { login } = require("./login");
const { logout } = require("./logout");
const { register } = require("./register");
const { refreshToken } = require("./refresh-token");
const { passwordReset } = require("./password-reset");
const { sessionStatus } = require("./session-manager");
const { tokenStatus } = require("./token-manager");

function status() {
  return {
    ok: true,
    data: {
      status: "architecture_ready",
      engine: "Authentication Platform",
      realAuthConnected: false,
      oauthConnected: false,
      passwordsStored: false,
      demoModePreserved: true,
      modules: ["login", "logout", "register", "refreshToken", "passwordReset", "sessionManager", "tokenManager", "jwtPlaceholder"],
      session: sessionStatus().data,
      token: tokenStatus().data,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  login,
  logout,
  passwordReset,
  refreshToken,
  register,
  sessionStatus,
  status,
  tokenStatus
};
