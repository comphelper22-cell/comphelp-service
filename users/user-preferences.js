function userPreferences(input = {}) {
  return {
    ok: true,
    data: {
      userId: input.userId || "demo-user",
      dashboardView: input.dashboardView || "founder",
      compactMode: Boolean(input.compactMode),
      aiSuggestions: input.aiSuggestions !== false
    }
  };
}

module.exports = {
  userPreferences
};
