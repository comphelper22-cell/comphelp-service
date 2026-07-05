const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const IGNORE_DIRS = new Set([".git", "node_modules", ".vercel", "backups"]);
const IGNORE_FILES = new Set([".env", ".env.local"]);
const REAL_SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9_]{20,}/,
  /vcp_[A-Za-z0-9_]{20,}/,
  /SUPABASE_ANON_KEY\s*=\s*eyJ/,
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*eyJ/,
  /VERCEL_TOKEN\s*=\s*[A-Za-z0-9_\-]{20,}/
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) walk(path.join(dir, entry.name), files);
      continue;
    }
    if (entry.isFile() && !IGNORE_FILES.has(entry.name)) files.push(path.join(dir, entry.name));
  }
  return files;
}

const findings = [];
for (const file of walk(ROOT)) {
  const text = fs.readFileSync(file, "utf8");
  REAL_SECRET_PATTERNS.forEach((pattern) => {
    if (pattern.test(text)) findings.push(path.relative(ROOT, file).replace(/\\/g, "/"));
  });
}

assert.deepStrictEqual(findings, []);
assert.ok(fs.existsSync(path.join(ROOT, "docs", "SECURITY_AUDIT.md")));

console.log(JSON.stringify({
  ok: true,
  realSecretsFound: 0,
  auditDocumented: true
}, null, 2));
