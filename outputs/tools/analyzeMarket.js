const { logAction } = require("./logAction");

const DEFAULT_AREAS = ["Los Angeles", "Burbank", "Glendale", "North Hollywood", "Studio City"];
const DEFAULT_SERVICES = ["Security Camera Installation", "Smart Home Setup", "WiFi & Network Installation", "Computer Repair"];

function clean(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

async function fetchSerpResults(query) {
  if (!process.env.SERPAPI_KEY) return [];
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("location", "Los Angeles, California, United States");
  url.searchParams.set("api_key", process.env.SERPAPI_KEY);

  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return (data.organic_results || []).slice(0, 6).map((item) => ({
    title: clean(item.title, 180),
    link: clean(item.link, 500),
    snippet: clean(item.snippet, 300)
  }));
}

async function analyzeMarket(input = {}) {
  const service = clean(input.service, 140) || "Security Camera Installation";
  const areas = Array.isArray(input.areas) && input.areas.length ? input.areas : DEFAULT_AREAS;
  const query = clean(input.query, 300) || `${service} ${areas[0]} pricing competitors`;
  const liveResults = await fetchSerpResults(query);

  const report = {
    service,
    areas,
    researchMode: liveResults.length ? "serpapi" : "strategic_local_model",
    competitorsToWatch: liveResults,
    demandSignals: [
      "Security camera demand is strongest around homes, apartments, retail shops, offices, parking areas, and production spaces.",
      "WiFi and network work often bundles well with security camera installation because cameras depend on reliable connectivity.",
      "Smart home setup is a useful upsell after cameras, doorbells, locks, thermostats, and lighting requests."
    ],
    pricingNotes: [
      "Do not publish unsupported exact prices beyond approved starting-price language.",
      "Keep $299+ as starting language for qualifying security camera installation projects.",
      "Use free estimate language for projects with wiring, multiple cameras, commercial spaces, or unknown equipment needs."
    ],
    keywordIdeas: areas.flatMap((area) => [
      `${service} ${area}`,
      `security camera installer ${area}`,
      `CCTV installation ${area}`,
      `WiFi installation ${area}`,
      `computer repair ${area}`
    ]),
    googleAdsKeywords: [
      `"security camera installation near me"`,
      `"security camera installer"`,
      `"wifi installer near me"`,
      `"computer repair near me"`,
      `"smart home installer"`
    ],
    opportunities: [
      "Create pages for apartment security camera installation.",
      "Create pages for small business camera installation.",
      "Bundle WiFi optimization with camera installation.",
      "Offer monthly camera health checks for small businesses."
    ],
    nextActions: [
      "Create one local SEO page per high-intent service and area.",
      "Publish weekly educational posts about cameras, WiFi, and smart home setup.",
      "Build a B2B outreach list of retail shops, small offices, studios, and apartment managers."
    ]
  };

  logAction("analyzeMarket", { input, report });
  return { ok: true, report };
}

module.exports = {
  analyzeMarket
};
