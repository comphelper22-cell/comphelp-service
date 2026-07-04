const { readMarketingData } = require("./lead-sources");

function campaigns(input = {}) {
  const data = readMarketingData(input);
  const rows = data.campaigns.map((campaign) => ({
    name: campaign.name || campaign.title || "Campaign",
    channel: campaign.channel || campaign.source || "local",
    spend: money(campaign.spend || campaign.cost),
    leads: Number(campaign.leads || 0),
    revenue: money(campaign.revenue || campaign.value),
    roi: roi(campaign)
  }));
  return {
    ok: true,
    data: {
      demoMode: data.demoMode,
      campaigns: rows,
      totalSpend: rows.reduce((sum, item) => sum + item.spend, 0),
      totalLeads: rows.reduce((sum, item) => sum + item.leads, 0),
      totalRevenue: rows.reduce((sum, item) => sum + item.revenue, 0),
      generatedAt: new Date().toISOString()
    }
  };
}

function roi(campaign) {
  const spend = money(campaign.spend || campaign.cost);
  const revenue = money(campaign.revenue || campaign.value);
  return spend ? Math.round(((revenue - spend) / spend) * 100) : 0;
}

function money(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

module.exports = { campaigns };
