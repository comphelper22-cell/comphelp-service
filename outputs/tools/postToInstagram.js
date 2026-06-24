const { logAction } = require("./logAction");

function canAutoPost(input = {}) {
  return input.approved === true || process.env.AUTO_POST === "true";
}

async function postToInstagram(input = {}) {
  const caption = String(input.caption || input.message || "").trim();
  const imageUrl = String(input.imageUrl || "").trim();
  const instagramId = input.instagramBusinessId || process.env.INSTAGRAM_BUSINESS_ID;
  const token = input.accessToken || process.env.META_ACCESS_TOKEN;

  if (!caption) return { ok: false, error: "caption is required." };
  if (!imageUrl) {
    return {
      ok: true,
      draftOnly: true,
      requiresAsset: true,
      platform: "instagram",
      caption,
      note: "Instagram publishing requires a publicly reachable imageUrl."
    };
  }

  if (!canAutoPost(input)) {
    const result = {
      ok: true,
      draftOnly: true,
      requiresApproval: true,
      platform: "instagram",
      caption,
      imageUrl,
      note: "Approval is required before posting unless AUTO_POST=true."
    };
    logAction("postToInstagram.preview", result);
    return result;
  }

  if (!instagramId || !token) {
    return { ok: false, error: "INSTAGRAM_BUSINESS_ID and META_ACCESS_TOKEN are required." };
  }

  const mediaResponse = await fetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(instagramId)}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ image_url: imageUrl, caption, access_token: token })
  });
  const media = await mediaResponse.json().catch(() => ({}));
  if (!mediaResponse.ok) return { ok: false, error: "Instagram media creation failed.", status: mediaResponse.status, body: media };

  const publishResponse = await fetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(instagramId)}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ creation_id: media.id, access_token: token })
  });
  const body = await publishResponse.json().catch(() => ({}));
  if (!publishResponse.ok) return { ok: false, error: "Instagram publish failed.", status: publishResponse.status, body };

  const result = { ok: true, posted: true, platform: "instagram", body };
  logAction("postToInstagram.posted", result);
  return result;
}

module.exports = {
  postToInstagram
};
