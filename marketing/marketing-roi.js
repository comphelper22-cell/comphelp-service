const { campaigns } = require("./campaigns");

function roi(input = {}) {
  const campaignData = campaigns(input).data;
  const roiPercent = campaignData.totalSpend ? Math.round(((campaignData.totalRevenue - campaignData.totalSpend) / campaignData.totalSpend) * 100) : 0;
  return {
    ok: true,
    data: {
      demoMode: campaignData.demoMode,
      totalSpend: campaignData.totalSpend,
      totalRevenue: campaignData.totalRevenue,
      totalLeads: campaignData.totalLeads,
      costPerLead: campaignData.totalLeads ? Math.round(campaignData.totalSpend / campaignData.totalLeads) : 0,
      roiPercent,
      status: roiPercent > 0 ? "positive" : "needs_more_data",
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { roi };
