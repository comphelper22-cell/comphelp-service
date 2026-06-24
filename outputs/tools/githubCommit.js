const { execFileSync } = require("child_process");

function runGit(args) {
  return execFileSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

async function githubCommit(input = {}) {
  const message = String(input.message || "").trim();
  const push = Boolean(input.push);

  if (!message) {
    return { ok: false, error: "Commit message is required." };
  }

  let status = "";
  let diff = "";
  try {
    status = runGit(["status", "--short"]);
    diff = runGit(["diff", "--", "."]);
  } catch (error) {
    return {
      ok: false,
      error: "Git is not available or this folder is not a Git repository.",
      details: error.message
    };
  }

  if (!input.approved) {
    return {
      ok: true,
      previewOnly: true,
      requiresApproval: true,
      status,
      diff,
      message: "Approval is required before committing or pushing to GitHub."
    };
  }

  runGit(["add", "."]);
  const commitOutput = runGit(["commit", "-m", message]);
  let pushOutput = "";

  if (push) {
    pushOutput = runGit(["push"]);
  }

  return {
    ok: true,
    committed: true,
    pushed: push,
    commitOutput,
    pushOutput
  };
}

module.exports = {
  githubCommit
};
