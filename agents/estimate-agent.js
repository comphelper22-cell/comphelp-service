const fs = require("fs");
const path = require("path");
const safeStorage = require("../storage/safe-storage");

const ROOT = path.resolve(__dirname, "..");
const MARKETPLACE_FILE = path.join(ROOT, "data", "marketplace.json");
const LOG_DIR = path.join(ROOT, "logs");

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function money(value) {
  return Math.max(0, Number(value || 0));
}

function readMarketplace() {
  return JSON.parse(fs.readFileSync(MARKETPLACE_FILE, "utf8").replace(/^\uFEFF/, ""));
}

function log(action, payload) {
  safeStorage.appendLine(path.join(LOG_DIR, "agents.jsonl"), `${JSON.stringify({ timestamp: new Date().toISOString(), agent: "estimate-agent", action, payload })}\n`);
}

function estimate(input = {}) {
  const data = readMarketplace();
  const service = clean(input.service || "Security Camera Installation", 120);
  const rules = data.estimateRules?.[service] || { base: 99, perUnit: 50, unit: "unit" };
  const units = Math.max(1, Number(input.units || 1));
  const laborHours = money(input.laborHours);
  const materialEstimate = money(input.materialEstimate);
  const commissionPercent = money(input.commissionPercent || 10);
  const urgencyMultiplier = /same|urgent|today|emergency/i.test(input.urgency || "") ? 1.25 : 1;
  const internalCost = Math.round((laborHours * 45 + materialEstimate + units * rules.perUnit * 0.35) * urgencyMultiplier);
  const low = Math.round((rules.base + Math.max(0, units - 1) * rules.perUnit + laborHours * 65 + materialEstimate) * urgencyMultiplier);
  const high = Math.round(low * 1.45 + 75);
  const recommended = Math.round((low + high) / 2);
  const partnerCommission = Math.round(recommended * (commissionPercent / 100));
  const profit = Math.max(0, recommended - internalCost - partnerCommission);
  return {
    business: "CompHelp Service",
    service,
    city: clean(input.city || "Los Angeles", 80),
    propertyType: clean(input.propertyType, 120),
    units,
    low,
    high,
    recommended,
    internalCost,
    partnerCommission,
    expectedCommission: partnerCommission,
    profit,
    profitMargin: recommended ? Math.round((profit / recommended) * 100) : 0,
    pdfQuoteLink: `/api/marketplace-quote?id=${clean(input.estimateId || "generated-estimate", 120)}`,
    customerQuoteText: `Based on your project, the estimated ${service.toLowerCase()} range is $${low} - $${high}. Recommended planning estimate: $${recommended}. Final pricing depends on site conditions.`
  };
}

function main() {
  const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
    const [key, value = ""] = arg.replace(/^--/, "").split("=");
    return [key, value];
  }));
  const result = estimate(args);
  log("estimate_generated", result);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();

module.exports = { estimate };
