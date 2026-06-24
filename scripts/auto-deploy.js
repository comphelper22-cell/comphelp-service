const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const LOG_DIR = path.join(ROOT, "logs");
const REQUIRED_ENV = [
  "GITHUB_TOKEN",
  "GITHUB_REPO",
  "VERCEL_TOKEN",
  "VERCEL_PROJECT_ID"
];

function log(action, payload) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(path.join(LOG_DIR, "automation.jsonl"), `${JSON.stringify({ timestamp: new Date().toISOString(), action, payload })}\n`);
}

function run(label, args, options = {}) {
  const result = spawnSync(process.execPath, args, { cwd: ROOT, encoding: "utf8", env: process.env });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  if (result.status !== 0 && !options.optional) throw new Error(`${label} failed.\n${output}`);
  return { label, ok: result.status === 0, output };
}

function missingEnv() {
  return REQUIRED_ENV.filter((name) => !String(process.env[name] || "").trim());
}

function parseStepJson(step) {
  try {
    return JSON.parse(step.output);
  } catch (_) {
    return null;
  }
}

function main() {
  const steps = [];
  process.env.AUTO_DEPLOY = process.env.AUTO_DEPLOY || "true";

  steps.push(run("check-project", [path.join(ROOT, "scripts", "check-project.js")]));

  if (process.env.AUTO_DEPLOY === "false") {
    const summary = { ok: true, deployed: false, message: "AUTO_DEPLOY is not true. Validation completed only.", steps };
    log("auto_deploy_skipped", summary);
    console.log(JSON.stringify(summary, null, 2));
    return summary;
  }

  const missing = missingEnv();
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }

  steps.push(run("github-push", [path.join(ROOT, "scripts", "github-push.js")]));
  steps.push(run("vercel-deploy", [path.join(ROOT, "scripts", "vercel-deploy.js")]));

  const deployment = parseStepJson(steps[steps.length - 1]);
  const summary = {
    ok: true,
    deployed: true,
    deploymentUrl: deployment?.liveUrl || "https://comphelp-service.vercel.app",
    branch: process.env.GITHUB_BRANCH || "main",
    repo: process.env.GITHUB_REPO,
    steps
  };
  log("auto_deploy", summary);
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    const summary = { ok: false, error: error.message };
    log("auto_deploy_failed", summary);
    console.error(JSON.stringify(summary, null, 2));
    process.exitCode = 1;
  }
}

module.exports = { main };
