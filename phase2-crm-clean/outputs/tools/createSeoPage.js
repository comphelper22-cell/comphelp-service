const fs = require("fs");
const path = require("path");
const { createUnifiedDiff } = require("./updateWebsite");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const COMPANY_PHONE = "+1-747-295-1440";
const COMPANY_PHONE_TEL = "+17472951440";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSeoPage(input = {}) {
  const city = String(input.city || "Los Angeles").trim();
  const service = String(input.service || "Security Camera Installation").trim();
  const slug = input.slug || `${slugify(service)}-${slugify(city)}`;
  const canonical = `https://comphelp.ai/${slug}`;
  const title = `${service} ${city} | CompHelp Service`;
  const description = `CompHelp Service provides ${service.toLowerCase()} in ${city} for homes, offices, apartments, retail spaces, and small businesses. Request a free local estimate.`;
  const mapQuery = encodeURIComponent(`${city}, California`);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="${escapeHtml(`${service} ${city}, ${city} ${service}, CompHelp Service ${city}`)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="CompHelp Service">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"CompHelp Service","telephone":"${COMPANY_PHONE}","email":"comphelper22@gmail.com","url":"${canonical}","areaServed":{"@type":"City","name":"${escapeHtml(city)}"},"description":"${escapeHtml(description)}","serviceType":"${escapeHtml(service)}"}</script>
  <style>
    :root{--bg:#070b10;--panel:#101923;--text:#f5f8fb;--muted:#a8b6c2;--line:rgba(255,255,255,.14);--accent:#25e1b1;--gold:#ffd166;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 80% 5%,rgba(37,225,177,.14),transparent 30rem),linear-gradient(180deg,#070b10,#0a1118 48%,#070b10);color:var(--text)}a{color:inherit;text-decoration:none}.wrap{width:min(1140px,calc(100% - 2rem));margin:auto}.nav{position:sticky;top:0;z-index:5;background:rgba(7,11,16,.86);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}.nav .wrap{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:1rem}.brand{font-weight:900}.brand span{color:var(--accent)}.links{display:flex;gap:1rem;color:var(--muted);font-weight:750}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:.8rem 1rem;border-radius:8px;border:1px solid var(--line);font-weight:900}.btn.primary{background:var(--accent);color:#03100d;border:0}.hero{padding:5rem 0 3rem}.grid{display:grid;grid-template-columns:1.05fr .95fr;gap:2rem;align-items:center}.eyebrow{color:var(--accent);font-weight:900}.hero h1{font-size:clamp(2.3rem,6vw,5rem);line-height:.98;margin:.8rem 0 1rem}.copy{color:#d6e1e8;line-height:1.7;font-size:1.08rem}.panel,.card{background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.035));border:1px solid var(--line);border-radius:8px}.panel{padding:1.2rem;box-shadow:0 24px 70px rgba(0,0,0,.32)}.trust{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin:1.4rem 0}.trust div,.card{padding:1rem}.trust strong{display:block;color:var(--accent);font-size:1.25rem}.trust span,.card p,li{color:var(--muted);line-height:1.55}.section{padding:3.4rem 0}.section h2{font-size:clamp(1.8rem,4vw,3rem);line-height:1.08;margin:0 0 1rem}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:.9rem}.stars{color:var(--gold)}form{display:grid;gap:.8rem}input,select,textarea{width:100%;min-height:46px;border-radius:8px;border:1px solid var(--line);background:#071016;color:var(--text);padding:.8rem}textarea{min-height:110px}.map iframe{width:100%;min-height:380px;border:0;filter:grayscale(1) invert(.9)}footer{border-top:1px solid var(--line);padding:2rem 0;color:var(--muted)}@media(max-width:820px){.grid,.cards,.trust{grid-template-columns:1fr}.links{display:none}.hero{padding-top:3rem}.btn{width:100%}}
  </style>
</head>
<body>
  <nav class="nav"><div class="wrap"><a class="brand" href="/">CompHelp <span>Service</span></a><div class="links"><a href="/security-camera-installation-los-angeles">Los Angeles</a><a href="/security-camera-installation-burbank">Burbank</a><a href="/security-camera-installation-glendale">Glendale</a></div><a class="btn primary" href="tel:${COMPANY_PHONE_TEL}">Call Now</a></div></nav>
  <main>
    <section class="hero"><div class="wrap grid"><div><p class="eyebrow">${escapeHtml(city)} local service</p><h1>${escapeHtml(service)} in ${escapeHtml(city)}</h1><p class="copy">${escapeHtml(description)} CompHelp Service helps customers choose practical equipment, clean setup options, and reliable service appointments.</p><div class="trust"><div><strong>Free</strong><span>Estimate</span></div><div><strong>Same-day</strong><span>Availability</span></div><div><strong>Local</strong><span>${escapeHtml(city)} support</span></div></div><a class="btn primary" href="#quote">Get Free Estimate</a></div><div class="panel"><h2>Request a ${escapeHtml(city)} Estimate</h2><p class="copy">Tell us what you need and the preferred date.</p><form id="quote"><input name="name" placeholder="Name" required><input name="phone" placeholder="Phone" required><input name="email" type="email" placeholder="Email address"><input name="address" placeholder="${escapeHtml(city)} address"><select name="service" required><option>${escapeHtml(service)}</option></select><textarea name="message" placeholder="Project details and preferred date"></textarea><button class="btn primary" type="submit">Request Estimate</button></form></div></div></section>
    <section class="section"><div class="wrap"><h2>Built for ${escapeHtml(city)} properties.</h2><div class="cards"><article class="card"><h3>Homes</h3><p>Practical setup help for houses, apartments, condos, garages, and entry areas.</p></article><article class="card"><h3>Businesses</h3><p>Reliable service for offices, studios, shops, workspaces, and small business locations.</p></article><article class="card"><h3>Support</h3><p>Clear guidance, clean installation planning, and help after the appointment.</p></article></div></div></section>
    <section class="section map"><div class="wrap"><h2>Serving ${escapeHtml(city)}, CA</h2><iframe title="${escapeHtml(service)} ${escapeHtml(city)} map" loading="lazy" src="https://www.google.com/maps?q=${mapQuery}&output=embed"></iframe></div></section>
  </main>
  <footer><div class="wrap">CompHelp Service - ${escapeHtml(service)} ${escapeHtml(city)} - <a href="/">Main site</a></div></footer>
  <script>document.querySelector("form").addEventListener("submit",function(event){event.preventDefault();alert("Thanks. CompHelp Service will contact you shortly.");});</script>
</body>
</html>
`;
}

async function createSeoPage(input = {}) {
  const city = String(input.city || "").trim();
  const service = String(input.service || "Security Camera Installation").trim();
  if (!city) throw new Error("city is required.");

  const slug = input.slug || `${slugify(service)}-${slugify(city)}`;
  const filePath = `${slug}.html`;
  const fullPath = path.resolve(PROJECT_ROOT, filePath);
  if (!fullPath.startsWith(PROJECT_ROOT)) throw new Error("Unsafe SEO page path.");

  const before = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
  const after = renderSeoPage({ city, service, slug });
  const diff = createUnifiedDiff(filePath, before, after);

  if (!input.approved) {
    return {
      ok: true,
      previewOnly: true,
      requiresApproval: true,
      filePath,
      url: `https://comphelp.ai/${slug}`,
      diff,
      message: "SEO page preview generated. Re-run with approved=true to create or update it."
    };
  }

  fs.writeFileSync(fullPath, after, "utf8");
  return {
    ok: true,
    changed: true,
    filePath,
    url: `https://comphelp.ai/${slug}`,
    diff
  };
}

module.exports = {
  createSeoPage,
  renderSeoPage,
  slugify
};
