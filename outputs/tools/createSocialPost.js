const { logAction } = require("./logAction");

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function createSocialPost(input = {}) {
  const platform = clean(input.platform, 40) || "instagram";
  const service = clean(input.service, 140) || "Security Camera Installation";
  const city = clean(input.city, 120) || "Los Angeles";
  const postType = clean(input.postType, 80) || "educational";

  const captions = {
    educational: `Thinking about ${service} in ${city}? Start with the areas you want to protect, how you want alerts to work, and whether your WiFi can support the setup. CompHelp Service can help you plan it clearly and request a free estimate.`,
    promotional: `Need ${service} in ${city}? CompHelp Service helps local homes and small businesses with practical setup, clean guidance, and free estimates. Call +1 (747) 295-1440.`,
    before_after: `Before: blind spots, weak WiFi, or devices that are hard to manage. After: cleaner setup, easier access, and support from CompHelp Service. Serving ${city} and nearby areas.`
  };

  const result = {
    ok: true,
    draftOnly: true,
    platform,
    postType,
    caption: captions[postType] || captions.educational,
    hashtags: [
      "#CompHelpService",
      `#${city.replace(/\s+/g, "")}`,
      "#SecurityCameraInstallation",
      "#SmartHome",
      "#WiFiInstallation",
      "#ComputerRepair",
      "#LosAngelesBusiness"
    ],
    creativeDirection: "Use a real job-site, clean equipment, or simple tip graphic. Do not use fake before/after claims.",
    approvalRequired: process.env.AUTO_POST !== "true"
  };

  logAction("createSocialPost", result);
  return result;
}

module.exports = {
  createSocialPost
};
