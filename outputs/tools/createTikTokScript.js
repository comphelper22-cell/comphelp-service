const { logAction } = require("./logAction");

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function createTikTokScript(input = {}) {
  const service = clean(input.service, 140) || "Security Camera Installation";
  const city = clean(input.city, 120) || "Los Angeles";
  const topic = clean(input.topic, 160) || `${service} tips`;

  const script = {
    hook: `If you need ${service} in ${city}, check this before you book anyone.`,
    shots: [
      "Show the front door, driveway, office entrance, or WiFi router area.",
      "Point to the biggest mistake: poor placement, weak WiFi, messy cable path, or no recording check.",
      "Show a clean setup detail or planning checklist.",
      "End with a simple free-estimate call to action."
    ],
    voiceover: [
      `For ${topic}, the first step is knowing what problem you want solved.`,
      "For cameras, think about blind spots and recording. For WiFi, think about coverage and speed. For smart home, think about daily use.",
      "CompHelp Service helps local customers plan the setup and request a free estimate.",
      "Call +1 (747) 295-1440 or message CompHelp Service."
    ].join(" "),
    caption: `${service} help in ${city}. Free estimates from CompHelp Service.`,
    hashtags: ["#CompHelpService", "#LosAngeles", "#Burbank", "#SecurityCameraTips", "#WiFiTips", "#SmartHome"]
  };

  const result = { ok: true, draftOnly: true, script };
  logAction("createTikTokScript", result);
  return result;
}

module.exports = {
  createTikTokScript
};
