function jwtPlaceholder(payload = {}) {
  return {
    ok: true,
    data: {
      tokenIssued: false,
      tokenType: "placeholder",
      signed: false,
      payloadPreview: {
        userId: payload.userId || "demo-user",
        organizationId: payload.organizationId || "demo-org",
        role: payload.role || "Guest"
      },
      warning: "Real JWT signing is intentionally disabled until approved authentication work."
    }
  };
}

module.exports = {
  jwtPlaceholder
};
