const { logAction } = require("./logAction");

function canAutoPost(input = {}) {
  return input.approved === true || process.env.AUTO_POST === "true";
}

async function createTikTokDraft(input = {}) {
  const caption = String(input.caption || "").trim();
  const script = String(input.script || "").trim();
  const videoUrl = String(input.videoUrl || "").trim();

  const draft = {
    platform: "tiktok",
    caption,
    script,
    videoUrl,
    hashtags: input.hashtags || ["#CompHelpService", "#LosAngeles", "#SecurityCameraTips", "#WiFiTips"],
    status: "draft"
  };

  if (!canAutoPost(input)) {
    const result = {
      ok: true,
      draftOnly: true,
      requiresApproval: true,
      draft,
      note: "TikTok content is drafted only. Approval is required before scheduler/API submission unless AUTO_POST=true."
    };
    logAction("createTikTokDraft.preview", result);
    return result;
  }

  if (!process.env.TIKTOK_ACCESS_TOKEN) {
    return {
      ok: true,
      draftOnly: true,
      requiresScheduler: true,
      draft,
      note: "TIKTOK_ACCESS_TOKEN is not configured. Save this draft in an approved scheduler."
    };
  }

  const result = {
    ok: true,
    draftCreated: true,
    draft,
    note: "TikTok API publishing varies by app approval. This tool prepares an approved draft payload for scheduler integration."
  };
  logAction("createTikTokDraft.created", result);
  return result;
}

module.exports = {
  createTikTokDraft
};
