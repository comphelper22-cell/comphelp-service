const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const LOG_DIR = path.join(ROOT, "logs");
const REQUIRED_SCRIPTS = [
  "check-project",
  "auto-deploy",
  "github-push",
  "vercel-deploy",
  "smm-agent",
  "seo-agent",
  "estimate-agent",
  "developer-agent",
  "vendor-agent",
  "marketplace-agent"
];
const IGNORE_DIRS = new Set([".git", "node_modules", ".vercel", "logs", "uploads", "outputs", "phase2-crm-clean"]);

function log(action, payload) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(path.join(LOG_DIR, "automation.jsonl"), `${JSON.stringify({ timestamp: new Date().toISOString(), action, payload })}\n`);
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    if (entry.isFile()) files.push(full);
  }
  return files;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function parseJson(file) {
  JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function checkJs(file) {
  const result = spawnSync(process.execPath, ["--check", file], { cwd: ROOT, encoding: "utf8" });
  return {
    ok: result.status === 0,
    stderr: result.stderr,
    stdout: result.stdout
  };
}

function validatePackageJson(errors) {
  const file = path.join(ROOT, "package.json");
  if (!fs.existsSync(file)) {
    errors.push("package.json is missing.");
    return;
  }
  const pkg = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  for (const script of REQUIRED_SCRIPTS) {
    if (!pkg.scripts || !pkg.scripts[script]) errors.push(`package.json missing script: ${script}`);
  }
}

function validateVercel(errors) {
  const file = path.join(ROOT, "vercel.json");
  if (!fs.existsSync(file)) {
    errors.push("vercel.json is missing.");
    return;
  }
  const vercel = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  const routes = JSON.stringify(vercel.rewrites || []);
  for (const route of ["/api/marketplace", "/api/admin-test", "/api/developer", "/marketplace", "/admin-test"]) {
    if (!routes.includes(route)) errors.push(`vercel.json missing route: ${route}`);
  }
}

function main() {
  const errors = [];
  const warnings = [];
  const files = walk(ROOT);
  const jsFiles = files.filter((file) => file.endsWith(".js"));
  const jsonFiles = files.filter((file) => file.endsWith(".json"));

  for (const file of jsonFiles) {
    try {
      parseJson(file);
    } catch (error) {
      errors.push(`Invalid JSON: ${rel(file)} - ${error.message}`);
    }
  }

  for (const file of jsFiles) {
    const result = checkJs(file);
    if (!result.ok) errors.push(`JS syntax failed: ${rel(file)}\n${result.stderr || result.stdout}`);
  }

  validatePackageJson(errors);
  validateVercel(errors);

  if (!fs.existsSync(path.join(ROOT, "api", "marketplace.js"))) errors.push("api/marketplace.js is missing.");
  if (!fs.existsSync(path.join(ROOT, "api", "marketplace-project-upload.js"))) errors.push("api/marketplace-project-upload.js is missing.");

  const summary = {
    ok: errors.length === 0,
    checked: {
      jsFiles: jsFiles.length,
      jsonFiles: jsonFiles.length
    },
    errors,
    warnings
  };

  log("check_project", summary);
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.ok) process.exitCode = 1;
}

if (require.main === module) main();

module.exports = {
  main,
  walk,
  ROOT
};
