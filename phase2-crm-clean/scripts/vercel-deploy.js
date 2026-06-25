const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LOG_DIR = path.join(ROOT, "logs");

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function log(action, payload) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(path.join(LOG_DIR, "automation.jsonl"), `${JSON.stringify({ timestamp: new Date().toISOString(), action, payload: redact(payload) })}\n`);
}

function redact(value) {
  if (!value || typeof value !== "object") return value;
  const copy = Array.isArray(value) ? [] : {};
  for (const [key, item] of Object.entries(value)) {
    copy[key] = /token|secret|authorization|key/i.test(key) ? "[redacted]" : (item && typeof item === "object" ? redact(item) : item);
  }
  return copy;
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function vercel(pathname, options = {}) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN is required.");
  const response = await fetch(`https://api.vercel.com${pathname}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || body.message || `Vercel request failed: ${response.status}`);
  return body;
}

async function triggerDeployment() {
  if (process.env.VERCEL_DEPLOY_HOOK_URL) {
    const response = await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: "POST" });
    if (!response.ok) throw new Error(`Vercel deploy hook failed: ${response.status}`);
    return { via: "deploy_hook", status: response.status };
  }

  const projectId = clean(process.env.VERCEL_PROJECT_ID, 200);
  if (!projectId) throw new Error("VERCEL_PROJECT_ID is required.");

  const teamId = clean(process.env.VERCEL_TEAM_ID, 200);
  const url = new URL("https://api.vercel.com/v13/deployments");
  if (teamId) url.searchParams.set("teamId", teamId);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.VERCEL_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "comphelp-service",
      project: projectId,
      target: "production",
      gitSource: process.env.GITHUB_REPO ? {
        type: "github",
        repo: process.env.GITHUB_REPO.split("/")[1],
        org: process.env.GITHUB_REPO.split("/")[0],
        ref: process.env.GITHUB_BRANCH || "main"
      } : undefined
    })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || body.message || `Vercel deployment failed: ${response.status}`);
  return { via: "api", deployment: body };
}

async function checkDeployment(id) {
  if (!id) return { readyState: "UNKNOWN" };
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const deployment = await vercel(`/v13/deployments/${id}`);
    if (["READY", "ERROR", "CANCELED"].includes(deployment.readyState)) return deployment;
    await wait(6000);
  }
  return { id, readyState: "TIMEOUT" };
}

async function main() {
  const missing = [];
  if (!process.env.VERCEL_TOKEN) missing.push("VERCEL_TOKEN");
  if (!process.env.VERCEL_PROJECT_ID && !process.env.VERCEL_DEPLOY_HOOK_URL) missing.push("VERCEL_PROJECT_ID");
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
  const triggered = await triggerDeployment();
  const deploymentId = triggered.deployment?.id || "";
  const status = deploymentId ? await checkDeployment(deploymentId) : { readyState: "TRIGGERED" };
  const liveUrl = status.url ? `https://${status.url}` : "https://comphelp-service.vercel.app";
  const summary = { ok: status.readyState !== "ERROR" && status.readyState !== "CANCELED", triggered, status: status.readyState, liveUrl };
  log("vercel_deploy", summary);
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.ok) process.exitCode = 1;
  return summary;
}

if (require.main === module) {
  main().catch((error) => {
    const summary = { ok: false, error: error.message };
    log("vercel_deploy_failed", summary);
    console.error(JSON.stringify(summary, null, 2));
    process.exitCode = 1;
  });
}

module.exports = { main };
