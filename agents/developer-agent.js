const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { database, databaseStatus: writeDatabaseStatus, supabaseConfigured } = require("../database");
const { platformStatus: writePlatformStatus } = require("./platform-agent");
const safeStorage = require("../storage/safe-storage");

const ROOT = path.resolve(__dirname, "..");
const LOG_DIR = path.join(ROOT, "logs");
const IGNORE_DIRS = new Set([".git", "node_modules", ".vercel", "logs", "uploads", "outputs", "phase2-crm-clean"]);
const TEXT_EXTENSIONS = new Set([".js", ".html", ".css", ".json", ".md", ".xml", ".sql"]);

function now() {
  return new Date().toISOString();
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function writeReport(name, data) {
  const report = { generatedAt: now(), ...data };
  safeStorage.writeJson(path.join(LOG_DIR, name), report);
  return report;
}

function safeRun(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    timeout: options.timeout || 30000,
    shell: Boolean(options.shell),
    windowsHide: true
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: String(result.stdout || ""),
    stderr: String(result.stderr || "").trim(),
    error: result.error ? result.error.message : ""
  };
}

function walk(dir = ROOT, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    if (entry.name === ".env" || entry.name.startsWith(".env.")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    if (entry.isFile()) files.push(full);
  }
  return files;
}

function gitStatus() {
  const status = safeRun("git", ["status", "--short"]);
  const branch = safeRun("git", ["branch", "--show-current"]);
  const lastCommit = safeRun("git", ["log", "-1", "--pretty=format:%h %s"]);
  const recentCommits = safeRun("git", ["log", "--oneline", "-5"]);
  const changedFiles = status.stdout.split(/\r?\n/).filter(Boolean).map((line) => ({
    status: line.slice(0, 2).trim() || "modified",
    file: line.slice(3).trim()
  }));
  return {
    ok: status.ok,
    branch: branch.stdout.trim() || "unknown",
    lastCommit: lastCommit.stdout.trim() || "",
    recentCommits: recentCommits.stdout.trim() ? recentCommits.stdout.trim().split(/\r?\n/) : [],
    changedFiles,
    clean: changedFiles.length === 0,
    error: status.stderr || status.error || ""
  };
}

function syntaxIssues(files = walk()) {
  return files.filter((file) => file.endsWith(".js")).map((file) => {
    const check = safeRun(process.execPath, ["--check", file]);
    return check.ok ? null : { file: rel(file), error: check.stderr || check.stdout || check.error };
  }).filter(Boolean);
}

function missingImports(files = walk()) {
  const issues = [];
  const jsFiles = files.filter((file) => file.endsWith(".js"));
  const patterns = [
    /require\(["'](\.{1,2}\/[^"']+)["']\)/g,
    /from\s+["'](\.{1,2}\/[^"']+)["']/g
  ];
  for (const file of jsFiles) {
    const source = fs.readFileSync(file, "utf8");
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(source))) {
        const target = path.resolve(path.dirname(file), match[1]);
        const candidates = [target, `${target}.js`, `${target}.json`, path.join(target, "index.js")];
        if (!candidates.some((candidate) => fs.existsSync(candidate))) {
          issues.push({ file: rel(file), importPath: match[1] });
        }
      }
    }
  }
  return issues;
}

function duplicateCode(files = walk()) {
  const seen = new Map();
  const duplicates = [];
  for (const file of files.filter((item) => TEXT_EXTENSIONS.has(path.extname(item)))) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    for (let index = 0; index <= lines.length - 8; index += 1) {
      const block = lines.slice(index, index + 8).join("\n");
      if (block.length < 160) continue;
      const key = block.replace(/\s+/g, " ");
      const first = seen.get(key);
      if (first && first.file !== rel(file)) {
        duplicates.push({ first, duplicate: { file: rel(file), line: index + 1 } });
      } else if (!first) {
        seen.set(key, { file: rel(file), line: index + 1 });
      }
      if (duplicates.length >= 25) return duplicates;
    }
  }
  return duplicates;
}

function unusedFiles(files = walk()) {
  const relativeFiles = files.map(rel);
  const textFiles = files.filter((file) => TEXT_EXTENSIONS.has(path.extname(file)));
  const corpus = textFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  const entryNames = new Set([
    "index.html",
    "marketplace.html",
    "package.json",
    "vercel.json",
    "README.md",
    "README_AUTOMATION.md",
    "sitemap.xml"
  ]);
  return relativeFiles.filter((file) => {
    if (entryNames.has(file)) return false;
    if (file.startsWith("api/") || file.startsWith("agents/") || file.startsWith("scripts/")) return false;
    const base = path.basename(file);
    return TEXT_EXTENSIONS.has(path.extname(file)) && !corpus.includes(file) && !corpus.includes(base);
  }).slice(0, 50);
}

function analyzeProject() {
  const files = walk();
  const git = gitStatus();
  const report = writeReport("developer-report.json", {
    ok: true,
    summary: {
      filesScanned: files.length,
      changedFiles: git.changedFiles.length,
      syntaxIssues: 0,
      missingImports: 0,
      duplicateBlocks: 0,
      possibleUnusedFiles: 0
    },
    git,
    syntaxIssues: syntaxIssues(files),
    missingImports: missingImports(files),
    duplicateCode: duplicateCode(files),
    unusedFiles: unusedFiles(files)
  });
  report.summary.syntaxIssues = report.syntaxIssues.length;
  report.summary.missingImports = report.missingImports.length;
  report.summary.duplicateBlocks = report.duplicateCode.length;
  report.summary.possibleUnusedFiles = report.unusedFiles.length;
  report.ok = report.summary.syntaxIssues === 0 && report.summary.missingImports === 0;
  writeReport("developer-report.json", report);
  return report;
}

function validateProject() {
  const result = process.platform === "win32"
    ? safeRun("cmd.exe", ["/c", "npm.cmd", "run", "check-project"], { timeout: 120000 })
    : safeRun("npm", ["run", "check-project"], { timeout: 120000 });
  let parsed = null;
  try {
    const start = result.stdout.indexOf("{");
    parsed = start >= 0 ? JSON.parse(result.stdout.slice(start)) : null;
  } catch (_) {
    parsed = null;
  }
  return writeReport("validation-report.json", {
    ok: result.ok && (!parsed || parsed.ok !== false),
    command: "npm run check-project",
    result: parsed,
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error,
    exitCode: result.status
  });
}

function deploymentReport() {
  const git = gitStatus();
  const databaseHealth = fs.existsSync(path.join(ROOT, "data", "marketplace.json")) ? "json_ready" : "json_missing";
  const backupReport = path.join(LOG_DIR, "backup-report.json");
  const apiFiles = ["api/marketplace.js", "api/developer.js", "api/business-os.js", "api/platform.js"].map((file) => ({ file, exists: fs.existsSync(path.join(ROOT, file)) }));
  return writeReport("deployment-report.json", {
    ok: git.ok,
    readiness: git.clean ? "ready_for_review" : "pending_changes",
    gitStatus: git,
    buildStatus: "validation_required",
    deploymentStatus: "approval_required",
    databaseHealth,
    backupStatus: fs.existsSync(backupReport) ? "backup_report_found" : "backup_report_missing",
    supabaseStatus: supabaseConfigured() ? "configured" : "json_fallback",
    jsonStatus: databaseHealth,
    apiStatus: apiFiles,
    deploymentReadiness: git.clean ? "ready_after_owner_approval" : "pending_changes_need_review",
    safety: {
      autoPush: false,
      autoDeploy: false,
      ownerApprovalRequired: true,
      secretsExposed: false
    }
  });
}

async function databaseStatus() {
  return writeDatabaseStatus();
}

async function platformStatus() {
  return writePlatformStatus();
}

function fullReport() {
  const developer = analyzeProject();
  const deployment = deploymentReport();
  return { ok: developer.ok && deployment.ok, developer, deployment };
}

async function main() {
  const action = process.argv[2] || "report";
  const output = action === "validate"
    ? validateProject()
    : action === "deployment"
      ? deploymentReport()
      : action === "databaseStatus"
        ? await databaseStatus()
        : action === "platformStatus"
          ? await platformStatus()
        : fullReport();
  console.log(JSON.stringify(output, null, 2));
}

if (require.main === module) main();

module.exports = {
  ROOT,
  analyzeProject,
  validateProject,
  deploymentReport,
  databaseStatus,
  platformStatus,
  fullReport,
  gitStatus
};
