const { slugify } = require("./optimizeImages");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildTitle(item) {
  const city = item.city || "Los Angeles";
  return `${item.serviceLabel || "Service"} job in ${city}`;
}

function buildDescription(item) {
  if (item.ownerNote) return item.ownerNote;
  return `Completed ${String(item.serviceLabel || "service").toLowerCase()} project for a local customer in ${item.city || "Los Angeles"}.`;
}

function buildAltText(item) {
  const city = item.city || "Los Angeles";
  return `${item.serviceLabel || "CompHelp Service"} project in ${city} by CompHelp Service`;
}

function mediaHtml(item) {
  const mediaUrl = escapeHtml(item.mediaUrl);
  const altText = escapeHtml(item.altText);

  if (item.beforeMediaUrl && item.afterMediaUrl) {
    return `<div class="media-box before-after" role="group" aria-label="${altText}"><img src="${escapeHtml(item.beforeMediaUrl)}" alt="${altText} before" loading="lazy" decoding="async"><img src="${escapeHtml(item.afterMediaUrl)}" alt="${altText} after" loading="lazy" decoding="async"></div>`;
  }

  if (item.mediaType === "video") {
    return `<video class="media-box" controls preload="metadata" aria-label="${altText}"><source src="${mediaUrl}"></video>`;
  }

  if (item.mediaType === "youtube") {
    return `<iframe class="media-box" src="${mediaUrl}" title="${altText}" loading="lazy" allowfullscreen></iframe>`;
  }

  if (item.mediaType === "tiktok") {
    return `<blockquote class="media-box tiktok-embed" cite="${mediaUrl}"><a href="${mediaUrl}">${altText}</a></blockquote>`;
  }

  return `<img class="media-box" src="${mediaUrl}" alt="${altText}" loading="lazy" decoding="async">`;
}

function createGalleryItem(item, options = {}) {
  const date = options.date || new Date().getFullYear().toString();
  const service = item.serviceLabel || options.serviceLabel || "CompHelp Service";
  const city = item.city || options.city || "Los Angeles";
  const title = options.title || buildTitle({ ...item, city, serviceLabel: service });
  const description = options.description || buildDescription({ ...item, city, serviceLabel: service });
  const caption = options.caption || `${service} completed in ${city}.`;
  const altText = options.altText || buildAltText({ ...item, city, serviceLabel: service });

  const json = {
    title,
    description,
    service,
    city,
    date,
    mediaType: item.mediaType || "image",
    mediaUrl: item.mediaUrl,
    beforeMediaUrl: item.beforeMediaUrl || "",
    afterMediaUrl: item.afterMediaUrl || "",
    caption,
    altText,
    thumbnailUrl: item.thumbnailUrl || ""
  };

  const html = `<article class="card" data-media-id="${escapeHtml(slugify(title))}">${mediaHtml(json)}<h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><span class="pill">${escapeHtml(service)}</span><span class="pill">${escapeHtml(city)}</span><span class="pill">${escapeHtml(date)}</span><p>${escapeHtml(caption)}</p></article>`;

  return {
    json,
    html
  };
}

module.exports = {
  createGalleryItem,
  escapeHtml
};
