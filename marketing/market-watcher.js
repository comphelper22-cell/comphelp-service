const MARKET_SIGNALS = [
  {
    id: "market-camera-la",
    type: "competitor_offer",
    source: "manual_public_listing_review_placeholder",
    city: "Los Angeles",
    service: "Security Camera Installation",
    competitorName: "Local camera installer listing",
    signal: "Many listings advertise basic camera installs but do not mention network cleanup or small-business support.",
    commonPriceRange: "$299-$899 starter projects",
    opportunity: "Promote clear camera packages with WiFi and rack cleanup add-ons.",
    demandScore: 88,
    risk: "Avoid price promises until site visit confirms equipment and labor."
  },
  {
    id: "market-wifi-burbank",
    type: "local_demand",
    source: "manual_review_placeholder",
    city: "Burbank",
    service: "WiFi & Network Installation",
    competitorName: "Multiple IT support listings",
    signal: "Restaurants and small offices show frequent public complaints around slow internet and POS interruptions.",
    commonPriceRange: "$150-$650 troubleshooting and installation",
    opportunity: "Run content about POS WiFi reliability and guest network separation.",
    demandScore: 82,
    risk: "Verify business-hours access before quoting."
  },
  {
    id: "market-data-recovery",
    type: "seasonal_opportunity",
    source: "service_category_placeholder",
    city: "Glendale",
    service: "Data Recovery",
    competitorName: "Computer repair listing category",
    signal: "Data recovery requests rise when small businesses replace old laptops and external drives.",
    commonPriceRange: "$99-$499 diagnostic and transfer jobs",
    opportunity: "Promote safe backup and data transfer help for local offices.",
    demandScore: 74,
    risk: "Never guarantee recovery; use when possible language."
  },
  {
    id: "market-property-managers",
    type: "new_business_opportunity",
    source: "local_business_directory_placeholder",
    city: "Los Angeles",
    service: "Security Camera Installation",
    competitorName: "Apartment maintenance listings",
    signal: "Property managers need repeat work across cameras, access points, and vendor coordination.",
    commonPriceRange: "$499-$2,500 multi-area projects",
    opportunity: "Create a property-manager maintenance offer with quarterly system checks.",
    demandScore: 91,
    risk: "Owner approval required before any vendor or property outreach."
  }
];

function marketWatcher(input = {}) {
  const city = String(input.city || "").toLowerCase();
  const service = String(input.service || "").toLowerCase();
  let signals = MARKET_SIGNALS;
  if (city) signals = signals.filter((item) => item.city.toLowerCase().includes(city));
  if (service) signals = signals.filter((item) => item.service.toLowerCase().includes(service));
  return {
    ok: true,
    data: {
      externalFetchEnabled: false,
      sourceMode: "manual-public-research-placeholders",
      competitorAlerts: signals.filter((item) => item.type === "competitor_offer"),
      popularServices: rankServices(signals),
      localDemand: signals,
      seasonalOpportunities: signals.filter((item) => item.type === "seasonal_opportunity"),
      weakReviewSignals: signals.filter((item) => /complaint|slow|interrupt|basic/i.test(item.signal)),
      newBusinessSignals: signals.filter((item) => item.type === "new_business_opportunity"),
      generatedAt: new Date().toISOString()
    }
  };
}

function rankServices(signals) {
  const grouped = signals.reduce((acc, item) => {
    if (!acc[item.service]) acc[item.service] = { service: item.service, demandScore: 0, count: 0 };
    acc[item.service].demandScore += Number(item.demandScore || 0);
    acc[item.service].count += 1;
    return acc;
  }, {});
  return Object.values(grouped).map((item) => ({
    service: item.service,
    demandScore: Math.round(item.demandScore / item.count),
    signals: item.count
  })).sort((a, b) => b.demandScore - a.demandScore);
}

module.exports = {
  MARKET_SIGNALS,
  marketWatcher
};
