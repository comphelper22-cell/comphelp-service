const { SupabaseClient } = require("../database/client");
const { supabaseConfig } = require("./supabase-config");

function createSupabaseClient(options = {}) {
  const config = supabaseConfig(options.env || process.env);
  return {
    configured: config.configured,
    config,
    client: config.configured ? new SupabaseClient(options) : null
  };
}

module.exports = {
  createSupabaseClient
};
