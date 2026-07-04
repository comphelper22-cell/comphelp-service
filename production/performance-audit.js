const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LARGE_FILE_BYTES = 250 * 1024;

function performanceAudit(input = {}) {
  const files = collect(ROOT);
  const largeFiles = files
    .map((file) => ({ file: path.relative(ROOT, file).replace(/\\/g, "/"), size: fs.statSync(file).size }))
    .filter((item) => item.size > LARGE_FILE_BYTES)
    .sort((a, b) => b.size - a.size)
    .slice(0, 20);
  return {
    ok: true,
    data: {
      status: largeFiles.length ? "review" : "pass",
      largeFiles,
      thresholds: { largeFileBytes: LARGE_FILE_BYTES },
      recommendations: [
        "Keep API functions small for Vercel cold start health.",
        "Avoid large client-side bundles in marketplace dashboard.",
        "Use lazy-loaded data in future UI sprints.",
        "Keep generated logs out of commits."
      ],
      generatedAt: new Date().toISOString()
    }
  };
}

function collect(dir, files = []) {
  const ignore = new Set([".git", "node_modules", ".vercel", "logs", "uploads", "outputs", "phase2-crm-clean", "backups"]);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignore.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, files);
    if (entry.isFile()) files.push(full);
  }
  return files;
}

module.exports = { performanceAudit };
