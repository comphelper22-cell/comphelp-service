const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function versionManager(input = {}) {
  const pkg = readPackage();
  return {
    ok: true,
    data: {
      productName: "CompHelp AI",
      releaseName: "V1.0 Release Candidate",
      packageVersion: pkg.version || "1.0.0",
      candidateVersion: input.version || "v1.0.0-rc.1",
      releaseDate: new Date().toISOString().slice(0, 10),
      versionHistory: [
        { version: "v0.7", title: "Core Platform Foundation" },
        { version: "v0.8", title: "Business Brain Foundation" },
        { version: "v0.9", title: "Business Operating Centers" },
        { version: "v1.0.0-rc.1", title: "Release Candidate" }
      ],
      generatedAt: new Date().toISOString()
    }
  };
}

function readPackage() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8").replace(/^\uFEFF/, ""));
  } catch (_) {
    return {};
  }
}

module.exports = { versionManager };
