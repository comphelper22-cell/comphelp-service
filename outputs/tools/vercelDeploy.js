function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

async function vercelDeploy(input = {}) {
  const projectId = clean(input.projectId || process.env.VERCEL_PROJECT_ID, 200);
  const teamId = clean(input.teamId || process.env.VERCEL_TEAM_ID, 200);
  const token = clean(input.token || process.env.VERCEL_TOKEN, 500);
  const target = clean(input.target, 40) || "production";

  if (!input.approved) {
    return {
      ok: true,
      previewOnly: true,
      requiresApproval: true,
      projectId: projectId || "(missing)",
      teamId: teamId || "",
      target,
      message: "Approval is required before triggering a Vercel deployment."
    };
  }

  if (!projectId || !token) {
    return {
      ok: false,
      error: "VERCEL_PROJECT_ID and VERCEL_TOKEN are required to trigger deployment."
    };
  }

  const url = new URL("https://api.vercel.com/v13/deployments");
  if (teamId) url.searchParams.set("teamId", teamId);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: input.name || "comphelp-service",
      project: projectId,
      target,
      gitSource: input.gitSource
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      error: "Vercel deployment request failed.",
      status: response.status,
      body
    };
  }

  return {
    ok: true,
    deployed: true,
    deploymentId: body.id,
    url: body.url ? `https://${body.url}` : ""
  };
}

module.exports = {
  vercelDeploy
};
