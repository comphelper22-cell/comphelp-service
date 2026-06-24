const { logAction } = require("./logAction");

function canAutoPost(input = {}) {
  return input.approved === true || process.env.AUTO_POST === "true";
}

async function postToFacebook(input = {}) {
  const message = String(input.message || input.caption || "").trim();
  const pageId = input.pageId || process.env.FACEBOOK_PAGE_ID;
  const token = input.accessToken || process.env.META_ACCESS_TOKEN;

  if (!message) return { ok: false, error: "message is required." };
  if (!canAutoPost(input)) {
    const result = {
      ok: true,
      draftOnly: true,
      requiresApproval: true,
      platform: "facebook",
      message,
      note: "Approval is required before posting unless AUTO_POST=true."
    };
    logAction("postToFacebook.preview", result);
    return result;
  }

  if (!pageId || !token) {
    return { ok: false, error: "FACEBOOK_PAGE_ID and META_ACCESS_TOKEN are required." };
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(pageId)}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ message, access_token: token })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false, error: "Facebook post failed.", status: response.status, body };

  const result = { ok: true, posted: true, platform: "facebook", body };
  logAction("postToFacebook.posted", result);
  return result;
}

module.exports = {
  postToFacebook
};
