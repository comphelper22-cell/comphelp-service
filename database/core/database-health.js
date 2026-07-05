const fs = require("fs");
const path = require("path");
const { databaseConfig } = require("./database-config");

const ROOT = path.resolve(__dirname, "..", "..");
const REQUIRED_DIRS = ["database/schema", "database/repositories", "database/sql", "supabase"];

function databaseHealth() {
  const config = databaseConfig();
  const directoryStatus = REQUIRED_DIRS.map((dir) => ({
    dir,
    exists: fs.existsSync(path.join(ROOT, dir))
  }));
  return {
    status: directoryStatus.every((item) => item.exists) ? "ready" : "needs_attention",
    mode: config.mode,
    supabaseConfigured: config.supabaseConfigured,
    jsonFallbackEnabled: config.jsonFallbackEnabled,
    productionConnectionActive: false,
    directories: directoryStatus,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  databaseHealth
};
