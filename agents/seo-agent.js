const fs = require("fs");
const path = require("path");
const safeStorage = require("../storage/safe-storage");

const ROOT = path.resolve(__dirname, "..");
const LOG_DIR = path.join(ROOT, "logs");

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function slugify(value) {
  return clean(value, 180).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function log(action, payload) {
  safeStorage.appendLine(path.join(LOG_DIR, "agents.jsonl"), `${JSON.stringify({ timestamp: new Date().toISOString(), agent: "seo-agent", action, payload })}\n`);
}

function seoPlan(input = {}) {
  const service = clean(input.service || "Security Camera Installation", 120);
  const city = clean(input.city || "Los Angeles", 80);
  const slug = slugify(`${service} ${city}`);
  return {
    brand: "CompHelp Service",
    cityPage: {
      file: `${slug}.html`,
      url: `/${slug}`,
      title: `${service} ${city} | CompHelp Service`,
      h1: `${service} in ${city}`,
      metaDescription: `CompHelp Service provides ${service.toLowerCase()} for homes and small businesses in ${city}. Request a free estimate.`
    },
    servicePageIdeas: [`${service} pricing`, `${service} FAQ`, `${service} work gallery`, `${service} checklist`],
    blogIdeas: [
      `How to choose ${service.toLowerCase()} in ${city}`,
      `${service} cost guide for ${city}`,
      `Common ${service.toLowerCase()} mistakes to avoid`
    ],
    schemaImprovements: ["LocalBusiness", "Service", "FAQPage", "BreadcrumbList"],
    sitemapAction: "Add generated pages to sitemap.xml after page creation."
  };
}

function main() {
  const result = seoPlan({ service: process.argv[2], city: process.argv[3] });
  log("seo_plan_created", result);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();

module.exports = { seoPlan };
