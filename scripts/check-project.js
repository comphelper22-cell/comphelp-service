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
  "backup-project",
  "smm-agent",
  "seo-agent",
  "estimate-agent",
  "developer-agent",
  "vendor-agent",
  "marketplace-agent"
];
const IGNORE_DIRS = new Set([".git", "node_modules", ".vercel", "logs", "uploads", "outputs", "phase2-crm-clean"]);
const LARGE_FILE_BYTES = 250 * 1024;
const SECURITY_KEYWORDS = ["api_key", "client_secret", "private_key", "secret=", "token=", "password="];
const REQUIRED_ENV_NAMES = [
  "OPENAI_API_KEY",
  "GITHUB_TOKEN",
  "GITHUB_REPO",
  "VERCEL_TOKEN",
  "VERCEL_PROJECT_ID",
  "GOOGLE_SHEETS_WEBHOOK_URL"
];

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
  for (const route of ["/api/marketplace", "/api/admin-test", "/api/system", "/marketplace", "/admin-test"]) {
    if (!routes.includes(route)) errors.push(`vercel.json missing route: ${route}`);
  }
}

function validateApiFunctionCount(warnings) {
  const apiDir = path.join(ROOT, "api");
  const apiFiles = fs.existsSync(apiDir)
    ? fs.readdirSync(apiDir).filter((file) => file.endsWith(".js"))
    : [];
  if (apiFiles.length > 10) {
    warnings.push(`Vercel Hobby warning: /api has ${apiFiles.length} JS functions. Keep at 10 or fewer when possible.`);
  }
  if (apiFiles.length > 12) {
    warnings.push(`Vercel Hobby limit risk: /api has ${apiFiles.length} JS functions. Limit is 12.`);
  }
}

function validateLargeFiles(files, warnings) {
  const large = files
    .map((file) => ({ file, size: fs.statSync(file).size }))
    .filter((item) => item.size > LARGE_FILE_BYTES)
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
  for (const item of large) {
    warnings.push(`Large file warning: ${rel(item.file)} is ${item.size} bytes.`);
  }
}

function validateMissingTests(files, warnings) {
  const jsFiles = files.filter((file) => file.endsWith(".js"));
  const testFiles = files.filter((file) => /(^|\/|\\)tests(\/|\\).+\.test\.js$/.test(file));
  const moduleDirs = new Set(jsFiles
    .map((file) => rel(file).split("/")[0])
    .filter((dir) => !["api", "assets", "scripts", "tests", "server", "database", "agents"].includes(dir)));
  if (!testFiles.length) warnings.push("Missing test warning: no tests/*.test.js files found.");
  for (const dir of moduleDirs) {
    const hasNamedTest = testFiles.some((file) => rel(file).toLowerCase().includes(dir.replace(/-/g, "").toLowerCase()) || rel(file).toLowerCase().includes(dir.toLowerCase()));
    if (!hasNamedTest && ["production", "integrations", "billing", "saas"].includes(dir)) {
      warnings.push(`Missing test warning: ${dir} module should have a focused test.`);
    }
  }
}

function validateMissingDocs(warnings) {
  const requiredDocs = [
    "ARCHITECTURE.md",
    "ROADMAP.md",
    "CHANGELOG.md",
    "docs/SPRINT_PLAN.md",
    "docs/SPRINT_QUALITY_GATES.md",
    "docs/DEPLOYMENT_WORKFLOW.md"
  ];
  for (const doc of requiredDocs) {
    if (!fs.existsSync(path.join(ROOT, doc))) warnings.push(`Missing docs warning: ${doc} is missing.`);
  }
}

function validateSecurityKeywords(files, warnings) {
  const scanFiles = files.filter((file) => /\.(js|json|html|md)$/i.test(file) && !/(\.env|package-lock\.json)$/i.test(path.basename(file)));
  const findings = [];
  for (const file of scanFiles) {
    const text = fs.readFileSync(file, "utf8");
    const lower = text.toLowerCase();
    for (const keyword of SECURITY_KEYWORDS) {
      if (lower.includes(keyword)) findings.push(`${rel(file)} contains ${keyword}`);
    }
  }
  for (const finding of findings.slice(0, 25)) {
    warnings.push(`Security keyword scan: ${finding}. Verify it is placeholder/masked and not a real secret.`);
  }
  if (findings.length > 25) warnings.push(`Security keyword scan: ${findings.length - 25} additional keyword finding(s) omitted.`);
}

function validateEnvironmentWarnings(warnings) {
  const example = path.join(ROOT, ".env.example");
  if (!fs.existsSync(example)) {
    warnings.push("Environment variable warning: .env.example is missing.");
    return;
  }
  const text = fs.readFileSync(example, "utf8");
  for (const name of REQUIRED_ENV_NAMES) {
    if (!text.includes(`${name}=`)) warnings.push(`Environment variable warning: .env.example missing ${name}=`);
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
  validateApiFunctionCount(warnings);
  validateLargeFiles(files, warnings);
  validateMissingTests(files, warnings);
  validateMissingDocs(warnings);
  validateSecurityKeywords(files, warnings);
  validateEnvironmentWarnings(warnings);

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
