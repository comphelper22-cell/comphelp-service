const fs = require("fs");
const path = require("path");
const { estimate } = require("./estimate-agent");
const { compareVendors } = require("./vendor-finder-agent");
const safeStorage = require("../storage/safe-storage");

const ROOT = path.resolve(__dirname, "..");
const MARKETPLACE_FILE = path.join(ROOT, "data", "marketplace.json");
const LOG_DIR = path.join(ROOT, "logs");

function readMarketplace() {
  return JSON.parse(fs.readFileSync(MARKETPLACE_FILE, "utf8").replace(/^\uFEFF/, ""));
}

function log(action, payload) {
  safeStorage.appendLine(path.join(LOG_DIR, "agents.jsonl"), `${JSON.stringify({ timestamp: new Date().toISOString(), agent: "marketplace-agent", action, payload })}\n`);
}

function dashboard() {
  const data = readMarketplace();
  const leads = data.leads || [];
  const vendors = data.vendors || [];
  const estimates = data.estimates || [];
  const commissions = data.commissions || [];
  const expectedCommission = commissions.reduce((sum, item) => sum + Number(item.expectedCommission || 0), 0);
  return {
    brand: "CompHelp Service",
    leads: leads.length,
    vendors: vendors.length,
    estimates: estimates.length,
    expectedCommission,
    responsibilities: [
      "Manage leads",
      "Manage vendors",
      "Manage estimates",
      "Manage quote requests",
      "Manage commissions",
      "Recommend cheapest qualified vendor",
      "Calculate profit margin",
      "Create customer quotes"
    ]
  };
}

function run(action, args) {
  if (action === "estimate") return estimate({ service: args.join(" ") || "Security Camera Installation" });
  if (action === "vendors") return compareVendors({ service: args.join(" ") || "Security Camera Installation" });
  return dashboard();
}

function main() {
  const [action = "dashboard", ...args] = process.argv.slice(2);
  const result = run(action, args);
  log(action, result);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();

module.exports = { dashboard, run };
