(function () {
  "use strict";

  var SERVICES = {
    "/security-camera-installation": "Security Camera Installation",
    "/security-camera-installation.html": "Security Camera Installation",
    "/smart-home-setup": "Smart Home Setup",
    "/smart-home-setup.html": "Smart Home Setup",
    "/wifi-network-installation": "WiFi & Network Installation",
    "/wifi-network-installation.html": "WiFi & Network Installation",
    "/computer-repair": "Computer Repair",
    "/computer-repair.html": "Computer Repair",
    "/data-recovery": "Data Recovery",
    "/data-recovery.html": "Data Recovery"
  };

  var SERVICE_KEYS = {
    "Security Camera Installation": "security-camera-installation",
    "Smart Home Setup": "smart-home-setup",
    "WiFi & Network Installation": "wifi-network-installation",
    "Computer Repair": "computer-repair",
    "Data Recovery": "data-recovery"
  };

  var currentService = SERVICES[location.pathname] || "";
  if (!currentService) return;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function mediaMarkup(item) {
    var alt = escapeHtml(item.altText || item.title || currentService);
    var url = escapeHtml(item.mediaUrl || "");
    if (item.mediaType === "video") {
      return '<video class="media-box" controls preload="metadata" aria-label="' + alt + '"><source src="' + url + '"></video>';
    }
    return '<img class="media-box" src="' + url + '" alt="' + alt + '" loading="lazy" decoding="async">';
  }

  function renderCard(item) {
    return '<article class="card" data-dynamic-gallery="true">' +
      mediaMarkup(item) +
      '<h3>' + escapeHtml(item.title) + '</h3>' +
      '<p>' + escapeHtml(item.description) + '</p>' +
      '<span class="pill">' + escapeHtml(item.service) + '</span>' +
      '<span class="pill">' + escapeHtml(item.city) + '</span>' +
      '<span class="pill">' + escapeHtml(item.date) + '</span>' +
      '<p>' + escapeHtml(item.caption || "") + '</p>' +
    '</article>';
  }

  async function renderDynamicGallery() {
    var gallery = document.querySelector(".gallery-data");
    var cards = gallery && gallery.parentElement ? gallery.parentElement.querySelector(".cards") : null;
    if (!cards) return;

    try {
      var response = await fetch("/data/gallery.json", { cache: "no-store" });
      if (!response.ok) return;
      var data = await response.json();
      var items = Array.isArray(data.items) ? data.items : [];
      var currentUrls = new Set(Array.from(cards.querySelectorAll("source,img")).map(function (node) {
        return node.getAttribute("src");
      }));
      var html = items
        .filter(function (item) { return item.service === currentService && item.status !== "draft"; })
        .filter(function (item) { return item.mediaUrl && !currentUrls.has(item.mediaUrl); })
        .map(renderCard)
        .join("");
      if (!html) return;
      var marker = Array.from(cards.childNodes).find(function (node) {
        return node.nodeType === 8 && node.nodeValue.indexOf("ADD NEW JOB MEDIA ITEM HERE") !== -1;
      });
      if (marker) {
        var holder = document.createElement("div");
        holder.innerHTML = html;
        Array.from(holder.children).forEach(function (child) { cards.insertBefore(child, marker); });
      } else {
        cards.insertAdjacentHTML("beforeend", html);
      }
    } catch (_) {
      return;
    }
  }

  function injectAdminStyles() {
    if (document.getElementById("admin-gallery-style")) return;
    var style = document.createElement("style");
    style.id = "admin-gallery-style";
    style.textContent = ".admin-gallery-button{position:fixed;right:1rem;bottom:1rem;z-index:40;width:auto;box-shadow:0 16px 40px rgba(0,0,0,.35)}.admin-gallery-backdrop{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);padding:1rem}.admin-gallery-backdrop.is-open{display:flex}.admin-gallery-modal{width:min(720px,100%);max-height:92vh;overflow:auto;background:#081119;border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:1rem;box-shadow:0 24px 80px rgba(0,0,0,.55)}.admin-gallery-row{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}.admin-gallery-modal label{display:block;color:#d6e1e8;font-weight:800;margin-top:.45rem}.admin-gallery-check{display:flex;gap:.55rem;align-items:flex-start;margin:.8rem 0;color:#d6e1e8}.admin-gallery-check input{width:auto;min-height:auto;margin-top:.35rem}.admin-gallery-actions{display:flex;gap:.75rem;justify-content:flex-end;flex-wrap:wrap}.admin-gallery-status{min-height:1.5rem;color:#25e1b1;font-weight:800}@media(max-width:720px){.admin-gallery-row{grid-template-columns:1fr}.admin-gallery-button{left:1rem;right:1rem;width:calc(100% - 2rem)}}";
    document.head.appendChild(style);
  }

  function buildAdminModal() {
    injectAdminStyles();
    var button = document.createElement("button");
    button.type = "button";
    button.className = "btn primary admin-gallery-button";
    button.textContent = "+ Add Project Photos";
    document.body.appendChild(button);

    var modal = document.createElement("div");
    modal.className = "admin-gallery-backdrop";
    modal.innerHTML = '<div class="admin-gallery-modal" role="dialog" aria-modal="true" aria-labelledby="admin-gallery-title">' +
      '<h2 id="admin-gallery-title">Add Project Photos</h2>' +
      '<form id="admin-gallery-form">' +
        '<div class="admin-gallery-row"><label>Admin code<input name="adminSecret" type="password" autocomplete="current-password" required></label><label>Service Category<select name="service" required><option>Security Camera Installation</option><option>Smart Home Setup</option><option>WiFi & Network Installation</option><option>Computer Repair</option><option>Data Recovery</option></select></label></div>' +
        '<label>Project Title<input name="projectName" required placeholder="Example: Front entry camera setup"></label>' +
        '<div class="admin-gallery-row"><label>City<input name="city" required placeholder="Los Angeles"></label><label>Project date<input name="projectDate" type="date" required></label></div>' +
        '<label>Description<textarea name="description" required placeholder="Short public project note"></textarea></label>' +
        '<label>Upload Photos / Videos<input name="media" type="file" accept="image/*,video/*" multiple required></label>' +
        '<label class="admin-gallery-check"><input name="privacyConfirmed" type="checkbox" required><span>I confirm no private faces, addresses, license plates, passwords, serial numbers, or documents are visible.</span></label>' +
        '<div class="admin-gallery-actions"><button class="btn" type="button" data-admin-close>Cancel</button><button class="btn primary" type="submit">Upload Project</button></div>' +
        '<p class="admin-gallery-status" role="status" aria-live="polite"></p>' +
      '</form>' +
    '</div>';
    document.body.appendChild(modal);

    var form = modal.querySelector("form");
    var status = modal.querySelector(".admin-gallery-status");
    form.service.value = currentService;
    form.projectDate.value = new Date().toISOString().slice(0, 10);

    button.addEventListener("click", function () {
      modal.classList.add("is-open");
      form.adminSecret.focus();
    });
    modal.querySelector("[data-admin-close]").addEventListener("click", function () {
      modal.classList.remove("is-open");
    });
    modal.addEventListener("click", function (event) {
      if (event.target === modal) modal.classList.remove("is-open");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") modal.classList.remove("is-open");
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      status.textContent = "Uploading and creating gallery draft...";
      var submitButton = form.querySelector("button[type='submit']");
      submitButton.disabled = true;

      try {
        var formData = new FormData(form);
        formData.set("serviceKey", SERVICE_KEYS[form.service.value] || "");
        formData.set("pageUrl", location.href);
        var response = await fetch("/api/gallery-upload", {
          method: "POST",
          headers: { "x-admin-upload-secret": form.adminSecret.value },
          body: formData
        });
        var result = await response.json().catch(function () { return {}; });
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Upload failed.");
        }
        status.textContent = "Project saved. Gallery will update after deployment.";
        form.reset();
        form.service.value = currentService;
        form.projectDate.value = new Date().toISOString().slice(0, 10);
      } catch (error) {
        status.textContent = error.message || "Upload failed.";
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  renderDynamicGallery();
  if (new URLSearchParams(location.search).get("admin") === "true") {
    buildAdminModal();
  }
})();
