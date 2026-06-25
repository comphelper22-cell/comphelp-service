const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT, loadMediaConfig } = require("./watchUploads");

const MARKER = "<!-- ADD NEW JOB MEDIA ITEM HERE -->";

function createUnifiedDiff(filePath, before, after) {
  const beforeLines = before.split(/\r?\n/);
  const afterLines = after.split(/\r?\n/);
  const lines = [`--- ${filePath}`, `+++ ${filePath}`];
  const max = Math.max(beforeLines.length, afterLines.length);

  for (let index = 0; index < max; index += 1) {
    if (beforeLines[index] === afterLines[index]) continue;
    if (beforeLines[index] !== undefined) lines.push(`-${beforeLines[index]}`);
    if (afterLines[index] !== undefined) lines.push(`+${afterLines[index]}`);
  }

  return lines.join("\n");
}

function updateGalleryJson(source, itemJson) {
  return source.replace(
    /<script type="application\/json" class="gallery-data">([\s\S]*?)<\/script>/,
    (match, jsonText) => {
      let items = [];
      try {
        items = JSON.parse(jsonText);
      } catch (_) {
        items = [];
      }
      items.push(itemJson);
      return `<script type="application/json" class="gallery-data">${JSON.stringify(items)}</script>`;
    }
  );
}

function updateServicePage(input = {}) {
  const config = input.config || loadMediaConfig();
  const service = config.services[input.serviceKey];

  if (!service) {
    return { ok: false, error: "Unknown service key." };
  }

  const pagePath = path.join(PROJECT_ROOT, service.page);
  if (!fs.existsSync(pagePath)) {
    return { ok: false, error: `Service page not found: ${service.page}` };
  }

  const before = fs.readFileSync(pagePath, "utf8");
  if (!before.includes(MARKER)) {
    return { ok: false, error: `Gallery marker not found in ${service.page}` };
  }

  let after = updateGalleryJson(before, input.galleryItem.json);
  after = after.replace(MARKER, `${input.galleryItem.html}${MARKER}`);
  const diff = createUnifiedDiff(service.page, before, after);

  if (!input.approved) {
    return {
      ok: true,
      previewOnly: true,
      requiresApproval: true,
      page: service.page,
      diff
    };
  }

  fs.writeFileSync(pagePath, after, "utf8");
  return {
    ok: true,
    updated: true,
    page: service.page,
    diff
  };
}

module.exports = {
  updateServicePage,
  createUnifiedDiff,
  MARKER
};
