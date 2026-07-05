function supabaseConfig(env = process.env) {
  return {
    configured: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
    urlConfigured: Boolean(env.SUPABASE_URL),
    serviceRoleConfigured: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
    connectionMode: "readiness_only",
    realProductionConnection: false
  };
}

module.exports = {
  supabaseConfig
};
