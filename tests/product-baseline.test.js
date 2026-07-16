const assert = require("assert");
const fs = require("fs");
const path = require("path");

const baselinePath = path.join(__dirname, "..", "docs", "PRODUCT_BASELINE.md");
assert.ok(fs.existsSync(baselinePath), "PRODUCT_BASELINE.md must exist.");

const baseline = fs.readFileSync(baselinePath, "utf8");
const testCount = fs.readdirSync(path.join(__dirname)).filter((name) => name.endsWith(".test.js")).length;
const requiredSections = [
  "# CompHelp Product Baseline",
  "## Live production surfaces",
  "## Verified production capabilities",
  "## Beta and prototype capabilities",
  "## Scaffolded or disconnected capabilities",
  "## Current storage and persistence",
  "## Authentication and authorization",
  "## External integrations",
  "## Quality baseline",
  "## Known production blockers",
  "## Evidence sources"
];
requiredSections.forEach((section) => assert.ok(baseline.includes(section), `Missing baseline section: ${section}`));

assert.match(baseline, /https:\/\/comphelp-service\.vercel\.app\//);
assert.match(baseline, new RegExp(`${testCount} automated tests`, "i"));
assert.match(baseline, /public chat[^\n]*unauthenticated message-only POST/i);
assert.match(baseline, /temporary process memory/i);
assert.match(baseline, /Supabase production connection[^\n]*not active/i);
assert.match(baseline, /real user authentication[^\n]*not connected/i);
assert.match(baseline, /demo data[^\n]*clearly labeled/i);
assert.match(baseline, /GitHub push[^\n]*Hovo[^\n]*approval/i);
assert.match(baseline, /Vercel production deployment[^\n]*Hovo[^\n]*approval/i);

console.log(JSON.stringify({ ok: true, productBaseline: "documented" }, null, 2));
