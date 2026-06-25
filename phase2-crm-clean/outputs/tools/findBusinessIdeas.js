const { logAction } = require("./logAction");

function findBusinessIdeas(input = {}) {
  const ideas = [
    {
      title: "Monthly Camera Health Check Plan",
      category: "recurring_revenue",
      offer: "Monthly remote review, app check, recording check, and priority support for small businesses.",
      profitPotential: "high",
      difficulty: "medium",
      why: "Camera customers often need ongoing confidence that recording and alerts still work."
    },
    {
      title: "WiFi Optimization Add-On",
      category: "upsell",
      offer: "Add WiFi signal testing and router placement help to camera or smart home installs.",
      profitPotential: "high",
      difficulty: "low",
      why: "Camera reliability depends on network quality, so this naturally fits the main service."
    },
    {
      title: "Apartment Building Entry Camera Package",
      category: "b2b",
      offer: "Entry, garage, package area, and shared-space camera setup for landlords and property managers.",
      profitPotential: "high",
      difficulty: "medium",
      why: "Property managers can buy larger jobs and may need support across multiple buildings."
    },
    {
      title: "Smart Doorbell + Lock Setup",
      category: "bundle",
      offer: "Doorbell camera, smart lock, mobile app setup, and user training.",
      profitPotential: "medium",
      difficulty: "low",
      why: "Simple residential bundle with clear customer value."
    },
    {
      title: "Small Business Tech Care Plan",
      category: "recurring_revenue",
      offer: "Monthly support for WiFi, computers, cameras, and smart devices.",
      profitPotential: "high",
      difficulty: "medium",
      why: "Recurring B2B support can stabilize revenue beyond one-time installs."
    }
  ];

  const prioritized = ideas.sort((a, b) => {
    const score = { high: 3, medium: 2, low: 1 };
    return score[b.profitPotential] - score[a.profitPotential] || score[a.difficulty] - score[b.difficulty];
  });

  const result = {
    ok: true,
    focus: input.focus || "local_growth",
    ideas: prioritized,
    nextActions: [
      "Choose one recurring offer to add to the website.",
      "Create one landing page for apartment or small business camera installation.",
      "Draft outreach to property managers and small retail businesses."
    ]
  };

  logAction("findBusinessIdeas", result);
  return result;
}

module.exports = {
  findBusinessIdeas
};
