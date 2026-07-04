const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SECURITY_KEYWORDS = ["api_key", "secret", "token", "password", "private_key", "client_secret"];

function securityChecklist(input = {}) {
  const findings = [];
  const files = collect(ROOT).filter((file) => /\.(js|html|md|json)$/i.test(file));
  files.forEach((file) => {
    const relative = path.relative(ROOT, file).replace(/\\/g, "/");
    const text = fs.readFileSync(file, "utf8");
    SECURITY_KEYWORDS.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) {
        findings.push({
          file: relative,
          keyword,
          severity: /example|placeholder|replace_me|paste/i.test(text) ? "info" : "review"
        });
      }
    });
  });
  return {
    ok: true,
    data: {
      status: findings.some((finding) => finding.severity === "review") ? "review" : "pass",
      findings: findings.slice(0, 50),
      scannedFiles: files.length,
      rules: [
        "Do not commit .env or .env.local.",
        "Do not expose API keys or tokens.",
        "Mask API key metadata in dashboard output.",
        "Use environment variables for real production credentials."
      ],
      generatedAt: new Date().toISOString()
    }
  };
}

function collect(dir, files = []) {
  const ignore = new Set([".git", "node_modules", ".vercel", "logs", "uploads", "outputs", "phase2-crm-clean"]);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignore.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, files);
    if (entry.isFile()) files.push(full);
  }
  return files;
}

module.exports = { securityChecklist };
