const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function systemHealth(input = {}) {
  const requiredFiles = [
    "index.html",
    "marketplace.html",
    "api/system.js",
    "api/marketplace.js",
    "assets/marketplace-manager.js",
    "package.json",
    "vercel.json",
    "README.md",
    "ARCHITECTURE.md",
    "CHANGELOG.md"
  ];
  const checks = requiredFiles.map((file) => ({
    name: file,
    status: fs.existsSync(path.join(ROOT, file)) ? "pass" : "missing"
  }));
  const apiCount = countApiFiles();
  const moduleCount = countModuleDirs();
  const testCount = countTests();
  return {
    ok: true,
    data: {
      status: checks.some((check) => check.status !== "pass") ? "needs_review" : "healthy",
      checks,
      apiCount,
      moduleCount,
      testCount,
      installedModules: moduleNames(),
      generatedAt: new Date().toISOString()
    }
  };
}

function countApiFiles() {
  const apiDir = path.join(ROOT, "api");
  return fs.existsSync(apiDir) ? fs.readdirSync(apiDir).filter((file) => file.endsWith(".js")).length : 0;
}

function countTests() {
  const testDir = path.join(ROOT, "tests");
  return fs.existsSync(testDir) ? fs.readdirSync(testDir).filter((file) => file.endsWith(".test.js")).length : 0;
}

function countModuleDirs() {
  return moduleNames().length;
}

function moduleNames() {
  return [
    "brain",
    "sales",
    "workflow",
    "operations",
    "finance",
    "customer-success",
    "marketing",
    "analytics",
    "dispatch-ai",
    "saas",
    "billing",
    "integrations",
    "production",
    "launch"
  ].filter((dir) => fs.existsSync(path.join(ROOT, dir)));
}

module.exports = { systemHealth };
