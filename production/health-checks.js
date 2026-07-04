const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function healthChecks(input = {}) {
  const checks = [
    fileCheck("package.json"),
    fileCheck("vercel.json"),
    fileCheck("api/system.js"),
    fileCheck("api/marketplace.js"),
    fileCheck("marketplace.html"),
    directoryCheck("tests"),
    directoryCheck("docs")
  ];
  const failed = checks.filter((check) => check.status !== "pass");
  return {
    ok: true,
    data: {
      status: failed.length ? "needs_attention" : "healthy",
      checks,
      warnings: failed.map((check) => check.message),
      environment: {
        node: process.version,
        platform: process.platform,
        externalServicesRequired: false
      },
      generatedAt: new Date().toISOString()
    }
  };
}

function fileCheck(relativePath) {
  const exists = fs.existsSync(path.join(ROOT, relativePath));
  return {
    name: relativePath,
    status: exists ? "pass" : "warning",
    message: exists ? "File exists." : `${relativePath} is missing.`
  };
}

function directoryCheck(relativePath) {
  const full = path.join(ROOT, relativePath);
  const exists = fs.existsSync(full) && fs.statSync(full).isDirectory();
  return {
    name: relativePath,
    status: exists ? "pass" : "warning",
    message: exists ? "Directory exists." : `${relativePath} directory is missing.`
  };
}

module.exports = { healthChecks };
