function userActivity(input = {}) {
  return {
    ok: true,
    data: {
      userId: input.userId || "demo-user",
      lastActivity: new Date().toISOString(),
      recentEvents: input.recentEvents || [],
      auditReady: true
    }
  };
}

module.exports = {
  userActivity
};
