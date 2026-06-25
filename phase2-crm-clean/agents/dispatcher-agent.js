const { compareVendors } = require("./vendor-finder-agent");
const { estimate } = require("./estimate-agent");
const { clean, id, readCollection, writeCollection, logCommunication } = require("./outreach-core");

function canCompHelpDoDirect(service) {
  return ["security camera installation", "smart home setup", "wifi & network installation", "computer repair", "data recovery"]
    .includes(clean(service, 120).toLowerCase());
}

function dispatchJob(input = {}) {
  const service = clean(input.service || "Security Camera Installation", 120);
  const direct = canCompHelpDoDirect(service);
  const vendorRecommendation = direct ? null : compareVendors({ service });
  const estimateDraft = estimate({
    service,
    city: input.city,
    units: input.units || input.jobSize || 1,
    laborHours: input.laborHours || 2,
    materialEstimate: input.materialEstimate || 0,
    commissionPercent: input.commissionPercent || 10
  });
  const draft = {
    id: id("dispatch"),
    customerName: clean(input.customerName, 120),
    service,
    city: clean(input.city || "Los Angeles", 80),
    canDoDirect: direct,
    topVendors: vendorRecommendation ? vendorRecommendation.top3 : [],
    vendorQuoteRequestDraft: vendorRecommendation ? `Please quote ${service} in ${clean(input.city || "Los Angeles", 80)}. Scope: ${clean(input.scope || input.notes, 700)}` : "",
    estimateDraft,
    status: "needs_owner_approval",
    ownerApprovalRequired: true,
    recommendation: direct ? "Handle directly through CompHelp Service unless schedule or scope requires partner support." : "Request quotes from top vendors before sending customer final quote."
  };
  logCommunication({ kind: "dispatcher", recipient: draft.customerName || "owner", status: "draft", body: draft.recommendation });
  return draft;
}

function compareVendorResponses(input = {}) {
  const responses = Array.isArray(input.responses) ? input.responses : [];
  const ranked = responses.map((item) => {
    const score = 100 - Number(item.price || 9999) / 50 + Number(item.rating || 4) * 8 - Number(item.distance || 20) + Number(item.commissionPercent || 0);
    return { ...item, score: Math.round(score) };
  }).sort((a, b) => b.score - a.score);
  return { top3: ranked.slice(0, 3), bestOption: ranked[0] || null, ownerApprovalRequired: true };
}

function saveQuoteRequest(input = {}) {
  const data = readCollection("queue");
  const request = { id: id("vendor_quote"), kind: "vendor_quote_request", status: "needs_approval", approved: false, createdAt: new Date().toISOString(), ...input };
  data.items.unshift(request);
  writeCollection("queue", data);
  return request;
}

function main() {
  const result = dispatchJob({ service: process.argv[2], city: process.argv[3] });
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();

module.exports = { dispatchJob, compareVendorResponses, saveQuoteRequest };
