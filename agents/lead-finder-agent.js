const {
  clean,
  id,
  readCollection,
  writeCollection,
  createMessageDraft,
  logCommunication
} = require("./outreach-core");

const CATEGORIES = ["liquor stores", "smoke shops", "restaurants", "laundromats", "auto repair shops", "small markets", "offices"];

function normalizeLead(input = {}) {
  const category = clean(input.category || CATEGORIES[0], 80);
  const businessName = clean(input.businessName || input.name, 140);
  return {
    id: input.id || id("lead"),
    source: clean(input.source || "manual_research", 120),
    businessName,
    phone: clean(input.phone, 80),
    website: clean(input.website, 240),
    city: clean(input.city || "Los Angeles", 80),
    category,
    serviceNeed: clean(input.serviceNeed || "security camera installation", 160),
    status: "needs_approval",
    approved: false,
    outreachDraft: createMessageDraft({ businessName, serviceNeed: input.serviceNeed || "security camera installation", channel: "sms" }),
    createdAt: new Date().toISOString()
  };
}

function saveLead(input = {}) {
  const lead = normalizeLead(input);
  const data = readCollection("leads");
  const duplicate = data.items.some((item) => {
    return clean(item.businessName).toLowerCase() === lead.businessName.toLowerCase() && clean(item.city).toLowerCase() === lead.city.toLowerCase();
  });
  if (!duplicate) {
    data.items.unshift(lead);
    writeCollection("leads", data);
    logCommunication({ kind: "lead_finder", recipient: lead.phone || lead.website || lead.businessName, status: "needs_approval", body: `Lead saved: ${lead.businessName}` });
  }
  return duplicate ? { ...lead, duplicate: true } : lead;
}

function findLeads(input = {}) {
  const city = clean(input.city || "Los Angeles", 80);
  const categories = Array.isArray(input.categories)
    ? input.categories
    : input.category
      ? [input.category]
      : CATEGORIES;
  const leads = categories.map((category) => saveLead({
    source: "owner_research_queue",
    businessName: clean(input.businessName, 140) || `${city} ${category} prospect`,
    city,
    category,
    serviceNeed: input.serviceNeed || "security camera installation"
  }));
  return { categories, city, leads, note: "Leads are saved as needs_approval. No contact was sent." };
}

function main() {
  const [city = "Los Angeles", category = "liquor stores"] = process.argv.slice(2);
  const result = findLeads({ city, categories: [category] });
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();

module.exports = { CATEGORIES, saveLead, findLeads };
