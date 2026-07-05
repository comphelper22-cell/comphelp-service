function userSettings(input = {}) {
  return {
    ok: true,
    data: {
      userId: input.userId || "demo-user",
      theme: input.theme || "system",
      notifications: input.notifications !== false,
      timezone: input.timezone || "America/Los_Angeles"
    }
  };
}

module.exports = {
  userSettings
};
