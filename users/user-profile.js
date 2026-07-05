function userProfile(input = {}) {
  return {
    ok: true,
    data: {
      userId: input.userId || "demo-user",
      name: input.name || "Demo User",
      email: input.email ? "provided" : "not_provided",
      role: input.role || "Guest",
      organizationId: input.organizationId || "demo-org",
      profileStorage: "json_fallback_ready"
    }
  };
}

module.exports = {
  userProfile
};
