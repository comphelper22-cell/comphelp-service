const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LOG_DIR = path.join(ROOT, "logs");
const REQUIRED = [
  "GITHUB_TOKEN",
  "GITHUB_REPO",
  "VERCEL_TOKEN",
  "VERCEL_PROJECT_ID"
];
const OPTIONAL = [
  "GITHUB_BRANCH",
  "VERCEL_TEAM_ID",
  "AUTO_DEPLOY",
  "AUTO_POST",
  "APPROVAL_REQUIRED"
];

function log(action, payload) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(path.join(LOG_DIR, "automation.jsonl"), `${JSON.stringify({ timestamp: new Date().toISOString(), action, payload })}\n`);
}

function configured(name) {
  return Boolean(String(process.env[name] || "").trim());
}

function main() {
  const missing = REQUIRED.filter((name) => !configured(name));
  const summary = {
    ok: missing.length === 0,
    required: Object.fromEntries(REQUIRED.map((name) => [name, configured(name)])),
    optional: Object.fromEntries(OPTIONAL.map((name) => [name, configured(name)])),
    missing,
    defaults: {
      GITHUB_REPO: process.env.GITHUB_REPO || "comphelper22-cell/comphelp-service",
      GITHUB_BRANCH: process.env.GITHUB_BRANCH || "main",
      AUTO_DEPLOY: process.env.AUTO_DEPLOY || "true",
      AUTO_POST: process.env.AUTO_POST || "false",
      APPROVAL_REQUIRED: process.env.APPROVAL_REQUIRED || "true"
    }
  };
  log("setup_env_check", summary);
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.ok) process.exitCode = 1;
  return summary;
}

if (require.main === module) main();

module.exports = {
  main,
  REQUIRED
};
