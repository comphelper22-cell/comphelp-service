const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { leadSources } = require("../marketing/lead-sources");

const now = Date.now();
const result = leadSources({ data: {
  leads: [
    { name: "A", source: "instagram", service: "Cameras", city: "Burbank", status: "booked", createdAt: new Date(now - 86400000).toISOString(), files: [{ id: 1 }], attachments: [{ id: 1 }], media: [{ id: 1 }, { id: 2 }], sharedMedia: [{ id: 1 }] },
    { name: "B", source: "instagram", service: "Wi-Fi", city: "Burbank", createdAt: new Date(now - 9 * 86400000).toISOString() },
    { name: "C", source: "website", service: "Repair", city: "Glendale", createdAt: new Date(now - 2 * 86400000).toISOString() },
    { name: "D", source: "__proto__", service: "constructor", city: "toString", createdAt: "invalid" },
    { name: "E", source: "future", createdAt: new Date(now + 86400000).toISOString() }
  ]
} });
assert.strictEqual(result.ok, true);
const instagram = result.data.sourceAnalytics.instagram;
assert.strictEqual(instagram.leads, 2);
assert.strictEqual(instagram.converted, 1);
assert.strictEqual(instagram.conversionRate, 50);
assert.strictEqual(instagram.sharedFiles, 1);
assert.strictEqual(instagram.sharedMedia, 2);
assert.strictEqual(instagram.weeklyTrend.length, 6);
assert.strictEqual(instagram.topServices.length, 2);
assert.strictEqual(instagram.topCities[0].name, "Burbank");
assert.strictEqual(result.data.bySource.__proto__, 1, "Prototype-shaped source names must be counted safely.");
assert.strictEqual(result.data.sourceAnalytics.__proto__.currentPeriod, 0, "Invalid timestamps must not enter current metrics.");
assert.deepStrictEqual(result.data.sourceAnalytics.__proto__.weeklyTrend, [0, 0, 0, 0, 0, 0]);
assert.strictEqual(result.data.sourceAnalytics.future.currentPeriod, 0, "Future timestamps must not enter current metrics.");
assert.strictEqual(result.data.sourceAnalytics.website.growth, null, "Zero-baseline growth must be reported as unavailable.");

const html = fs.readFileSync(path.join(__dirname, "..", "marketplace.html"), "utf8");
const js = fs.readFileSync(path.join(__dirname, "..", "assets", "marketplace-manager.js"), "utf8");
assert.match(html, /id="leadSourceAnalyticsDialog"/);
assert.match(html, /id="leadSourceTrendChart"/);
assert.match(html, /Shared assets/);
assert.match(html, /prefers-reduced-motion:reduce/);
assert.match(js, /function renderLeadSourceApps\(/);
assert.match(js, /function openLeadSourceAnalytics\(/);
assert.match(js, /function sourceLineChart\(/);
assert.match(js, /data-lead-source/);
assert.match(js, /Demo channel performance · sample data/);
assert.match(js, /No prior-period baseline/);

console.log(JSON.stringify({ ok: true, interactiveLeadSourceAnalytics: "validated" }, null, 2));
