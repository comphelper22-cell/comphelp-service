const assert = require("assert");
const { supabaseConfig } = require("../supabase/supabase-config");
const { createSupabaseClient } = require("../supabase/supabase-client");
const { authReadiness } = require("../supabase/supabase-auth-placeholder");
const { storageReadiness } = require("../supabase/supabase-storage-placeholder");
const { policies } = require("../supabase/supabase-rls-policies");

const emptyConfig = supabaseConfig({});
assert.strictEqual(emptyConfig.configured, false);
assert.strictEqual(emptyConfig.realProductionConnection, false);

const readyConfig = supabaseConfig({
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "placeholder"
});
assert.strictEqual(readyConfig.configured, true);
assert.strictEqual(readyConfig.connectionMode, "readiness_only");

const client = createSupabaseClient({});
assert.strictEqual(client.config.realProductionConnection, false);

assert.strictEqual(authReadiness().ok, true);
assert.strictEqual(storageReadiness().ok, true);
assert.ok(policies.length >= 3);

console.log(JSON.stringify({
  ok: true,
  supabaseReady: readyConfig.configured,
  productionConnectionActive: false,
  rlsExamples: policies.length
}, null, 2));
