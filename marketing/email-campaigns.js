const { readMarketingData } = require("./lead-sources");

function email(input = {}) {
  const data = readMarketingData(input);
  const campaigns = data.emails.map((item) => ({
    name: item.name || "Email campaign",
    status: item.status || "draft",
    sends: Number(item.sends || 0),
    leads: Number(item.leads || 0)
  }));
  return {
    ok: true,
    data: {
      demoMode: data.demoMode,
      campaigns,
      draftCampaigns: campaigns.filter((item) => item.status === "draft").length,
      leadsFromEmail: campaigns.reduce((sum, item) => sum + item.leads, 0),
      recommendedAction: "Prepare maintenance reminder email drafts for past customers; send only after approval.",
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { email };
