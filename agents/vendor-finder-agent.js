const fs = require("fs");
const path = require("path");
const { id, readCollection, writeCollection, logCommunication } = require("./outreach-core");
const safeStorage = require("../storage/safe-storage");

const ROOT = path.resolve(__dirname, "..");
const MARKETPLACE_FILE = path.join(ROOT, "data", "marketplace.json");
const LOG_DIR = path.join(ROOT, "logs");

function clean(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function readMarketplace() {
  return JSON.parse(fs.readFileSync(MARKETPLACE_FILE, "utf8").replace(/^\uFEFF/, ""));
}

function log(action, payload) {
  safeStorage.appendLine(path.join(LOG_DIR, "agents.jsonl"), `${JSON.stringify({ timestamp: new Date().toISOString(), agent: "vendor-finder-agent", action, payload })}\n`);
}

function compareVendors(input = {}) {
  const service = clean(input.service || input.category || "Security Camera Installation", 120).toLowerCase();
  const data = readMarketplace();
  const partnerData = readCollection("vendors");
  const vendors = (partnerData.items || []).concat(data.vendors || []).filter((vendor) => {
    const services = Array.isArray(vendor.services) ? vendor.services.join(" ") : String(vendor.services || "");
    const haystack = `${vendor.category || ""} ${services}`.toLowerCase();
    return haystack.includes(service.split(" ")[0]) || haystack.includes(service);
  });
  const ranked = vendors.map((vendor) => {
    const rating = Number(vendor.rating || 4);
    const distance = Number(vendor.distanceMiles || 25);
    const commission = Number(vendor.commissionPercent || 0);
    const score = Math.round(rating * 20 - distance * 0.75 + commission * 0.35);
    return {
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      serviceArea: vendor.serviceArea || vendor.city,
      rating,
      commissionPercent: commission,
      availability: vendor.availability,
      score,
      reason: "Ranked by service fit, rating, distance, availability, and commission percent."
    };
  }).sort((a, b) => b.score - a.score);
  return {
    service,
    top3: ranked.slice(0, 3),
    cheapestQualifiedVendor: ranked[0] || null,
    trackedQuoteFields: ["vendorName", "price", "availability", "rating", "commissionPercent", "notes"]
  };
}

const VENDOR_CATEGORIES = ["camera installers", "electricians", "low voltage contractors", "IT support", "data recovery", "WiFi/network installers", "handymen"];

function saveVendorProfile(input = {}) {
  const vendor = {
    id: input.id || id("vendor"),
    source: clean(input.source || "manual_research", 120),
    name: clean(input.name || input.vendorName, 140),
    category: clean(input.category || VENDOR_CATEGORIES[0], 120),
    serviceArea: clean(input.serviceArea || "Los Angeles County", 180),
    rating: Number(input.rating || 0),
    phone: clean(input.phone, 80),
    email: clean(input.email, 180),
    website: clean(input.website, 240),
    commissionPercent: Number(input.commissionPercent || 10),
    status: "needs_approval",
    approved: false,
    createdAt: new Date().toISOString()
  };
  const data = readCollection("vendors");
  const duplicate = data.items.some((item) => clean(item.name).toLowerCase() === vendor.name.toLowerCase() && clean(item.serviceArea).toLowerCase() === vendor.serviceArea.toLowerCase());
  if (!duplicate) {
    data.items.unshift(vendor);
    writeCollection("vendors", data);
    logCommunication({ kind: "vendor_finder", recipient: vendor.email || vendor.phone || vendor.name, status: "needs_approval", body: `Vendor saved: ${vendor.name}` });
  }
  return duplicate ? { ...vendor, duplicate: true } : vendor;
}

function findVendors(input = {}) {
  const category = clean(input.category || VENDOR_CATEGORIES[0], 120);
  return {
    categories: VENDOR_CATEGORIES,
    saved: saveVendorProfile({
      name: input.name || `${category} prospect`,
      category,
      serviceArea: input.serviceArea || "Los Angeles County",
      commissionPercent: input.commissionPercent || 10
    }),
    note: "Vendor profile saved as needs_approval. No contact was sent."
  };
}

function main() {
  const serviceArg = process.argv.slice(2).join(" ") || "Security Camera Installation";
  const result = process.argv[2] === "find"
    ? findVendors({ category: process.argv[3] })
    : compareVendors({ service: serviceArg });
  log("vendors_compared", result);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();

module.exports = { compareVendors, saveVendorProfile, findVendors, VENDOR_CATEGORIES };
