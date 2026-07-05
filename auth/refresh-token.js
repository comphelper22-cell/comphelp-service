function refreshToken(input = {}) {
  return {
    ok: true,
    data: {
      refreshed: false,
      refreshTokenStored: false,
      sessionId: input.sessionId || "placeholder-session-id",
      message: "Refresh-token architecture placeholder only."
    }
  };
}

module.exports = {
  refreshToken
};
