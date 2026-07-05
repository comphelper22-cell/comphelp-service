const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LARGE_FILE_BYTES = 250 * 1024;

function performanceReview(input = {}) {
  const files = collect(ROOT);
  const largeFiles = files
    .map((file) => ({ file: rel(file), size: fs.statSync(file).size }))
    .filter((item) => item.size > LARGE_FILE_BYTES)
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
  const marketplaceSize = size("marketplace.html");
  const score = Math.max(60, 100 - largeFiles.length * 4 - (marketplaceSize > LARGE_FILE_BYTES ? 8 : 0));
  return {
    ok: true,
    data: {
      score,
      status: score >= 85 ? "strong" : score >= 70 ? "acceptable" : "needs_optimization",
      largeFiles,
      marketplaceSize,
      recommendations: [
        "Review large backup artifacts before release commits.",
        "Keep dashboard modules data-light until lazy loading is introduced.",
        "Continue avoiding paid UI libraries and heavy dependencies.",
        "Keep API entrypoints consolidated for Vercel Hobby compatibility."
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

function size(relativePath) {
  const file = path.join(ROOT, relativePath);
  return fs.existsSync(file) ? fs.statSync(file).size : 0;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

module.exports = { performanceReview };
