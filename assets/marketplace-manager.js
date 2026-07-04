(function () {
  "use strict";

  var state = {
    config: null,
    lastEstimateId: "",
    lastEstimateEmail: ""
  };

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formData(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = String(value).trim();
    });
    return data;
  }

  function adminSecret() {
    return $("#adminSecret").value.trim();
  }

  function setSecret(secret) {
    $("#adminSecret").value = secret;
    localStorage.setItem("marketplaceSecret", secret);
  }

  function setRole(role) {
    $("#rolePill").textContent = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Not logged in";
    localStorage.setItem("marketplaceRole", role || "");
  }

  async function api(action, payload) {
    var response = await fetch("/api/marketplace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-marketplace-admin-secret": adminSecret()
      },
      body: JSON.stringify({ action: action, payload: payload || {} })
    });
    var body = await response.json().catch(function () { return {}; });
    if (!response.ok || body.ok === false) {
      throw new Error(body.error || "Marketplace request failed.");
    }
    return body;
  }

  async function routeApi(endpoint, action, payload) {
    var requestBody = Object.assign({ action: action }, payload || {});
    var response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-marketplace-admin-secret": adminSecret()
      },
      body: JSON.stringify(requestBody)
    });
    var body = await response.json().catch(function () { return {}; });
    if (!response.ok || body.ok === false) {
      throw new Error(body.error || "Request failed.");
    }
    return body;
  }

  async function systemApi(moduleName, action, payload) {
    return routeApi("/api/system", action, { module: moduleName, payload: payload || {} });
  }

  async function businessApi(action, payload) {
    return systemApi("business-os", action || "dashboard", payload || {});
  }

  async function titanApi(action, payload) {
    return systemApi("titan", action || "titanStatus", payload || {});
  }

  async function brainApi(action, payload) {
    return systemApi("brain", action || "brainStatus", payload || {});
  }

  async function memoryApi(action, payload) {
    return systemApi("memory", action || "status", payload || {});
  }

  async function contextApi(action, payload) {
    return systemApi("context", action || "status", payload || {});
  }

  async function getDashboard() {
    var response = await fetch("/api/marketplace?resource=dashboard", {
      cache: "no-store",
      headers: { "x-marketplace-admin-secret": adminSecret() }
    });
    return response.json();
  }

  async function login(secret) {
    if (!secret) throw new Error("Missing admin code");
    var response = await fetch("/api/marketplace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-marketplace-admin-secret": secret
      },
      body: JSON.stringify({ action: "login", payload: {} })
    });
    var body = await response.json().catch(function () { return {}; });
    if (!response.ok || body.ok === false) {
      throw new Error(body.error || "Invalid code");
    }
    return body;
  }

  async function uploadProject(form) {
    var response = await fetch("/api/marketplace-project-upload", {
      method: "POST",
      headers: { "x-marketplace-admin-secret": adminSecret() },
      body: new FormData(form)
    });
    var body = await response.json().catch(function () { return {}; });
    if (!response.ok || body.ok === false) throw new Error(body.error || "Project upload failed.");
    return body;
  }

  function fillSelects(config) {
    var serviceOptions = config.services.map(function (service) {
      return '<option>' + escapeHtml(service) + '</option>';
    }).join("");
    var categoryOptions = config.vendorCategories.map(function (category) {
      return '<option>' + escapeHtml(category) + '</option>';
    }).join("");
    $all("select[name='service']").forEach(function (select) { select.innerHTML = serviceOptions; });
    $all("select[name='category']").forEach(function (select) { select.innerHTML = categoryOptions; });
  }

  function renderMetrics(summary) {
    $("#metrics").innerHTML = [
      ["Total Leads", summary.leads],
      ["New Leads", summary.newLeads || 0],
      ["Contacted", summary.contactedLeads || 0],
      ["Quote Sent", summary.quoteSentLeads || 0],
      ["Won / Lost", (summary.wonLeads || 0) + " / " + (summary.lostLeads || 0)],
      ["Total Vendors", summary.vendors],
      ["Source Leads", summary.sourceLeads || 0],
      ["Total Projects", summary.projects],
      ["Open Projects", summary.openProjects || summary.projects],
      ["Dispatches", summary.dispatches || 0],
      ["Queued Messages", summary.queuedMessages || 0],
      ["Estimated Revenue", "$" + summary.revenue],
      ["Expected Commissions", "$" + summary.expectedCommission],
      ["Conversion", (summary.conversionRate || 0) + "%"],
      ["Gallery Items", summary.publishedGalleryItems || 0],
      ["SMM Drafts", summary.smmDrafts || 0]
    ].map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + metric[1] + '</div></article>';
    }).join("");
  }

  function renderCrmPipeline(crm) {
    var target = $("#crmMetrics");
    if (!target) return;
    crm = crm || { counts: {} };
    var counts = crm.counts || {};
    var metrics = [
      ["Total Leads", crm.totalLeads || 0],
      ["New Lead", counts["New Lead"] || 0],
      ["Contacted", counts.Contacted || 0],
      ["Quote Sent", counts["Quote Sent"] || 0],
      ["Follow-up", counts["Follow-up"] || 0],
      ["Won", counts.Won || 0],
      ["Lost", counts.Lost || 0]
    ];
    target.innerHTML = metrics.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
  }

  function renderWarnings(warnings) {
    var panel = $("#dashboardWarnings");
    if (!warnings || !warnings.length) {
      panel.style.display = "none";
      panel.innerHTML = "";
      return;
    }
    panel.style.display = "block";
    panel.innerHTML = warnings.map(function (warning) {
      return '<span class="pill danger">' + escapeHtml(warning) + '</span>';
    }).join(" ");
  }

  function renderRecentLeads(leads) {
    $("#recentLeads").innerHTML = leads.length ? leads.map(function (lead) {
      return '<div class="row"><strong>' + escapeHtml(lead.name) + '</strong><span>' + escapeHtml(lead.service) + '</span><span>' + escapeHtml(lead.source || lead.phone) + '</span><span class="pill">' + escapeHtml(lead.status || "New Lead") + '</span></div>';
    }).join("") : '<p class="muted">No leads yet.</p>';
  }

  function renderTopVendors(vendors) {
    $("#topVendors").innerHTML = vendors.length ? vendors.map(function (vendor) {
      return '<div class="row"><strong>' + escapeHtml(vendor.name) + '</strong><span>' + escapeHtml(vendor.category) + '</span><span>' + escapeHtml(vendor.city) + '</span><span class="pill">' + escapeHtml(vendor.rating) + ' stars</span></div>';
    }).join("") : '<p class="muted">No vendors yet.</p>';
  }

  function renderVendors(vendors) {
    vendors = (vendors || []).slice().sort(function (a, b) {
      return Number(b.rating || 0) - Number(a.rating || 0) || Number(b.commissionPercent || 0) - Number(a.commissionPercent || 0);
    });
    $("#vendorList").innerHTML = vendors.length ? vendors.map(function (vendor, index) {
      return '<div class="row"><strong>#' + (index + 1) + ' ' + escapeHtml(vendor.name) + '</strong><span>' + escapeHtml(vendor.category) + '<br><span class="muted">' + escapeHtml(vendor.city || "") + '</span></span><span>' + escapeHtml(vendor.serviceArea || "") + '<br><span class="muted">' + escapeHtml(vendor.availability || "") + '</span></span><span class="pill">' + escapeHtml(vendor.rating || "") + ' stars • ' + escapeHtml(vendor.commissionPercent || 0) + '%</span></div>';
    }).join("") : '<p class="muted">No vendors yet.</p>';
  }

  function renderEstimate(estimate) {
    var target = $("#estimateMetrics");
    if (!target || !estimate) return;
    var metrics = [
      ["Low", "$" + (estimate.low || 0)],
      ["High", "$" + (estimate.high || 0)],
      ["Recommended", "$" + (estimate.recommended || 0)],
      ["Internal Cost", "$" + (estimate.internalCost || 0)],
      ["Expected Profit", "$" + (estimate.expectedProfit || 0)]
    ];
    target.innerHTML = metrics.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
  }

  function renderAnalytics(summary) {
    var target = $("#analyticsMetrics");
    if (!target || !summary) return;
    var metrics = [
      ["Revenue", "$" + (summary.revenue || 0)],
      ["Commissions", "$" + (summary.expectedCommission || 0)],
      ["Leads", summary.leads || 0],
      ["Source Leads", summary.sourceLeads || 0],
      ["Conversions", (summary.conversionRate || 0) + "%"],
      ["Vendors", summary.vendors || 0],
      ["Dispatches", summary.dispatches || 0],
      ["Follow-ups", summary.followUps || 0],
      ["Queued", summary.queuedMessages || 0],
      ["Sent Today", summary.messagesSentToday || 0],
      ["Activity", summary.activityLogs || 0],
      ["Marketing Drafts", summary.smmDrafts || 0]
    ];
    target.innerHTML = metrics.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    $("#analyticsResult").textContent = JSON.stringify({
      vendorPerformance: summary.vendorPerformance || [],
      marketingPerformance: summary.marketingPerformance || {}
    }, null, 2);
  }

  function renderCompliance(summary) {
    var target = $("#complianceMetrics");
    if (!target || !summary) return;
    var metrics = [
      ["Paused", summary.paused ? "Yes" : "No"],
      ["Sent Today", summary.messagesSentToday || 0],
      ["Pending Approvals", summary.pendingApprovals || 0],
      ["Opt-outs", summary.optOuts || 0],
      ["Failed", summary.failedMessages || 0],
      ["Bounced", summary.bouncedEmails || 0],
      ["Leads Waiting", summary.leadsWaiting || 0],
      ["Vendors Waiting", summary.vendorsWaiting || 0],
      ["Follow-ups Due", summary.followUpsDue || 0]
    ];
    target.innerHTML = metrics.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
  }

  function renderSocialLeads(social) {
    var target = $("#socialLeadMetrics");
    if (!target || !social) return;
    var metrics = [
      ["Instagram Leads", social.instagramLeads || 0],
      ["TikTok Leads", social.tiktokLeads || 0],
      ["Draft Messages", social.pendingDrafts || 0],
      ["Daily Limit", social.dailyLimit || 10],
      ["Sent Today", social.sentToday || 0],
      ["Paused", social.paused ? "Yes" : "No"]
    ];
    target.innerHTML = metrics.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    if ($("#socialLeadResult")) {
      $("#socialLeadResult").textContent = JSON.stringify({
        leads: social.leads || [],
        drafts: social.drafts || []
      }, null, 2);
    }
  }

  function renderActivityLogs(logs) {
    var target = $("#activityLogList");
    if (!target) return;
    logs = logs || [];
    target.innerHTML = logs.length ? logs.map(function (item) {
      return '<div class="row"><strong>' + escapeHtml(item.type || "activity") + '</strong><span>' + escapeHtml(item.message || "") + '</span><span>' + escapeHtml(item.status || "") + '</span><span class="pill">' + escapeHtml(item.createdAt || item.created_at || "") + '</span></div>';
    }).join("") : '<p class="muted">No activity yet.</p>';
  }

  function renderDeployment(deployment) {
    var target = $("#deploymentMetrics");
    if (!target || !deployment) return;
    var latest = deployment.latest || {};
    var metrics = [
      ["GitHub", deployment.githubConfigured ? "Ready" : "Missing"],
      ["Vercel", deployment.vercelConfigured ? "Ready" : "Missing"],
      ["Auto Deploy", deployment.autoDeploy ? "On" : "Off"],
      ["Branch", deployment.branch || "main"],
      ["Latest", latest.action || "No logs"]
    ];
    target.innerHTML = metrics.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    if ($("#deploymentResult")) {
      $("#deploymentResult").textContent = JSON.stringify(deployment, null, 2);
    }
  }

  function renderBusinessDashboard(payload) {
    var target = $("#businessMetrics");
    if (!target || !payload) return;
    var dashboard = payload.dashboard || payload;
    var widgets = dashboard.widgets || {};
    var notifications = widgets.notifications || [];
    var metrics = [
      ["Revenue", "$" + (widgets.revenue || 0)],
      ["Leads", widgets.leads || 0],
      ["Projects", widgets.projects || 0],
      ["Open Estimates", widgets.openEstimates || 0],
      ["Pending Jobs", widgets.pendingJobs || 0],
      ["Profit", "$" + (widgets.profit || 0)],
      ["Tasks", widgets.tasks || 0],
      ["Notifications", notifications.length || 0]
    ];
    target.innerHTML = metrics.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    if ($("#businessResult")) {
      $("#businessResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderDeveloperCenter(payload, writeOutput) {
    var target = $("#developerMetrics");
    if (!target || !payload) return;
    var report = payload.report || payload;
    var developer = report.developer || report.report || report;
    var deployment = report.deployment || payload.deployment || {};
    var database = report.database || payload.database || deployment.database || {};
    var platform = report.platform || payload.platform || {};
    var summary = developer.summary || {};
    var git = developer.git || deployment.gitStatus || {};
    var metrics = [
      ["Repository Health", developer.ok === false ? "Needs Review" : "OK"],
      ["Validation Status", payload.validation ? (payload.validation.ok ? "Passed" : "Failed") : "Ready"],
      ["Git Status", git.clean ? "Clean" : "Pending"],
      ["Pending Changes", git.changedFiles ? git.changedFiles.length : 0],
      ["Deployment", deployment.deploymentStatus || "approval_required"],
      ["Recent Commits", git.recentCommits ? git.recentCommits.length : 0],
      ["Build Status", deployment.buildStatus || "validation_required"],
      ["Database Mode", database.mode || deployment.databaseHealth || "checking"],
      ["Supabase Status", database.supabaseConfigured ? "configured" : (deployment.supabaseStatus || "json_fallback")],
      ["JSON Fallback", database.jsonFallbackAvailable === false ? "missing" : (deployment.jsonStatus || "ready")],
      ["Last Database Check", database.timestamp || database.generatedAt || "not checked"],
      ["Database Errors", database.errors ? database.errors.length : 0],
      ["Auth Status", platform.authStatus || "not checked"],
      ["RBAC Status", platform.rbacStatus || "not checked"],
      ["Organization Status", platform.organizationStatus || "not checked"],
      ["Session Status", platform.sessionStatus || "not checked"],
      ["Audit Log Status", platform.auditLogStatus || "not checked"],
      ["Backup", deployment.backupStatus || "checking"],
      ["API", deployment.apiStatus ? deployment.apiStatus.filter(function (item) { return item.exists; }).length + "/" + deployment.apiStatus.length : "checking"],
      ["Syntax Issues", summary.syntaxIssues || 0],
      ["Missing Imports", summary.missingImports || 0],
      ["Duplicate Blocks", summary.duplicateBlocks || 0]
    ];
    target.innerHTML = metrics.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    if (writeOutput !== false && $("#developerResult")) {
      $("#developerResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderTitan(payload) {
    var target = $("#titanMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var cards = [
      ["AI Executive Board", data.boardMembers || (data.boardMembers === 0 ? 0 : "ready")],
      ["CompHelp AI Score", data.score || "ready"],
      ["Sprint Quality Gates", data.gates ? data.gates.length : "ready"],
      ["Product Strategy", data.priorities ? data.priorities.length : "ready"],
      ["Customer Feedback", data.channels ? data.channels.length : "ready"],
      ["Performance", data.dimensions ? data.dimensions.performance : "ready"],
      ["Reliability", data.dimensions ? data.dimensions.reliability : "ready"],
      ["Security", data.dimensions ? data.dimensions.security : "ready"],
      ["AI Quality", data.dimensions ? data.dimensions.qa : "ready"],
      ["Competitor Matrix", data.categories ? data.categories.length : "ready"]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    if ($("#titanResult")) {
      $("#titanResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderBrain(payload) {
    var target = $("#brainMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var modules = data.modules || (data.brain && data.brain.modules) || {};
    var memory = data.memory || data.memoryStatus || {};
    var knowledge = data.knowledge || data.knowledgeStatus || {};
    var cards = [
      ["Brain Status", data.status || "ready"],
      ["Memory", memory.status || (data.types ? data.types.length : "ready")],
      ["Recommendations", data.recommendations ? data.recommendations.length : "ready"],
      ["Executive Summary", data.businessHealth || "ready"],
      ["Knowledge", knowledge.status || (data.registry ? data.registry.length : "ready")],
      ["Health", data.ok === false ? "needs review" : "healthy"],
      ["Context", modules.contextEngine || "ready"],
      ["AI Connected", data.externalAiConnected ? "yes" : "no"],
      ["Learning", data.learningEnabled ? "on" : "off"]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    if ($("#brainResult")) {
      $("#brainResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderProjectControl(payload) {
    var target = $("#projectControlMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var cards = [
      ["Current Sprint", data.currentSprint || "Project Control Center Sprint"],
      ["Current Release", data.releaseStatus || data.currentRelease || "v0.7"],
      ["Completed Milestones", data.completedMilestones ? data.completedMilestones.length : "ready"],
      ["Next 3 Sprints", data.nextSprints ? data.nextSprints.length : "ready"],
      ["Ideas Backlog", data.backlogCount || data.totalIdeas || (data.ideas ? data.ideas.length : "ready")],
      ["Blocked Items", data.blockedItems ? data.blockedItems.length : "ready"],
      ["Quality Gates", data.qualityGateStatus ? Object.keys(data.qualityGateStatus).length : "ready"],
      ["Deploy Checklist", data.deployApproval || "approval required"]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    if ($("#projectControlResult")) {
      $("#projectControlResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderMemory(payload) {
    var target = $("#memoryMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var memory = data.memory || data;
    var registry = data.registry || memory.registry || {};
    var stats = data.stats || memory.stats || data;
    var statItems = Array.isArray(stats) ? stats : (Array.isArray(stats.data) ? stats.data : []);
    var cards = [
      ["Memory", memory.status || "ready"],
      ["Memory Health", data.ok === false ? "needs review" : "healthy"],
      ["Memory Statistics", statItems.length || (data.providerCount || "ready")],
      ["Memory Registry", registry.providerCount || (registry.data && registry.data.providerCount) || "ready"],
      ["Validation", data.validation ? (data.validation.ok ? "passed" : "review") : "ready"],
      ["Storage", memory.storage || "json"]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    if ($("#memoryResult")) {
      $("#memoryResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderContext(payload) {
    var target = $("#contextMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var scores = data.scores || (data.score && data.score.scores) || {};
    var missing = data.missing || (data.validation && data.validation.missing) || [];
    var registry = data.registry || {};
    var cards = [
      ["Brain Status", data.status || "ready"],
      ["Context Health", data.ok === false ? "needs review" : "healthy"],
      ["Context Score", data.overallContextScore || (data.score ? data.score + "%" : "ready")],
      ["Context Registry", registry.providerCount || (registry.providers ? registry.providers.length : "ready")],
      ["Current Active Context", data.type || "ai_ready_context_package"],
      ["Customer", scores.customer || "ready"],
      ["Organization", scores.organization || "ready"],
      ["Session", scores.session || "ready"],
      ["Memory", scores.memory || "ready"],
      ["Knowledge", scores.knowledge || "ready"],
      ["Missing", missing.length || 0]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    if ($("#contextResult")) {
      $("#contextResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  async function refreshDeveloperCenter(action, writeOutput) {
    var result = await systemApi("developer", action || "fullReport", {});
    renderDeveloperCenter(result, writeOutput);
    return result;
  }

  async function refreshCompliance() {
    var response = await fetch("/api/outreach", {
      cache: "no-store",
      headers: { "x-marketplace-admin-secret": adminSecret() }
    });
    var body = await response.json().catch(function () { return {}; });
    if (body.ok === false) throw new Error(body.error || "Compliance request failed.");
    renderCompliance(body.compliance);
    return body;
  }

  async function refreshSocialLeads() {
    var response = await fetch("/api/social-leads", {
      cache: "no-store",
      headers: { "x-marketplace-admin-secret": adminSecret() }
    });
    var body = await response.json().catch(function () { return {}; });
    if (!response.ok || body.ok === false) throw new Error(body.error || "Social leads request failed.");
    renderSocialLeads(body.social);
    return body;
  }

  function renderQuestions(service) {
    var rules = state.config && state.config.estimateRules ? state.config.estimateRules[service] : null;
    $("#leadQuestions").innerHTML = rules ? '<ul>' + rules.questions.map(function (question) {
      return '<li>' + escapeHtml(question) + '</li>';
    }).join("") + '</ul>' : '<p class="muted">Select a service to see project questions.</p>';
  }

  async function refresh() {
    var dashboard = await getDashboard();
    state.config = dashboard.config;
    fillSelects(dashboard.config);
    renderWarnings(dashboard.warnings);
    renderMetrics(dashboard.summary);
    renderCrmPipeline(dashboard.summary && dashboard.summary.crm);
    renderRecentLeads(dashboard.recentLeads);
    renderTopVendors(dashboard.topVendors);
    renderVendors(dashboard.vendors);
    renderAnalytics(dashboard.summary);
    renderActivityLogs(dashboard.activityLogs);
    renderDeployment(dashboard.deployment);
    renderQuestions($("select[name='service']").value);
    await refreshCompliance().catch(function () {});
    await refreshSocialLeads().catch(function () {});
    await refreshDeveloperCenter("deployment", false).catch(function () {});
    await businessApi("dashboard", {}).then(renderBusinessDashboard).catch(function () {});
  }

  function attachNavigation() {
    $all(".nav button").forEach(function (button) {
      button.addEventListener("click", function () {
        $all(".nav button").forEach(function (item) { item.classList.remove("is-active"); });
        $all("section[data-view]").forEach(function (section) { section.classList.remove("is-active"); });
        button.classList.add("is-active");
        $("section[data-view='" + button.dataset.target + "']").classList.add("is-active");
      });
    });
  }

  function attachForms() {
    $("#loginForm").addEventListener("submit", async function (event) {
      event.preventDefault();
      var secret = $("#loginSecret").value.trim();
      if (!secret) {
        $("#loginStatus").innerHTML = '<span class="danger">Missing admin code</span>';
        return;
      }
      $("#loginStatus").textContent = "Checking access...";
      try {
        var loginResult = await login(secret);
        setSecret(secret);
        setRole(loginResult.role);
        $("#loginPanel").style.display = "none";
        $("#appShell").classList.add("is-authenticated");
        await refresh();
      } catch (error) {
        $("#loginStatus").innerHTML = '<span class="danger">' + escapeHtml(error.message) + '</span>';
      }
    });

    $("#logoutButton").addEventListener("click", function () {
      localStorage.removeItem("marketplaceSecret");
      localStorage.removeItem("marketplaceRole");
      $("#adminSecret").value = "";
      $("#loginSecret").value = "";
      setRole("");
      $("#appShell").classList.remove("is-authenticated");
      $("#loginPanel").style.display = "grid";
    });

    $all("form[data-action]").forEach(function (form) {
      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        var action = form.dataset.action;
        var status = $(".status", form);
        var button = $("button", form);
        status.textContent = "Working...";
        button.disabled = true;

        try {
          var payload = formData(form);
          var apiAction = action === "vendor" && payload.crudMode ? payload.crudMode : action;
          var result;
          if (form.dataset.module) {
            result = await systemApi(form.dataset.module, form.dataset.apiAction || apiAction, payload);
          } else if (form.dataset.endpoint) {
            result = await routeApi(form.dataset.endpoint, form.dataset.apiAction || apiAction, payload);
          } else {
            result = action === "project" ? await uploadProject(form) : await api(apiAction, payload);
          }
          status.textContent = "Saved.";
          if (form.dataset.output && $("#" + form.dataset.output)) {
            $("#" + form.dataset.output).textContent = JSON.stringify(result, null, 2);
          }
          if (action === "lead") $("#leadResult").textContent = JSON.stringify(result, null, 2);
          if (action === "estimate") {
            state.lastEstimateId = result.estimate.id;
            state.lastEstimateEmail = form.email.value || "";
            renderEstimate(result.estimate);
            $("#estimateResult").textContent = JSON.stringify(result, null, 2);
          }
          if (action === "quoteRequest") $("#quoteResult").textContent = JSON.stringify(result, null, 2);
          if (action === "vendorMatch") $("#vendorMatchResult").textContent = JSON.stringify(result, null, 2);
          if (action === "recommendation") $("#recommendationResult").textContent = JSON.stringify(result, null, 2);
          if (action === "commission") $("#commissionResult").textContent = JSON.stringify(result, null, 2);
          if (action === "marketing") $("#marketingResult").textContent = JSON.stringify(result, null, 2);
          if (action === "smm") $("#smmResult").textContent = JSON.stringify(result, null, 2);
          if (action === "seo") $("#seoResult").textContent = JSON.stringify(result, null, 2);
          if (action === "project") $("#projectResult").textContent = JSON.stringify(result, null, 2);
          if (action.indexOf("developer") === 0) renderDeveloperCenter(result);
          if (action === "socialFinder" || action === "socialDraft") await refreshSocialLeads();
          await refresh();
        } catch (error) {
          status.innerHTML = '<span class="danger">' + escapeHtml(error.message) + '</span>';
        } finally {
          button.disabled = false;
        }
      });
    });

    $all("select[name='service']").forEach(function (select) {
      select.addEventListener("change", function () { renderQuestions(select.value); });
    });

    $("#downloadQuote").addEventListener("click", function () {
      if (!state.lastEstimateId) return;
      window.open("/api/marketplace-quote?id=" + encodeURIComponent(state.lastEstimateId), "_blank", "noopener");
    });

    $("#emailEstimate").addEventListener("click", async function () {
      if (!state.lastEstimateId) return;
      var result = await api("emailEstimate", {
        estimateId: state.lastEstimateId,
        email: state.lastEstimateEmail,
        approved: true
      });
      $("#estimateResult").textContent = JSON.stringify(result, null, 2);
    });

    $("#adminSecret").addEventListener("change", refresh);

    $("#pauseOutreach").addEventListener("click", async function () {
      var button = $("#pauseOutreach");
      button.disabled = true;
      try {
        var result = await routeApi("/api/outreach", "pause", {});
        $("#complianceResult").textContent = JSON.stringify(result, null, 2);
        await refreshCompliance();
      } catch (error) {
        $("#complianceResult").textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });

    if ($("#pauseSocialOutreach")) {
      $("#pauseSocialOutreach").addEventListener("click", async function () {
        var button = $("#pauseSocialOutreach");
        button.disabled = true;
        try {
          var result = await routeApi("/api/social-leads", "pause", {});
          $("#socialLeadResult").textContent = JSON.stringify(result, null, 2);
          await refreshSocialLeads();
        } catch (error) {
          $("#socialLeadResult").textContent = error.message;
        } finally {
          button.disabled = false;
        }
      });
    }

    if ($("#refreshSocialLeads")) {
      $("#refreshSocialLeads").addEventListener("click", async function () {
        try {
          var result = await refreshSocialLeads();
          $("#socialLeadResult").textContent = JSON.stringify(result, null, 2);
        } catch (error) {
          $("#socialLeadResult").textContent = error.message;
        }
      });
    }

    if ($("#refreshDeveloperCenter")) {
      $("#refreshDeveloperCenter").addEventListener("click", async function () {
        var button = $("#refreshDeveloperCenter");
        button.disabled = true;
        try {
          var result = await refreshDeveloperCenter("fullReport");
          $("#developerResult").textContent = JSON.stringify(result, null, 2);
        } catch (error) {
          $("#developerResult").textContent = error.message;
        } finally {
          button.disabled = false;
        }
      });
    }

    if ($("#runDeveloperValidation")) {
      $("#runDeveloperValidation").addEventListener("click", async function () {
        var button = $("#runDeveloperValidation");
        button.disabled = true;
        try {
          var result = await refreshDeveloperCenter("validate");
          $("#developerResult").textContent = JSON.stringify(result, null, 2);
        } catch (error) {
          $("#developerResult").textContent = error.message;
        } finally {
          button.disabled = false;
        }
      });
    }

    if ($("#checkDatabaseStatus")) {
      $("#checkDatabaseStatus").addEventListener("click", async function () {
        var button = $("#checkDatabaseStatus");
        button.disabled = true;
        try {
          var result = await refreshDeveloperCenter("databaseStatus");
          $("#developerResult").textContent = JSON.stringify(result, null, 2);
        } catch (error) {
          $("#developerResult").textContent = error.message;
        } finally {
          button.disabled = false;
        }
      });
    }

    if ($("#checkPlatformStatus")) {
      $("#checkPlatformStatus").addEventListener("click", async function () {
        var button = $("#checkPlatformStatus");
        button.disabled = true;
        try {
          var result = await refreshDeveloperCenter("platformStatus");
          $("#developerResult").textContent = JSON.stringify(result, null, 2);
        } catch (error) {
          $("#developerResult").textContent = error.message;
        } finally {
          button.disabled = false;
        }
      });
    }

    if ($("#refreshBusinessDashboard")) {
      $("#refreshBusinessDashboard").addEventListener("click", async function () {
        var button = $("#refreshBusinessDashboard");
        button.disabled = true;
        try {
          renderBusinessDashboard(await businessApi("dashboard", {}));
        } catch (error) {
          $("#businessResult").textContent = error.message;
        } finally {
          button.disabled = false;
        }
      });
    }

    [
      ["#refreshBrainStatus", "brainStatus"],
      ["#showBrainHealth", "brainHealth"],
      ["#showBrainRecommendation", "recommendation"],
      ["#showExecutiveSummary", "executiveSummary"],
      ["#showMemoryStatus", "memoryStatus"],
      ["#showKnowledgeStatus", "knowledgeStatus"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderBrain(await brainApi(action, {}));
          } catch (error) {
            $("#brainResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    [
      ["#refreshContextStatus", "status"],
      ["#buildContextPackage", "build"],
      ["#scoreContextPackage", "score"],
      ["#showContextRegistry", "registry"],
      ["#validateContextPackage", "validate"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderContext(await contextApi(action, {}));
          } catch (error) {
            $("#contextResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    [
      ["#refreshMemoryStatus", "status"],
      ["#showMemoryStats", "stats"],
      ["#showMemoryRegistry", "registry"],
      ["#validateMemory", "validate"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderMemory(await memoryApi(action, {}));
          } catch (error) {
            $("#memoryResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    if ($("#refreshTitanStatus")) {
      $("#refreshTitanStatus").addEventListener("click", async function () {
        var button = $("#refreshTitanStatus");
        button.disabled = true;
        try {
          renderTitan(await titanApi("titanStatus", {}));
        } catch (error) {
          $("#titanResult").textContent = error.message;
        } finally {
          button.disabled = false;
        }
      });
    }

    if ($("#runExecutiveBoard")) {
      $("#runExecutiveBoard").addEventListener("click", async function () {
        var button = $("#runExecutiveBoard");
        button.disabled = true;
        try {
          renderTitan(await titanApi("executiveBoard", {}));
        } catch (error) {
          $("#titanResult").textContent = error.message;
        } finally {
          button.disabled = false;
        }
      });
    }

    if ($("#runTitanQualityGates")) {
      $("#runTitanQualityGates").addEventListener("click", async function () {
        var button = $("#runTitanQualityGates");
        button.disabled = true;
        try {
          renderTitan(await titanApi("qualityGates", {}));
        } catch (error) {
          $("#titanResult").textContent = error.message;
        } finally {
          button.disabled = false;
        }
      });
    }

    [
      ["#refreshProjectControl", "projectControlStatus"],
      ["#showRoadmapSummary", "roadmapSummary"],
      ["#showBacklogSummary", "backlogSummary"],
      ["#showSprintPlan", "sprintPlan"],
      ["#showReleasePlan", "releasePlan"],
      ["#showDecisionLog", "decisionLog"],
      ["#showFocusRules", "focusRules"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderProjectControl(await titanApi(action, {}));
          } catch (error) {
            $("#projectControlResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    if ($("#generateBusinessReports")) {
      $("#generateBusinessReports").addEventListener("click", async function () {
        var button = $("#generateBusinessReports");
        button.disabled = true;
        try {
          var result = await businessApi("reports", {});
          renderBusinessDashboard(result);
          $("#businessResult").textContent = JSON.stringify(result, null, 2);
        } catch (error) {
          $("#businessResult").textContent = error.message;
        } finally {
          button.disabled = false;
        }
      });
    }

    $("#refreshCompliance").addEventListener("click", async function () {
      try {
        var result = await refreshCompliance();
        $("#complianceResult").textContent = JSON.stringify(result, null, 2);
      } catch (error) {
        $("#complianceResult").textContent = error.message;
      }
    });
  }

  attachNavigation();
  attachForms();
  var savedSecret = localStorage.getItem("marketplaceSecret");
  var savedRole = localStorage.getItem("marketplaceRole");
  if (savedSecret) {
    setSecret(savedSecret);
    setRole(savedRole);
    $("#loginPanel").style.display = "none";
    $("#appShell").classList.add("is-authenticated");
  }
  refresh().catch(function (error) {
    $("#metrics").innerHTML = '<article class="card danger">' + escapeHtml(error.message) + '</article>';
  });
})();
