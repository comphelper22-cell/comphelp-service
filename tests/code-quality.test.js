const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

assert.strictEqual(packageJson.scripts.lint, "node scripts/lint-check.js");
assert.ok(fs.existsSync(path.join(ROOT, "scripts", "lint-check.js")));
assert.ok(fs.existsSync(path.join(ROOT, ".github", "workflows", "project-check.yml")));

const lint = spawnSync(process.execPath, ["scripts/lint-check.js"], {
  cwd: ROOT,
  encoding: "utf8"
});

assert.strictEqual(lint.status, 0, lint.stderr || lint.stdout);

console.log(JSON.stringify({
  ok: true,
  lintScript: "configured",
  githubActions: "configured"
}, null, 2));
