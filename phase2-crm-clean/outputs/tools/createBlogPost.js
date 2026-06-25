const fs = require("fs");
const path = require("path");
const { createUnifiedDiff } = require("./updateWebsite");
const { slugify } = require("./createSeoPage");

const PROJECT_ROOT = path.resolve(__dirname, "..");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBlogPost(input = {}) {
  const title = String(input.title || "CompHelp Service Guide").trim();
  const topic = String(input.topic || title).trim();
  const city = String(input.city || "Los Angeles").trim();
  const slug = input.slug || `blog-${slugify(title)}`;
  const canonical = `https://comphelp.ai/${slug}`;
  const description = String(input.description || `Helpful guidance from CompHelp Service about ${topic.toLowerCase()} in ${city}.`).trim();
  const sections = Array.isArray(input.sections) && input.sections.length
    ? input.sections
    : [
        { heading: `When to consider ${topic}`, body: `If you are comparing options in ${city}, start with the problem you want solved, the timeline, and the property details. CompHelp Service can help you choose a practical setup and book a free estimate.` },
        { heading: "What to prepare before your estimate", body: "Share your name, phone, service needed, address, preferred date, and a short description of the issue or project. Photos can also help if the project involves cameras, networking, or computer repair." },
        { heading: "How CompHelp Service helps", body: "CompHelp Service focuses on clear recommendations, local availability, and reliable support for security cameras, smart home setup, WiFi and network installation, and computer repair." }
      ];

  const renderedSections = sections.map((section) => `
    <section class="section">
      <div class="wrap">
        <h2>${escapeHtml(section.heading)}</h2>
        <p class="copy">${escapeHtml(section.body)}</p>
      </div>
    </section>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | CompHelp Service</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="${escapeHtml(title)} | CompHelp Service">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="CompHelp Service">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)} | CompHelp Service">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"BlogPosting","headline":"${escapeHtml(title)}","description":"${escapeHtml(description)}","author":{"@type":"Organization","name":"CompHelp Service"},"publisher":{"@type":"Organization","name":"CompHelp Service"},"mainEntityOfPage":"${canonical}"}</script>
  <style>:root{--bg:#070b10;--text:#f5f8fb;--muted:#a8b6c2;--line:rgba(255,255,255,.14);--accent:#25e1b1;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#070b10,#0a1118 48%,#070b10);color:var(--text)}a{color:inherit;text-decoration:none}.wrap{width:min(920px,calc(100% - 2rem));margin:auto}.nav{border-bottom:1px solid var(--line);background:rgba(7,11,16,.88);backdrop-filter:blur(16px)}.nav .wrap{min-height:72px;display:flex;align-items:center;justify-content:space-between}.brand{font-weight:900}.brand span{color:var(--accent)}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:.8rem 1rem;border-radius:8px;background:var(--accent);color:#03100d;font-weight:900}.hero{padding:5rem 0 2rem}.eyebrow{color:var(--accent);font-weight:900}.hero h1{font-size:clamp(2.2rem,6vw,4.5rem);line-height:1;margin:.8rem 0 1rem}.copy{color:#d6e1e8;line-height:1.75;font-size:1.08rem}.section{padding:2.3rem 0}.section h2{font-size:clamp(1.6rem,4vw,2.4rem);line-height:1.1;margin:0 0 1rem}footer{border-top:1px solid var(--line);padding:2rem 0;color:var(--muted)}@media(max-width:760px){.nav .wrap{gap:1rem}.btn{width:auto}.hero{padding-top:3rem}}</style>
</head>
<body>
  <nav class="nav"><div class="wrap"><a class="brand" href="/">CompHelp <span>Service</span></a><a class="btn" href="tel:+17472951440">Call Now</a></div></nav>
  <main>
    <section class="hero"><div class="wrap"><p class="eyebrow">CompHelp Service Guide</p><h1>${escapeHtml(title)}</h1><p class="copy">${escapeHtml(description)}</p><a class="btn" href="/#contact">Get Free Estimate</a></div></section>
    ${renderedSections}
  </main>
  <footer><div class="wrap">CompHelp Service - ${escapeHtml(city)} - <a href="/">Main site</a></div></footer>
</body>
</html>
`;
}

async function createBlogPost(input = {}) {
  const title = String(input.title || "").trim();
  if (!title) throw new Error("title is required.");

  const slug = input.slug || `blog-${slugify(title)}`;
  const filePath = `${slug}.html`;
  const fullPath = path.resolve(PROJECT_ROOT, filePath);
  if (!fullPath.startsWith(PROJECT_ROOT)) throw new Error("Unsafe blog page path.");

  const before = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
  const after = renderBlogPost({ ...input, slug });
  const diff = createUnifiedDiff(filePath, before, after);

  if (!input.approved) {
    return {
      ok: true,
      previewOnly: true,
      requiresApproval: true,
      filePath,
      url: `https://comphelp.ai/${slug}`,
      diff,
      message: "Blog post preview generated. Re-run with approved=true to create or update it."
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
  createBlogPost,
  renderBlogPost
};
