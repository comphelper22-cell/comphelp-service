const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const LOG_DIR = path.join(ROOT, "logs");
const IGNORE_DIRS = new Set([".git", "node_modules", ".vercel", "logs", "uploads", "outputs"]);
const BINARY_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".pdf", ".mp4", ".mov", ".zip"]);

function log(action, payload) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(path.join(LOG_DIR, "automation.jsonl"), `${JSON.stringify({ timestamp: new Date().toISOString(), action, payload: redact(payload) })}\n`);
}

function redact(value) {
  if (!value || typeof value !== "object") return value;
  const copy = Array.isArray(value) ? [] : {};
  for (const [key, item] of Object.entries(value)) {
    copy[key] = /token|secret|authorization|key/i.test(key) ? "[redacted]" : (item && typeof item === "object" ? redact(item) : item);
  }
  return copy;
}

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
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

function gitBlobSha(buffer) {
  return crypto.createHash("sha1").update(Buffer.concat([Buffer.from(`blob ${buffer.length}\0`), buffer])).digest("hex");
}

function mimeMode(file) {
  return BINARY_EXTENSIONS.has(path.extname(file).toLowerCase()) ? "100644" : "100644";
}

async function github(pathname, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required.");
  const response = await fetch(`https://api.github.com${pathname}`, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `GitHub request failed: ${response.status}`);
  return body;
}

function runCheck() {
  const result = spawnSync(process.execPath, [path.join(ROOT, "scripts", "check-project.js")], { cwd: ROOT, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`Validation failed. Push aborted.\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout;
}

async function getRemoteTree(repo, branch) {
  const ref = await github(`/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  const commit = await github(`/repos/${repo}/git/commits/${ref.object.sha}`);
  const tree = await github(`/repos/${repo}/git/trees/${commit.tree.sha}?recursive=1`);
  const map = new Map();
  for (const item of tree.tree || []) {
    if (item.type === "blob") map.set(item.path, item.sha);
  }
  return { ref, commit, treeMap: map };
}

async function createBlob(repo, file) {
  const buffer = fs.readFileSync(file);
  const ext = path.extname(file).toLowerCase();
  const content = BINARY_EXTENSIONS.has(ext) ? buffer.toString("base64") : buffer.toString("utf8");
  const encoding = BINARY_EXTENSIONS.has(ext) ? "base64" : "utf-8";
  const blob = await github(`/repos/${repo}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content, encoding })
  });
  return blob.sha;
}

async function main() {
  const repo = clean(process.env.GITHUB_REPO || "comphelper22-cell/comphelp-service", 200);
  const branch = clean(process.env.GITHUB_BRANCH || "main", 80);
  if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is required.");

  const validation = runCheck();
  const remote = await getRemoteTree(repo, branch);
  const localFiles = walk(ROOT);
  const changed = [];

  for (const file of localFiles) {
    const relative = rel(file);
    const localSha = gitBlobSha(fs.readFileSync(file));
    if (remote.treeMap.get(relative) !== localSha) changed.push({ file, path: relative });
  }

  if (!changed.length) {
    const summary = { ok: true, pushed: false, message: "No changed files detected.", validation: "passed" };
    log("github_push_noop", summary);
    console.log(JSON.stringify(summary, null, 2));
    return summary;
  }

  const treeItems = [];
  for (const item of changed) {
    treeItems.push({
      path: item.path,
      mode: mimeMode(item.file),
      type: "blob",
      sha: await createBlob(repo, item.file)
    });
  }

  const tree = await github(`/repos/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: remote.commit.tree.sha, tree: treeItems })
  });
  const commit = await github(`/repos/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: clean(process.env.COMMIT_MESSAGE || "Automated CompHelp Service update", 200),
      tree: tree.sha,
      parents: [remote.ref.object.sha]
    })
  });
  await github(`/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false })
  });

  const summary = {
    ok: true,
    pushed: true,
    repo,
    branch,
    commit: commit.sha,
    changedFiles: changed.map((item) => item.path),
    validation: "passed",
    validationOutput: validation.trim()
  };
  log("github_push", summary);
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

if (require.main === module) {
  main().catch((error) => {
    const summary = { ok: false, error: error.message };
    log("github_push_failed", summary);
    console.error(JSON.stringify(summary, null, 2));
    process.exitCode = 1;
  });
}

module.exports = { main };
