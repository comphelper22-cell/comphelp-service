const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function releaseValidator(input = {}) {
  const navigation = validateNavigation();
  const docs = validateDocs();
  const tests = validateTests();
  const api = validateApi();
  const findings = []
    .concat(navigation.findings)
    .concat(docs.findings)
    .concat(tests.findings)
    .concat(api.findings);
  return {
    ok: true,
    data: {
      status: findings.length ? "review" : "pass",
      navigation,
      docs,
      tests,
      api,
      findings,
      generatedAt: new Date().toISOString()
    }
  };
}

function validateNavigation() {
  const html = read("marketplace.html");
  const targets = [...html.matchAll(/data-target="([^"]+)"/g)].map((match) => match[1]);
  const views = new Set([...html.matchAll(/data-view="([^"]+)"/g)].map((match) => match[1]));
  const missing = targets.filter((target) => !views.has(target));
  return {
    status: missing.length ? "review" : "pass",
    targets: targets.length,
    views: views.size,
    findings: missing.map((target) => `Navigation target missing view: ${target}`)
  };
}

function validateDocs() {
  const required = [
    "README.md",
    "ARCHITECTURE.md",
    "ROADMAP.md",
    "CHANGELOG.md",
    "docs/BETA_LAUNCH_PLAN.md",
    "docs/V1_RELEASE_NOTES.md",
    "docs/V1_USER_GUIDE.md",
    "docs/V1_ADMIN_GUIDE.md",
    "docs/V1_ARCHITECTURE.md",
    "docs/V1_DEPLOYMENT_GUIDE.md",
    "docs/KNOWN_ISSUES.md",
    "docs/TECHNICAL_DEBT.md",
    "docs/DEPLOYMENT_WORKFLOW.md",
    "docs/SPRINT_QUALITY_GATES.md"
  ];
  const missing = required.filter((file) => !fs.existsSync(path.join(ROOT, file)));
  return {
    status: missing.length ? "review" : "pass",
    required: required.length,
    findings: missing.map((file) => `Missing documentation: ${file}`)
  };
}

function validateTests() {
  const dir = path.join(ROOT, "tests");
  const tests = fs.existsSync(dir) ? fs.readdirSync(dir).filter((file) => file.endsWith(".test.js")) : [];
  return {
    status: tests.length >= 10 ? "pass" : "review",
    count: tests.length,
    findings: tests.length >= 10 ? [] : [`Expected at least 10 focused tests, found ${tests.length}.`]
  };
}

function validateApi() {
  const dir = path.join(ROOT, "api");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((file) => file.endsWith(".js")) : [];
  return {
    status: files.length <= 12 ? "pass" : "review",
    count: files.length,
    findings: files.length <= 12 ? [] : [`API function count ${files.length} exceeds Vercel Hobby limit risk.`]
  };
}

function read(relativePath) {
  try {
    return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
  } catch (_) {
    return "";
  }
}

module.exports = { releaseValidator };
