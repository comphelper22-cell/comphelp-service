const { DATA_FILE, supabaseConfigured } = require("../index");

function databaseConfig(env = process.env) {
  const supabaseReady = supabaseConfigured(env);
  return {
    mode: supabaseReady ? "supabase_ready_with_json_fallback" : "json_fallback",
    supabaseConfigured: supabaseReady,
    jsonFallbackEnabled: true,
    dataFile: DATA_FILE,
    requiredEnv: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    missingEnv: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter((key) => !env[key]),
    productionConnectionActive: false
  };
}

module.exports = {
  databaseConfig
};
