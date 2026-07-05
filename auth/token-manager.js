const { jwtPlaceholder } = require("./jwt-placeholder");

function tokenStatus() {
  return {
    ok: true,
    data: {
      status: "placeholder_only",
      realTokensIssued: false,
      refreshTokensStored: false,
      signingSecretConfigured: false,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  issuePlaceholderToken: jwtPlaceholder,
  tokenStatus
};
