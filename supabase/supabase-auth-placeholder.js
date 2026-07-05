function authReadiness() {
  return {
    ok: true,
    data: {
      authConnected: false,
      strategy: "Supabase Auth placeholder only",
      nextSteps: ["Design tenant-aware signup", "Map roles to permissions", "Add session validation middleware"]
    }
  };
}

module.exports = {
  authReadiness
};
