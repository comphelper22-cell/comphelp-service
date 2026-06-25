function createSocialDrafts(input = {}) {
  const service = input.service || "CompHelp Service";
  const city = input.city || "Los Angeles";
  const note = input.description || `Completed a ${service.toLowerCase()} project in ${city}.`;
  const keyword = `${service} ${city}`;
  const hashtags = [
    "#CompHelpService",
    "#LosAngelesTech",
    `#${city.replace(/\s+/g, "")}`,
    `#${service.replace(/[^A-Za-z0-9]/g, "")}`,
    "#SmallBusiness"
  ];

  return {
    instagramCaption: `${note}\n\nNeed help with ${service.toLowerCase()}? CompHelp Service offers local support across Los Angeles County.\n\n${hashtags.join(" ")}`,
    facebookCaption: `${note}\n\nCompHelp Service helps local homes and small businesses with ${service.toLowerCase()}, smart home setup, WiFi, computer repair, and data recovery. Call +1 (747) 295-1440 for a free estimate.`,
    tiktokScript: [
      `Opening shot: show the finished ${service.toLowerCase()} setup.`,
      `Voiceover: "Another local ${city} project completed by CompHelp Service."`,
      "Cut to close-up details, clean cable/device placement, or final customer-ready result.",
      "End card: Need help? Call +1 (747) 295-1440 for a free estimate."
    ],
    googleBusinessPost: `${keyword}: ${note} Contact CompHelp Service for local tech service and free estimates in Los Angeles County.`,
    hashtags
  };
}

module.exports = {
  createSocialDrafts
};
