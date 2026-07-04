const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function deploymentAudit(input = {}) {
  const packageJson = exists("package.json");
  const vercelJson = exists("vercel.json");
  const apiSystem = exists("api/system.js");
  const checks = [
    { name: "package.json", status: packageJson ? "pass" : "fail" },
    { name: "vercel.json", status: vercelJson ? "pass" : "fail" },
    { name: "api/system.js", status: apiSystem ? "pass" : "fail" },
    { name: "Vercel Hobby API consolidation", status: apiCount() <= 12 ? "pass" : "review" },
    { name: "Validation command", status: packageJson && packageHasScript("check-project") ? "pass" : "fail" }
  ];
  return {
    ok: true,
    data: {
      status: checks.some((check) => check.status === "fail") ? "blocked" : "ready",
      checks,
      apiFunctionCount: apiCount(),
      deploymentRequiresApproval: true,
      generatedAt: new Date().toISOString()
    }
  };
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function apiCount() {
  const apiDir = path.join(ROOT, "api");
  return fs.existsSync(apiDir) ? fs.readdirSync(apiDir).filter((file) => file.endsWith(".js")).length : 0;
}

function packageHasScript(script) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8").replace(/^\uFEFF/, ""));
    return Boolean(pkg.scripts && pkg.scripts[script]);
  } catch (_) {
    return false;
  }
}

module.exports = { deploymentAudit };
