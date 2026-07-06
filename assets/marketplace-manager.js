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

  async function decisionApi(action, payload) {
    return systemApi("decision", action || "status", payload || {});
  }

  async function recommendationIntelligenceApi(action, payload) {
    return systemApi("recommendation", action || "recommendation.status", payload || {});
  }

  async function executiveApi(action, payload) {
    return systemApi("executive", action || "executive.dashboard", payload || {});
  }

  async function salesApi(action, payload) {
    return systemApi("sales", action || "sales.dashboard", payload || {});
  }

  async function workflowApi(action, payload) {
    return systemApi("workflow", action || "workflow.status", payload || {});
  }

  async function operationsApi(action, payload) {
    return systemApi("operations", action || "operations.dashboard", payload || {});
  }

  async function financeApi(action, payload) {
    return systemApi("finance", action || "finance.dashboard", payload || {});
  }

  async function customerSuccessApi(action, payload) {
    return systemApi("customerSuccess", action || "customerSuccess.dashboard", payload || {});
  }

  async function customerApi(action, payload) {
    return systemApi("customer", action || "customer.dashboard", payload || {});
  }

  async function marketingGrowthApi(action, payload) {
    return systemApi("marketing", action || "marketing.dashboard", payload || {});
  }

  async function analyticsReportsApi(action, payload) {
    return systemApi("analytics", action || "analytics.dashboard", payload || {});
  }

  async function dispatchAIApi(action, payload) {
    return systemApi("dispatchAI", action || "dispatchAI.dashboard", payload || {});
  }

  async function jobApi(action, payload) {
    return systemApi("job", action || "job.dashboard", payload || {});
  }

  async function revenueApi(action, payload) {
    return systemApi("revenue", action || "revenue.dashboard", payload || {});
  }

  async function saasApi(action, payload) {
    return systemApi("saas", action || "saas.dashboard", payload || {});
  }

  async function billingApi(action, payload) {
    return systemApi("billing", action || "billing.dashboard", payload || {});
  }

  async function integrationsApi(action, payload) {
    return systemApi("integrations", action || "integrations.dashboard", payload || {});
  }

  function betaDemoData() {
    return {
      welcomeWizard: ["Choose demo company", "Review product tour", "Walk through demo scenarios", "Collect feedback", "Review next steps"],
      demoCompany: { name: "CompHelp Service Demo Company", city: "Los Angeles", industry: "Local technology services", serviceArea: "Los Angeles, Burbank, Glendale, North Hollywood, Studio City" },
      demoCustomers: [
        { name: "LA Market Owner", city: "Los Angeles", status: "VIP", serviceNeed: "Security Camera Installation" },
        { name: "Burbank Office Manager", city: "Burbank", status: "New Lead", serviceNeed: "WiFi & Network Installation" },
        { name: "Glendale Homeowner", city: "Glendale", status: "Follow-up", serviceNeed: "Smart Home Setup" }
      ],
      demoJobs: [
        { title: "4-camera storefront install", customerName: "LA Market Owner", status: "Scheduled", priority: "High", value: 899 },
        { title: "Office WiFi cleanup", customerName: "Burbank Office Manager", status: "Estimate Sent", priority: "Medium", value: 650 },
        { title: "Laptop repair and backup", customerName: "Glendale Homeowner", status: "Follow-up", priority: "Medium", value: 220 }
      ],
      demoEstimates: [
        { service: "Security Camera Installation", customerName: "LA Market Owner", low: 799, high: 1199, recommended: 899, status: "Ready" },
        { service: "WiFi & Network Installation", customerName: "Burbank Office Manager", low: 450, high: 850, recommended: 650, status: "Sent" }
      ],
      demoInvoices: [
        { id: "inv_demo_1", customerName: "LA Market Owner", amount: 899, status: "Draft" },
        { id: "inv_demo_2", customerName: "Glendale Homeowner", amount: 220, status: "Paid" }
      ],
      productTour: [
        { title: "Founder Command Center", value: "Business health, AI actions, revenue, risks, and workflow status." },
        { title: "Sales Manager", value: "Pipeline, estimate priority, follow-ups, and revenue opportunities." },
        { title: "Operations Center", value: "Jobs, technicians, urgent work, and customer waiting issues." },
        { title: "Dispatch AI", value: "Scheduling suggestions, technician matching, route ideas, and ETA windows." },
        { title: "Finance Center", value: "Revenue, invoices, cash flow, profit, alerts, and recommendations." },
        { title: "Marketing & Growth", value: "Lead sources, campaigns, reviews, SEO, social, and ROI." }
      ],
      scenarios: [
        { title: "Owner opens dashboard", goal: "Understand business health in under 60 seconds." },
        { title: "New camera lead arrives", goal: "Show lead qualification, estimate, and dispatch handoff." },
        { title: "Daily operations review", goal: "Review jobs, technician availability, and urgent work." },
        { title: "Owner reviews growth", goal: "Show marketing, finance, analytics, and recommendations." }
      ],
      limitations: [
        "External services are not connected in beta demo mode.",
        "Authentication is still internal admin-code based.",
        "Billing is architecture-only and does not process payments.",
        "Public integrations are placeholders and do not send data.",
        "Demo data is synthetic and should not be presented as real customer results."
      ],
      feedbackFields: ["Customer name", "Company", "What was clear?", "What was confusing?", "Top requested feature", "Would use beta?", "Notes"],
      checklist: ["Demo data loads", "Tour explains product", "Known limitations are visible", "Feedback can be captured", "No private data shown", "Owner approval before deploy"],
      betaReadinessScore: 92
    };
  }

  function releaseCandidateData() {
    return {
      release: "V1.0 Release Candidate",
      version: "v1.0.0-rc.1",
      systemHealth: "healthy",
      performanceScore: 88,
      securityScore: 86,
      testCoverage: "focused module tests",
      deploymentStatus: "approval required",
      overallReadiness: 90,
      installedModules: [
        "Business Brain",
        "Executive Intelligence",
        "Sales Manager",
        "Workflow Engine",
        "Operations Center",
        "Finance Center",
        "Customer Success Center",
        "Marketing & Growth",
        "Analytics & Reports",
        "Dispatch AI",
        "SaaS Admin",
        "Billing",
        "Integrations",
        "Beta Center"
      ],
      architecture: [
        { title: "Frontend", detail: "Single dashboard surface with modular centers." },
        { title: "API Layer", detail: "Consolidated system API plus marketplace APIs." },
        { title: "Data Layer", detail: "JSON fallback now, Supabase/PostgreSQL prepared later." },
        { title: "AI Layer", detail: "Brain, recommendation, executive, sales, workflow, and operations engines." },
        { title: "Release Safety", detail: "Validation, docs, warnings, and approval-only deployment." }
      ],
      releaseNotes: [
        "Founder dashboard and Beta Center are ready for demos.",
        "Business operating centers cover sales, operations, finance, customer success, marketing, analytics, dispatch, SaaS, billing, and integrations.",
        "Production hardening validation is active.",
        "External services remain disabled unless explicitly approved."
      ],
      versionHistory: [
        "v0.7 Core Platform Foundation",
        "v0.8 Business Brain Foundation",
        "v0.9 Business Operating Centers",
        "v1.0.0-rc.1 Release Candidate"
      ],
      deploymentChecklist: [
        "Run npm run check-project.",
        "Review warnings and git diff.",
        "Do not stage .env, .env.local, or logs/*.jsonl.",
        "Get owner approval before push.",
        "Get owner approval before Vercel deployment."
      ]
    };
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

  function renderFounderDashboard(view) {
    view = view || {};
    var executive = view.executive || {};
    var briefing = view.briefing || {};
    var sales = view.sales || {};
    var recommendations = view.recommendations || {};
    var workflow = view.workflow || {};
    var brain = view.brain || {};
    var health = executive.businessHealth || executive.businessHealthScore || {};
    var kpis = executive.kpis || executive;
    var salesOverview = sales.salesOverview || {};
    var salesKpis = sales.kpis || {};
    var risks = executive.businessRisks || executive.risks || [];
    var revenueOpportunities = sales.revenueOpportunities || executive.growthOpportunities || recommendations.revenueOpportunities || [];
    var aiActions = recommendations.aiPriorityQueue || recommendations.recommendations || executive.aiPriorityQueue || [];
    var workflows = workflow.registry || workflow.workflows || [];

    renderCards("#founderHealthCards", [
      ["Business Health", scoreLabel(health.overallScore)],
      ["Revenue Today", money(executive.revenueToday || kpis.revenueToday)],
      ["Revenue This Month", money(executive.revenueThisMonth || kpis.revenueThisMonth)],
      ["Top Opportunity", money(salesOverview.expectedRevenue || salesKpis.revenuePipeline)],
      ["Top Risks", risks.length || 0],
      ["AI Actions", aiActions.length || 0],
      ["Sales Priority", salesOverview.priority || "ready"],
      ["Workflow Engine", workflow.status || "ready"]
    ]);

    renderList("#founderAiActions", aiActions.slice(0, 5).map(function (item) {
      return {
        title: item.title || item.recommendedAction || "Review AI action",
        meta: item.category || item.priority || "AI recommendation",
        detail: item.description || item.recommendedAction || "Owner review recommended.",
        pill: item.priority || "review"
      };
    }), "No AI actions yet.");

    var briefingText = briefing.executiveSummary || executive.executiveSummary || "Executive briefing will improve as leads, estimates, projects, invoices, and workflow activity are added.";
    $("#founderBriefing").textContent = briefingText;

    renderList("#founderRevenueOpportunities", revenueOpportunities.slice(0, 5).map(function (item) {
      return {
        title: item.title || item.type || "Revenue opportunity",
        meta: money(item.expectedRevenue || item.estimatedRevenue),
        detail: item.description || item.recommendedAction || "Review opportunity.",
        pill: item.probability !== undefined ? Math.round(Number(item.probability) * 100) + "%" : "opportunity"
      };
    }), "No revenue opportunities yet.");

    renderList("#founderRisks", risks.slice(0, 5).map(function (item) {
      return {
        title: item.title || "Business risk",
        meta: item.severity || "LOW",
        detail: item.recommendedAction || "Review risk.",
        pill: item.type || "risk"
      };
    }), "No major risks detected.");

    renderCards("#founderSalesPipeline", [
      ["Best Customer", salesOverview.bestNextCustomer || "Next qualified lead"],
      ["Expected Revenue", money(salesOverview.expectedRevenue || salesKpis.revenuePipeline)],
      ["Probability", salesOverview.probability !== undefined ? Math.round(Number(salesOverview.probability) * 100) + "%" : "ready"],
      ["Open Estimates", salesKpis.openEstimates || 0],
      ["Conversion", (salesKpis.conversionRate || 0) + "%"],
      ["Follow-ups", (sales.todaysFollowups || []).length || 0]
    ]);

    renderCards("#founderWorkflowActivity", [
      ["Registered Workflows", workflow.workflowCount || (workflow.registry && workflow.registry.workflowCount) || workflows.length || 0],
      ["Supported Events", (workflow.supportedEvents || (workflow.registry && workflow.registry.supportedEvents) || []).length || 0],
      ["Pending Approval", workflow.pendingApprovals || 0],
      ["History", workflow.historyCount || 0],
      ["Events", workflow.eventCount || 0],
      ["Status", workflow.status || "ready"]
    ]);

    renderCards("#founderKpiCards", [
      ["Open Jobs", executive.openJobs || kpis.openJobs || 0],
      ["Completed Jobs", executive.completedJobs || kpis.completedJobs || 0],
      ["Open Estimates", executive.openEstimates || kpis.openEstimates || 0],
      ["Avg Job Value", money(executive.averageJobValue || kpis.averageJobValue)],
      ["Collections", money(executive.collections || kpis.collections)],
      ["Technician Use", (executive.technicianUtilization || kpis.technicianUtilization || 0) + "%"],
      ["Customer Score", (kpis.customerSatisfaction && kpis.customerSatisfaction.score) || "ready"],
      ["Inventory", (kpis.inventoryStatus && kpis.inventoryStatus.status) || "ready"]
    ]);

    renderCards("#founderWorkforceStatus", [
      ["Brain", brain.status || "ready"],
      ["Executive", executive.generatedAt ? "ready" : "ready"],
      ["Recommendation", recommendations.generatedAt ? "ready" : "ready"],
      ["Sales", sales.generatedAt ? "ready" : "ready"],
      ["Workflow", workflow.status || "ready"],
      ["External AI", "off"],
      ["Automation", "approval-first"],
      ["Data Mode", "JSON-ready"]
    ]);
  }

  function renderCards(selector, cards) {
    var target = $(selector);
    if (!target) return;
    target.innerHTML = cards.map(function (card) {
      return '<article class="card"><p class="muted">' + escapeHtml(card[0]) + '</p><div class="metric">' + escapeHtml(card[1]) + '</div></article>';
    }).join("");
  }

  function renderList(selector, items, emptyText) {
    var target = $(selector);
    if (!target) return;
    target.innerHTML = items.length ? items.map(function (item) {
      return '<div class="row"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.meta || "") + '</span><span>' + escapeHtml(item.detail || "") + '</span><span class="pill">' + escapeHtml(item.pill || "review") + '</span></div>';
    }).join("") : '<p class="muted">' + escapeHtml(emptyText) + '</p>';
  }

  function money(value) {
    return "$" + escapeHtml(Math.round(Number(value || 0)));
  }

  function scoreLabel(value) {
    return value === undefined || value === null ? "ready" : String(value);
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
    var performance = data.performance || (data.pipelineValidation && data.pipelineValidation.performance) || {};
    var cards = [
      ["Brain Status", data.status || "ready"],
      ["Memory", memory.status || (data.types ? data.types.length : "ready")],
      ["Pipeline", data.pipelineStatus || data.integrationStatus || (data.unifiedBrainResult ? data.unifiedBrainResult.status : "ready")],
      ["Average MS", data.averageResponseTimeMs || performance.averageResponseTimeMs || "ready"],
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

  function renderRecommendationIntelligence(payload, focus) {
    var target = $("#recommendationMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var recommendations = data.recommendations || data.aiPriorityQueue || [];
    var revenue = data.revenueOpportunities || recommendations.filter(function (item) { return Number(item.estimatedRevenue || 0) > 0; });
    var operations = data.operationalImprovements || recommendations.filter(function (item) { return item.category === "Operations"; });
    var sales = data.salesOpportunities || recommendations.filter(function (item) { return item.category === "Sales"; });
    var customers = data.customerAttention || recommendations.filter(function (item) { return item.category === "Customer"; });
    var top = data.topRecommendation || recommendations[0] || {};
    var cards = [
      ["Today's Recommendations", (data.today || recommendations).length || "ready"],
      ["Revenue Opportunities", revenue.length || 0],
      ["Operational Improvements", operations.length || 0],
      ["Sales Opportunities", sales.length || 0],
      ["Customer Attention", customers.length || 0],
      ["AI Priority Queue", (data.aiPriorityQueue || recommendations).length || 0],
      ["Top Priority", top.priority || "ready"],
      ["Confidence", top.confidence !== undefined ? top.confidence : "ready"]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    if ($("#recommendationIntelligenceResult")) {
      var output = data;
      if (focus === "revenue") output = { revenueOpportunities: revenue };
      if (focus === "operations") output = { operationalImprovements: operations };
      if (focus === "sales") output = { salesOpportunities: sales };
      if (focus === "customer") output = { customerAttention: customers };
      if (focus === "priority") output = { aiPriorityQueue: data.aiPriorityQueue || recommendations, topRecommendation: top };
      $("#recommendationIntelligenceResult").textContent = JSON.stringify(output, null, 2);
    }
  }

  function renderExecutiveDashboard(payload) {
    var target = $("#executiveMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var health = data.businessHealth || data.businessHealthScore || {};
    var kpis = data.kpis || data;
    var forecasts = data.forecasts || {};
    var risks = data.businessRisks || data.risks || [];
    var opportunities = data.growthOpportunities || data.opportunities || [];
    var aiQueue = data.aiPriorityQueue || data.aiRecommendations || [];
    var cards = [
      ["Business Health", health.overallScore !== undefined ? health.overallScore : "ready"],
      ["Revenue Today", "$" + escapeHtml(data.revenueToday || kpis.revenueToday || 0)],
      ["Revenue Yesterday", "$" + escapeHtml(data.revenueYesterday || kpis.revenueYesterday || 0)],
      ["Revenue This Week", "$" + escapeHtml(data.revenueThisWeek || kpis.revenueThisWeek || 0)],
      ["Revenue This Month", "$" + escapeHtml(data.revenueThisMonth || kpis.revenueThisMonth || 0)],
      ["Open Jobs", data.openJobs !== undefined ? data.openJobs : kpis.openJobs || 0],
      ["Open Estimates", data.openEstimates !== undefined ? data.openEstimates : kpis.openEstimates || 0],
      ["Conversion", (data.estimateConversionRate !== undefined ? data.estimateConversionRate : kpis.estimateConversionRate || 0) + "%"],
      ["Average Job", "$" + escapeHtml(data.averageJobValue || kpis.averageJobValue || 0)],
      ["Risks", risks.length || 0],
      ["Opportunities", opportunities.length || 0],
      ["AI Queue", aiQueue.length || 0]
    ];
    if (forecasts.revenueForecast) cards.push(["30-Day Forecast", "$" + escapeHtml(forecasts.revenueForecast.next30Days || 0)]);
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    if ($("#executiveResult")) {
      $("#executiveResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderSalesDashboard(payload) {
    var target = $("#salesMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var overview = data.salesOverview || {};
    var kpis = data.kpis || data;
    var highPriorityDeals = data.highPriorityDeals || data.prioritizedDeals || [];
    var calls = data.todaysCalls || [];
    var followups = data.todaysFollowups || [];
    var opportunities = data.revenueOpportunities || data;
    var cards = [
      ["Best Customer", overview.bestNextCustomer || "ready"],
      ["Expected Revenue", "$" + escapeHtml(overview.expectedRevenue || kpis.revenuePipeline || 0)],
      ["Probability", overview.probability !== undefined ? overview.probability : "ready"],
      ["Priority", overview.priority || "ready"],
      ["Open Estimates", kpis.openEstimates || 0],
      ["Won Estimates", kpis.wonEstimates || 0],
      ["Lost Estimates", kpis.lostEstimates || 0],
      ["Conversion", (kpis.conversionRate || 0) + "%"],
      ["Avg Deal", "$" + escapeHtml(kpis.averageDealSize || 0)],
      ["Pipeline", "$" + escapeHtml(data.revenuePipeline || kpis.revenuePipeline || 0)],
      ["Today's Calls", calls.length || 0],
      ["Follow-ups", followups.length || 0],
      ["High Priority", highPriorityDeals.length || 0],
      ["Opportunities", Array.isArray(opportunities) ? opportunities.length : 0]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    if ($("#salesResult")) {
      $("#salesResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderOperationsDashboard(payload) {
    var target = $("#operationsMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var kpis = data.operationsKpis || data;
    var schedule = data.scheduleHealth || {};
    var inventory = data.inventoryNeeded || {};
    var technicians = data.technicianBoard || data.technicians || [];
    var jobs = data.todaysJobs || (data.jobs ? data.jobs.todaysJobs : []) || [];
    var cards = [
      ["Today's Jobs", jobs.length || kpis.openJobs || 0],
      ["Open Jobs", kpis.openJobs || 0],
      ["Completed", kpis.completedJobs || 0],
      ["Urgent Jobs", (data.urgentJobs || []).length || kpis.urgentJobs || 0],
      ["At Risk", (data.atRiskJobs || []).length || kpis.atRiskJobs || 0],
      ["Available Techs", kpis.availableTechnicians || technicians.filter(function (item) { return item.workload === "available"; }).length || 0],
      ["Schedule Health", schedule.score !== undefined ? schedule.score : kpis.scheduleScore || "ready"],
      ["Customer Waiting", (data.customerWaiting || []).length || kpis.customerWaiting || 0],
      ["Inventory", inventory.status || "ready"],
      ["AI Suggestions", (data.dispatchSuggestions || []).length || 0]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    renderList("#operationsUrgentJobs", (data.urgentJobs || []).slice(0, 5).map(function (job) {
      return { title: job.title || job.service, meta: job.customerName, detail: job.city || job.status, pill: job.priority || "urgent" };
    }), "No urgent jobs.");
    renderList("#operationsAtRiskJobs", (data.atRiskJobs || []).slice(0, 5).map(function (job) {
      return { title: job.title || job.service, meta: job.customerName, detail: job.notes || "Review risk.", pill: "at risk" };
    }), "No at-risk jobs.");
    renderList("#operationsDispatchList", (data.dispatchSuggestions || []).slice(0, 5).map(function (item) {
      return { title: item.jobTitle || item.service, meta: item.suggestedTechnician, detail: item.reason, pill: item.confidence !== undefined ? Math.round(Number(item.confidence) * 100) + "%" : "AI" };
    }), "No dispatch suggestions yet.");
    renderList("#operationsCustomerWaiting", (data.customerWaiting || []).slice(0, 5).map(function (item) {
      return { title: item.customerName, meta: item.service, detail: item.note, pill: item.priority || "waiting" };
    }), "No customer waiting issues.");
    if ($("#operationsResult")) {
      $("#operationsResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderFinanceDashboard(payload) {
    var target = $("#financeMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var forecast = data.forecast || data;
    var health = data.health || data;
    var cards = [
      ["Revenue Today", money(data.revenueToday)],
      ["Revenue This Week", money(data.revenueThisWeek)],
      ["Revenue This Month", money(data.revenueThisMonth)],
      ["Outstanding Invoices", data.outstandingInvoices || 0],
      ["Overdue Invoices", data.overdueInvoices || 0],
      ["Paid Invoices", data.paidInvoices || 0],
      ["Cash Flow", money(data.cashFlow)],
      ["Profit Estimate", money(data.profitEstimate)],
      ["Expenses", money(data.expenses || data.totalExpenses)],
      ["Monthly Forecast", money(data.monthlyForecast || forecast.monthlyForecast)],
      ["Health Score", data.financialHealthScore || health.financialHealthScore || "ready"],
      ["Revenue Trend", data.revenueTrend || "ready"],
      ["Expense Trend", data.expenseTrend || "ready"],
      ["Mode", data.demoMode ? "demo" : "live"]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    renderList("#financeTopCustomers", (data.topCustomersByRevenue || []).map(function (customer) {
      return { title: customer.customerName, meta: money(customer.revenue), detail: "Tracked revenue", pill: "customer" };
    }), "No customer revenue data yet.");
    renderList("#financeRecommendations", (data.aiFinancialRecommendations || []).slice(0, 5).map(function (item) {
      return { title: item.title, meta: item.category || "Finance", detail: item.description, pill: item.priority || "review" };
    }), "No finance recommendations yet.");
    renderList("#financeAlerts", (data.financialAlerts || data.alerts || []).map(function (alert) {
      return { title: alert, meta: "Finance", detail: "Owner review recommended.", pill: "alert" };
    }), "No critical financial alerts.");
    if ($("#financeResult")) {
      $("#financeResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderCustomerSuccessDashboard(payload) {
    var target = $("#customerSuccessMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var ltv = data.customerLifetimeValue || data;
    var vip = data.vipCustomers || [];
    var risks = data.atRiskCustomers || [];
    var lost = data.lostCustomers || [];
    var timeline = data.customerTimeline || [];
    var repeat = data.repeatRevenueOpportunities || [];
    var followup = data.followupNeeded || [];
    var reviews = data.reviewsNeeded || [];
    var recommendations = data.aiCustomerRecommendations || [];
    var cards = [
      ["Health Score", data.customerHealthScore || data.overallScore || "ready"],
      ["VIP Customers", vip.length || 0],
      ["At Risk", risks.length || 0],
      ["Lost Customers", lost.length || 0],
      ["Lifetime Value", money(Array.isArray(ltv) ? ltv.reduce(function (sum, item) { return sum + Number(item.lifetimeValue || 0); }, 0) : 0)],
      ["Timeline Items", timeline.length || 0],
      ["Repeat Revenue", repeat.length || 0],
      ["Follow-ups", followup.length || 0],
      ["Reviews Needed", reviews.length || 0],
      ["AI Recommendations", recommendations.length || 0]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    renderList("#customerVipList", vip.slice(0, 5).map(function (item) {
      return { title: item.customerName, meta: money(item.lifetimeValue), detail: item.recommendedAction || item.service, pill: "VIP" };
    }), "No VIP customers yet.");
    renderList("#customerRiskList", risks.slice(0, 5).map(function (item) {
      return { title: item.customerName, meta: item.service, detail: item.riskReason || item.recommendedAction, pill: item.priority || "risk" };
    }), "No at-risk customers.");
    renderList("#customerRepeatRevenue", repeat.slice(0, 5).map(function (item) {
      return { title: item.customerName, meta: money(item.lifetimeValue), detail: item.repeatPotential || "Repeat opportunity", pill: "repeat" };
    }), "No repeat revenue opportunities yet.");
    renderList("#customerRecommendationList", recommendations.slice(0, 5).map(function (item) {
      return { title: item.title, meta: item.category || "Customer", detail: item.description, pill: item.priority || "review" };
    }), "No customer recommendations yet.");
    renderList("#customerFollowupNeeded", followup.slice(0, 5).map(function (item) {
      return { title: item.customerName, meta: item.service, detail: item.recommendedAction, pill: item.priority || "follow-up" };
    }), "No follow-ups needed.");
    renderList("#customerReviewsNeeded", reviews.slice(0, 5).map(function (item) {
      return { title: item.customerName, meta: item.service, detail: item.recommendedAction, pill: "review" };
    }), "No review requests needed.");
    if ($("#customerSuccessResult")) {
      $("#customerSuccessResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderCustomerCrmDashboard(payload) {
    var data = unwrap(payload);
    renderCards("#customerCrmMetrics", [
      ["Total Customers", data.totalCustomers || 0],
      ["New This Month", data.newThisMonth || 0],
      ["Returning", data.returning || 0],
      ["Jobs", data.jobs || 0],
      ["Revenue", money(data.revenuePlaceholder || 0)],
      ["Avg Response", data.averageResponseTimePlaceholder || "ready"]
    ]);
  }

  async function refreshCustomerCrm() {
    var target = $("#customerCrmList");
    if (target) target.innerHTML = '<p class="muted">Loading customers...</p>';
    var dashboard = await customerApi("customer.dashboard", {});
    renderCustomerCrmDashboard(dashboard);
    var query = $("#customerSearchInput") ? $("#customerSearchInput").value : "";
    var filter = $("#customerFilter") ? $("#customerFilter").value : "active";
    var search = await customerApi("customer.search", { query: query, filter: filter });
    renderCustomerList(unwrap(search), query, filter);
  }

  function renderCustomerList(customers, query, filter) {
    var target = $("#customerCrmList");
    if (!target) return;
    var emptyText = query ? "No customers match that search." : "No customers found for this filter.";
    if (filter === "archived") emptyText = "No archived customers.";
    target.innerHTML = customers && customers.length ? customers.map(function (customer) {
      return '<div class="row"><strong>' + escapeHtml(customer.fullName || customer.name) + '<br><span class="muted">' + escapeHtml(customer.company || "") + '</span></strong><span>' + escapeHtml(customer.phone || "") + '<br><span class="muted">' + escapeHtml(customer.email || "") + '</span></span><span>' + escapeHtml(customer.city || "") + ' ' + escapeHtml(customer.state || "") + '<br><span class="muted">' + escapeHtml((customer.tags || []).join(", ")) + '</span></span><span><button class="btn" data-customer-profile="' + escapeHtml(customer.id) + '" type="button">Open</button></span></div>';
    }).join("") : '<p class="muted">' + escapeHtml(emptyText) + '</p>';
    $all("[data-customer-profile]", target).forEach(function (button) {
      button.addEventListener("click", function () {
        loadCustomerProfile(button.dataset.customerProfile).catch(function (error) {
          $("#customerCrmDetail").textContent = error.message;
        });
      });
    });
  }

  async function loadCustomerProfile(customerId) {
    if ($("#customerCrmDetail")) $("#customerCrmDetail").textContent = "Loading customer profile...";
    var profileResponse = await customerApi("customer.profile", { customerId: customerId });
    var profile = unwrap(profileResponse);
    fillCustomerForm(profile.customer);
    renderCustomerProfile(profile);
    if ($("#customerFormStatus")) $("#customerFormStatus").textContent = "Customer loaded.";
  }

  function renderCustomerProfile(profile) {
    var customer = profile.customer || {};
    $("#customerCrmDetail").textContent = JSON.stringify(customer, null, 2);
    $("#customerCrmSummary").textContent = JSON.stringify(profile.summary || {}, null, 2);
    if ($("#customerNoteForm")) $("#customerNoteForm").elements.customerId.value = customer.id || "";
    renderList("#customerCrmTimeline", (profile.timeline || []).map(function (item) {
      return { title: item.title, meta: item.type, detail: item.description, pill: String(item.timestamp || "").slice(0, 10) };
    }), "No timeline events yet.");
    renderList("#customerCrmNotes", (profile.notes || []).map(function (note) {
      return { title: note.pinned ? "Pinned Note" : "Note", meta: note.internal ? "Internal" : "Customer", detail: note.body, pill: String(note.updatedAt || note.createdAt || "").slice(0, 10) };
    }), "No notes yet.");
  }

  function fillCustomerForm(customer) {
    var form = $("#customerForm");
    if (!form || !customer) return;
    Object.keys(customer).forEach(function (key) {
      if (form.elements[key]) {
        form.elements[key].value = Array.isArray(customer[key]) ? customer[key].join(", ") : customer[key] || "";
      }
    });
    if (form.elements.fullName) form.elements.fullName.value = customer.fullName || customer.name || "";
  }

  function resetCustomerForm() {
    var form = $("#customerForm");
    if (!form) return;
    form.reset();
    form.elements.id.value = "";
    form.state.value = "CA";
    $("#customerCrmDetail").textContent = "";
    $("#customerCrmSummary").textContent = "";
    $("#customerCrmTimeline").innerHTML = '<p class="muted">Select a customer.</p>';
    $("#customerCrmNotes").innerHTML = '<p class="muted">Select a customer.</p>';
    if ($("#customerNoteForm")) $("#customerNoteForm").elements.customerId.value = "";
  }

  function renderJobDispatch(payload) {
    var data = unwrap(payload);
    renderCards("#jobDispatchMetrics", [
      ["Open Jobs", data.openJobs || 0],
      ["Today's Jobs", data.todaysJobs || 0],
      ["Completed", data.completedJobs || 0],
      ["Avg Hours", data.averageCompletionTime || 0],
      ["Emergency", data.emergencyJobs || 0],
      ["Technicians", Object.keys(data.technicianWorkload || {}).length]
    ]);
    renderList("#jobDispatchList", (data.jobs || []).map(function (job) {
      return { title: job.jobNumber + " " + (job.title || job.service), meta: job.customerName || "Customer", detail: (job.assignedTechnician || "Unassigned") + " | " + (job.startDate || "Not scheduled"), pill: job.priority || job.status };
    }), "No jobs yet.");
    renderList("#jobDispatchSchedule", (data.availableSlots || []).slice(0, 8).map(function (slot) {
      return { title: slot.label, meta: slot.startDate, detail: slot.endDate, pill: "available" };
    }), "No available slots.");
    if ($("#jobDispatchAi")) $("#jobDispatchAi").textContent = JSON.stringify(data.aiDispatch || {}, null, 2);
    attachJobOpenButtons(data.jobs || []);
  }

  function attachJobOpenButtons(jobs) {
    var target = $("#jobDispatchList");
    if (!target || !jobs.length) return;
    target.innerHTML = jobs.map(function (job) {
      return '<div class="row"><strong>' + escapeHtml(job.jobNumber) + '<br><span class="muted">' + escapeHtml(job.title || job.service) + '</span></strong><span>' + escapeHtml(job.customerName || "") + '<br><span class="muted">' + escapeHtml(job.address || "") + '</span></span><span>' + escapeHtml(job.assignedTechnician || "Unassigned") + '<br><span class="muted">' + escapeHtml(job.startDate || "Not scheduled") + '</span></span><span><button class="btn" data-job-open="' + escapeHtml(job.id) + '" type="button">Open</button></span></div>';
    }).join("");
    $all("[data-job-open]", target).forEach(function (button) {
      button.addEventListener("click", function () {
        loadJobDetails(button.dataset.jobOpen).catch(function (error) {
          $("#jobDispatchDetails").textContent = error.message;
        });
      });
    });
  }

  async function refreshJobDispatch() {
    if ($("#jobDispatchList")) $("#jobDispatchList").innerHTML = '<p class="muted">Loading jobs...</p>';
    renderJobDispatch(await jobApi("job.dashboard", {}));
  }

  async function loadJobDetails(jobId) {
    var response = await jobApi("job.details", { jobId: jobId });
    var data = unwrap(response);
    fillJobForm(data.job);
    $("#jobDispatchDetails").textContent = JSON.stringify(data.job, null, 2);
    $("#jobDispatchAi").textContent = JSON.stringify(data.aiDispatch || {}, null, 2);
    renderList("#jobDispatchTimeline", (data.timeline || []).map(function (item) {
      return { title: item.title, meta: item.type, detail: item.description, pill: String(item.timestamp || "").slice(0, 10) };
    }), "No job timeline yet.");
  }

  function fillJobForm(job) {
    var form = $("#jobForm");
    if (!form || !job) return;
    Object.keys(job).forEach(function (key) {
      if (form.elements[key]) form.elements[key].value = job[key] || "";
    });
    if (job.startDate && form.elements.startDate) form.elements.startDate.value = String(job.startDate).slice(0, 16);
  }

  function resetJobForm() {
    var form = $("#jobForm");
    if (!form) return;
    form.reset();
    form.elements.id.value = "";
    form.elements.city.value = "Los Angeles";
    $("#jobDispatchDetails").textContent = "";
    $("#jobDispatchTimeline").innerHTML = '<p class="muted">Select a job.</p>';
  }

  function renderRevenueDashboard(payload) {
    var data = unwrap(payload);
    renderCards("#estimateMetrics", [
      ["Revenue Today", money(data.revenueToday || 0)],
      ["This Week", money(data.revenueThisWeek || 0)],
      ["This Month", money(data.revenueThisMonth || 0)],
      ["Outstanding", money(data.outstandingBalance || 0)],
      ["Overdue", data.overdueInvoices || 0],
      ["Paid", data.paidInvoices || 0],
      ["Conversion", (data.estimateConversionRate || 0) + "%"],
      ["Avg Ticket", money(data.averageTicket || 0)]
    ]);
    renderList("#revenueEstimateList", (data.estimates || []).map(function (estimate) {
      return { title: estimate.id, meta: estimate.customerName, detail: money(estimate.total || estimate.recommended), pill: estimate.status || "draft" };
    }), "No estimates yet.");
    renderList("#revenueInvoiceList", (data.invoices || []).map(function (invoice) {
      return { title: invoice.invoiceNumber || invoice.id, meta: invoice.customerName, detail: money(invoice.outstandingBalance ?? invoice.total), pill: invoice.paymentStatus || invoice.status };
    }), "No invoices yet.");
    renderList("#revenueRecommendationList", (data.aiRevenueRecommendations || []).map(function (item) {
      return { title: item.title, meta: item.customerName, detail: money(item.estimatedRevenue || 0), pill: item.priority || "review" };
    }), "No revenue recommendations yet.");
    $("#estimateResult").textContent = JSON.stringify(data, null, 2);
  }

  async function refreshRevenueFlow() {
    renderRevenueDashboard(await revenueApi("revenue.dashboard", {}));
  }

  function renderMarketingGrowthDashboard(payload) {
    var target = $("#marketingGrowthMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var leadSources = data.leadSources || data.bySource || {};
    var topSource = data.topLeadSource || Object.keys(leadSources).sort(function (a, b) {
      return Number(leadSources[b] || 0) - Number(leadSources[a] || 0);
    })[0] || "none";
    var campaignData = data.campaignPerformance || data;
    var campaigns = campaignData.campaigns || data.campaigns || [];
    var roi = data.marketingRoi || data;
    var localSeo = data.localSeoHealth || data;
    var reviews = data.reviewsReputation || data;
    var social = data.socialMediaPerformance || data;
    var email = data.emailCampaigns || data;
    var recommendations = data.aiMarketingRecommendations || data.recommendations || [];
    var opportunities = data.growthOpportunities || recommendations || [];
    var cards = [
      ["Leads Today", data.leadsToday || data.totalLeads || 0],
      ["Top Source", topSource],
      ["Campaign Leads", campaignData.totalLeads || 0],
      ["Marketing ROI", (roi.roiPercent !== undefined ? roi.roiPercent + "%" : "ready")],
      ["Cost / Lead", roi.costPerLead !== undefined ? money(roi.costPerLead) : money(0)],
      ["Local SEO Health", localSeo.localSeoHealth || localSeo.status || "ready"],
      ["Reviews", reviews.totalReviews || 0],
      ["Social Reach", social.totalReach || 0],
      ["Email Campaigns", email.draftCampaigns || (email.campaigns ? email.campaigns.length : 0)],
      ["Growth Ideas", opportunities.length || 0],
      ["AI Recommendations", recommendations.length || 0],
      ["Mode", data.demoMode ? "demo" : "live"]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    renderList("#marketingLeadSources", Object.keys(leadSources).map(function (source) {
      return { title: source, meta: leadSources[source] + " leads", detail: "Tracked lead source.", pill: "source" };
    }), "No lead source data yet.");
    renderList("#marketingCampaignList", campaigns.slice(0, 6).map(function (campaign) {
      return { title: campaign.name || campaign.title, meta: campaign.channel || "campaign", detail: "Leads: " + (campaign.leads || 0) + " | Revenue: " + money(campaign.revenue || 0), pill: campaign.roi !== undefined ? campaign.roi + "%" : "ROI" };
    }), "No campaigns yet.");
    renderList("#marketingGrowthOpportunities", opportunities.slice(0, 6).map(function (item) {
      return { title: item.title || item.name, meta: item.category || "Growth", detail: item.description || item.recommendedAction || item.reasoning, pill: item.priority || "review" };
    }), "No growth opportunities yet.");
    renderList("#marketingRecommendationList", recommendations.slice(0, 6).map(function (item) {
      return { title: item.title || item.name, meta: item.category || "Marketing", detail: item.description || item.recommendedAction || item.reasoning, pill: item.priority || "AI" };
    }), "No marketing recommendations yet.");
    if ($("#marketingGrowthResult")) {
      $("#marketingGrowthResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderAnalyticsReportsDashboard(payload) {
    var target = $("#analyticsReportMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var scorecard = data.businessScorecard || data;
    var kpis = data.kpis || data;
    var insights = data.aiInsightsReport || data.insights || [];
    var weekly = data.weeklyReport || data.report || {};
    var monthly = data.monthlyReport || data.report || {};
    var cards = [
      ["Business Score", scorecard.overall !== undefined ? scorecard.overall + "/100" : "ready"],
      ["Revenue", money(kpis.revenue || 0)],
      ["Leads", kpis.leads || 0],
      ["Conversion", kpis.conversionRate !== undefined ? kpis.conversionRate + "%" : "ready"],
      ["Open Jobs", kpis.openJobs || 0],
      ["Completed Jobs", kpis.completedJobs || 0],
      ["Customers", kpis.customers || 0],
      ["Marketing Leads", kpis.marketingLeads || 0],
      ["Revenue Trends", data.revenueTrends || data.revenueTrend || "ready"],
      ["Sales Trends", data.salesTrends || data.salesTrend || "ready"],
      ["Operations Trends", data.operationsTrends || data.operationsTrend || "ready"],
      ["Customer Trends", data.customerTrends || data.customerTrend || "ready"],
      ["Marketing Trends", data.marketingTrends || data.marketingTrend || "ready"],
      ["AI Insights", insights.length || 0]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    renderList("#analyticsScorecardList", ["sales", "operations", "finance", "customers", "marketing"].map(function (key) {
      return { title: key.charAt(0).toUpperCase() + key.slice(1), meta: (scorecard[key] !== undefined ? scorecard[key] + "/100" : "ready"), detail: "Scorecard category", pill: scorecard.status || "score" };
    }), "No scorecard data yet.");
    renderList("#analyticsInsightsList", insights.slice(0, 6).map(function (item) {
      return { title: item.title, meta: item.category || "Insight", detail: item.recommendedAction || item.insight, pill: item.priority || "review" };
    }), "No AI insights yet.");
    renderList("#analyticsWeeklyReport", weekly.title ? [
      { title: weekly.title, meta: "Weekly", detail: weekly.summary, pill: "report" }
    ].concat((weekly.focus || []).map(function (focus) {
      return { title: focus, meta: "Focus", detail: "Recommended weekly focus item.", pill: "weekly" };
    })) : [], "No weekly report yet.");
    renderList("#analyticsMonthlyReport", monthly.title ? [
      { title: monthly.title, meta: "Monthly", detail: monthly.summary, pill: "report" }
    ].concat((monthly.focus || []).map(function (focus) {
      return { title: focus, meta: "Focus", detail: "Recommended monthly focus item.", pill: "monthly" };
    })) : [], "No monthly report yet.");
    if ($("#analyticsReportsResult")) {
      $("#analyticsReportsResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderDispatchAIDashboard(payload) {
    var target = $("#dispatchAIMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var schedule = data.todaySchedule || data.aiDispatchSuggestions || [];
    var techs = data.technicianAvailability || data.technicians || [];
    var routes = data.routeSuggestions || (data.routes || []);
    var eta = data.eta || [];
    var emergency = data.emergencyJobs || [];
    var conflicts = data.scheduleConflicts || [];
    var capacity = data.capacity || data;
    var suggestions = data.aiDispatchSuggestions || data.matches || [];
    var cards = [
      ["Today Schedule", schedule.length || 0],
      ["Technicians", techs.length || 0],
      ["Route Suggestions", routes.length || 0],
      ["ETA Windows", eta.length || 0],
      ["Emergency Jobs", emergency.length || 0],
      ["Conflicts", conflicts.length || 0],
      ["Capacity Load", capacity.loadPercent !== undefined ? capacity.loadPercent + "%" : "ready"],
      ["Schedule Health", data.scheduleHealth ? data.scheduleHealth.score + "/100" : (capacity.status || "ready")]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    renderList("#dispatchAISchedule", schedule.slice(0, 8).map(function (item) {
      return { title: item.jobTitle || item.title, meta: item.recommendedWindow || item.service, detail: item.technician || item.customerName || item.reason, pill: item.conflict ? "conflict" : "scheduled" };
    }), "No schedule items yet.");
    renderList("#dispatchAITechnicians", techs.slice(0, 8).map(function (tech) {
      return { title: tech.name, meta: tech.category || "Technician", detail: (tech.city || "") + " | " + (tech.availability || "Check availability"), pill: tech.workload || tech.status || "ready" };
    }), "No technician availability yet.");
    renderList("#dispatchAIRoutes", routes.slice(0, 8).map(function (route) {
      return { title: route.title || route.technician || route.jobTitle, meta: route.detail || route.routeNote || "Route", detail: route.driveMinutes ? route.driveMinutes + " min estimated drive" : (route.stops ? route.stops.length + " stops" : "Verify in maps"), pill: "route" };
    }), "No route suggestions yet.");
    renderList("#dispatchAIETA", eta.slice(0, 8).map(function (item) {
      return { title: item.jobTitle || item.title, meta: item.technician, detail: item.etaWindow || item.note, pill: item.confidence !== undefined ? Math.round(Number(item.confidence) * 100) + "%" : "ETA" };
    }), "No ETA windows yet.");
    renderList("#dispatchAIEmergency", emergency.slice(0, 8).map(function (job) {
      return { title: job.title || job.jobTitle, meta: job.customerName || job.service, detail: job.recommendedAction || job.suggestedTechnician, pill: job.priority || "HIGH" };
    }), "No emergency jobs.");
    renderList("#dispatchAIConflicts", conflicts.slice(0, 8).map(function (conflict) {
      return { title: conflict.title || conflict.jobTitle || "Schedule conflict", meta: conflict.technician || "Dispatch", detail: conflict.reason || conflict.action || "Owner review recommended.", pill: "conflict" };
    }), "No schedule conflicts.");
    renderList("#dispatchAISuggestions", suggestions.slice(0, 8).map(function (item) {
      return { title: item.jobTitle || item.title, meta: item.technician || item.suggestedTechnician || item.service, detail: item.reason || item.action || item.recommendedAction, pill: item.confidence !== undefined ? Math.round(Number(item.confidence) * 100) + "%" : "AI" };
    }), "No AI dispatch suggestions yet.");
    if ($("#dispatchAIResult")) {
      $("#dispatchAIResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderSaasDashboard(payload) {
    var target = $("#saasMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var orgs = data.organizations || [];
    var teams = data.teams || data.users || [];
    var roles = data.roles || [];
    var permissions = data.permissions || [];
    var settings = data.settings || [];
    var health = data.tenantHealth || data;
    var context = data.tenantContext || data;
    var cards = [
      ["Organizations", orgs.length || data.organizationsCount || 0],
      ["Teams", teams.length || data.activeUsers || 0],
      ["Roles", roles.length || data.roleCount || 0],
      ["Permissions", permissions.length || data.permissionCount || 0],
      ["Settings", settings.length || 0],
      ["Tenant Health", health.score !== undefined ? health.score + "/100" : "ready"],
      ["Mode", context.mode || (data.jsonFallbackOnly ? "json_fallback" : "ready")],
      ["Supabase", context.supabaseConnected || data.supabaseConnected ? "connected" : "not connected"]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    renderList("#saasOrganizations", orgs.slice(0, 8).map(function (org) {
      return { title: org.name, meta: org.city || org.slug || "Organization", detail: org.industry || org.ownerEmail || "Tenant organization", pill: org.status || "active" };
    }), "No organizations yet.");
    renderList("#saasTeams", teams.slice(0, 8).map(function (user) {
      return { title: user.name || user.email, meta: user.role || "viewer", detail: user.email || user.organizationId || "Team member", pill: user.status || "active" };
    }), "No team members yet.");
    renderList("#saasPermissions", permissions.slice(0, 10).map(function (permission) {
      return { title: permission.role, meta: permission.resource + " / " + permission.action, detail: permission.effect || "allow", pill: permission.status || "active" };
    }), "No permissions yet.");
    renderList("#saasSettings", settings.slice(0, 8).map(function (setting) {
      return { title: setting.key, meta: setting.scope || "tenant", detail: String(setting.value || "configured"), pill: setting.status || "active" };
    }), "No tenant settings yet.");
    renderList("#saasTenantHealth", [
      { title: "Tenant isolation", meta: data.jsonFallbackOnly ? "JSON fallback" : "ready", detail: "Future production data should include tenant_id and role-scoped access.", pill: "foundation" },
      { title: "Default roles", meta: roles.length + " roles", detail: "Admin, manager, dispatcher, technician, customer, and viewer are expected.", pill: roles.length >= 6 ? "ready" : "review" },
      { title: "Permission coverage", meta: permissions.length + " permissions", detail: "Permissions prepare server-side role checks for SaaS.", pill: permissions.length ? "ready" : "review" },
      { title: "Supabase/PostgreSQL", meta: "not connected", detail: "Prepared for a future sprint; this sprint uses JSON only.", pill: "future" }
    ], "No tenant health data yet.");
    if ($("#saasResult")) {
      $("#saasResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderBillingDashboard(payload) {
    var target = $("#billingMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var plans = data.plans || [];
    var subscriptions = data.subscriptionStatus || data.subscriptions || [];
    var usage = data.usage || data;
    var usageTotals = usage.totals || {};
    var invoices = data.invoices || [];
    var payment = data.paymentStatus || data;
    var recommendations = data.upgradeRecommendations || [];
    var cards = [
      ["Plans", plans.length || 0],
      ["Subscriptions", subscriptions.length || data.activeSubscriptions || 0],
      ["Usage Metrics", Object.keys(usageTotals).length || 0],
      ["Invoices", invoices.length || data.openInvoices || 0],
      ["Payment Status", payment.status || "ready"],
      ["Stripe", payment.stripeConnected || data.stripeConnected ? "connected" : "not connected"],
      ["Card Data", payment.cardDataStored ? "stored" : "not stored"],
      ["Recommendations", recommendations.length || 0]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    renderList("#billingPlans", plans.slice(0, 6).map(function (plan) {
      return { title: plan.name, meta: money(plan.monthlyPrice || 0) + " / month", detail: "Leads: " + (plan.leadLimit || "custom") + " | Users: " + (plan.userLimit || "custom"), pill: plan.status || "draft" };
    }), "No billing plans yet.");
    renderList("#billingSubscriptions", subscriptions.slice(0, 6).map(function (subscription) {
      return { title: subscription.planName || subscription.planId, meta: subscription.status || "draft", detail: "Seats: " + (subscription.seats || 1) + " | Provider: " + (subscription.paymentProvider || "none"), pill: subscription.billingCycle || "monthly" };
    }), "No subscriptions yet.");
    renderList("#billingUsage", Object.keys(usageTotals).map(function (metric) {
      return { title: metric, meta: usageTotals[metric], detail: "Tracked usage metric for future plan limits.", pill: "usage" };
    }), "No usage data yet.");
    renderList("#billingInvoices", invoices.slice(0, 6).map(function (invoice) {
      return { title: invoice.id, meta: money(invoice.amount || 0), detail: invoice.dueDate || invoice.source || "Billing invoice", pill: invoice.status || "draft" };
    }), "No invoices yet.");
    renderList("#billingPaymentStatus", [
      { title: "Payment provider", meta: payment.paymentProvider || "none", detail: "Stripe is intentionally not connected.", pill: "safe" },
      { title: "Payment processing", meta: payment.paymentProcessingEnabled ? "enabled" : "disabled", detail: "No real payment processing in Sprint 16.", pill: "disabled" },
      { title: "Card data", meta: payment.cardDataStored ? "stored" : "not stored", detail: "Card data must never be stored locally.", pill: "safe" },
      { title: "Recommended action", meta: payment.status || "ready", detail: payment.recommendedAction || "Finalize pricing first.", pill: "review" }
    ], "No payment status yet.");
    renderList("#billingUpgradeRecommendations", recommendations.slice(0, 6).map(function (item) {
      return { title: item.title, meta: item.priority || "Review", detail: item.recommendedAction || item.reason, pill: "upgrade" };
    }), "No upgrade recommendations yet.");
    if ($("#billingResult")) {
      $("#billingResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderIntegrationsDashboard(payload) {
    var target = $("#integrationsMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var registry = data.registry || [];
    var apiKeys = data.apiKeys || [];
    var webhooks = data.webhooks || [];
    var connectedApps = data.connectedApps || [];
    var logs = data.integrationLogs || data.logs || [];
    var notes = data.developerNotes || [];
    var health = data.integrationHealth || data;
    var cards = [
      ["Registry", registry.length || 0],
      ["API Keys", apiKeys.length || 0],
      ["Webhooks", webhooks.length || 0],
      ["Connected Apps", connectedApps.length || 0],
      ["Logs", logs.length || 0],
      ["External APIs", health.externalConnectionsEnabled ? "connected" : "not connected"],
      ["Webhook Delivery", health.webhookDeliveryEnabled ? "enabled" : "disabled"],
      ["Secrets", health.realSecretsExposed ? "review" : "masked"]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    renderList("#integrationsApiKeys", apiKeys.slice(0, 8).map(function (key) {
      return { title: key.name, meta: key.prefix || "not_generated", detail: "Scopes: " + ((key.scopes || []).join(", ") || "none"), pill: key.status || "draft" };
    }), "No API key metadata yet.");
    renderList("#integrationsWebhooks", webhooks.slice(0, 8).map(function (webhook) {
      return { title: webhook.name, meta: webhook.event, detail: webhook.targetUrl || "Target URL not configured", pill: webhook.status || "draft" };
    }), "No webhooks yet.");
    renderList("#integrationsConnectedApps", connectedApps.slice(0, 8).map(function (app) {
      return { title: app.name, meta: app.category || "Integration", detail: "Future connection placeholder.", pill: app.status || "planned" };
    }), "No connected app plans yet.");
    renderList("#integrationsLogs", logs.slice(0, 8).map(function (log) {
      return { title: log.event, meta: log.source || "system", detail: log.message || log.createdAt, pill: log.status || "info" };
    }), "No integration logs yet.");
    renderList("#integrationsDeveloperNotes", notes.map(function (note) {
      return { title: note, meta: "Developer note", detail: "Owner/developer review before production integrations.", pill: "note" };
    }), "No developer notes yet.");
    if ($("#integrationsResult")) {
      $("#integrationsResult").textContent = JSON.stringify(payload, null, 2);
    }
  }

  function renderBetaCenter(view) {
    var target = $("#betaMetrics");
    if (!target) return;
    var data = betaDemoData();
    var cards = [
      ["Readiness Score", data.betaReadinessScore + "/100"],
      ["Demo Time", "10 min"],
      ["Demo Customers", data.demoCustomers.length],
      ["Demo Jobs", data.demoJobs.length],
      ["Demo Estimates", data.demoEstimates.length],
      ["Demo Invoices", data.demoInvoices.length],
      ["Known Limitations", data.limitations.length],
      ["Feedback Fields", data.feedbackFields.length]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    renderList("#betaWelcomeWizard", data.welcomeWizard.map(function (step, index) {
      return { title: "Step " + (index + 1), meta: "Welcome Wizard", detail: step, pill: "demo" };
    }), "No wizard steps.");
    renderList("#betaFeatureTour", data.productTour.map(function (item) {
      return { title: item.title, meta: "Product Tour", detail: item.value, pill: "tour" };
    }), "No tour items.");
    renderList("#betaDemoCompany", Object.keys(data.demoCompany).map(function (key) {
      return { title: key, meta: "Demo Company", detail: data.demoCompany[key], pill: "demo" };
    }), "No demo company.");
    renderList("#betaDemoCustomers", data.demoCustomers.map(function (customer) {
      return { title: customer.name, meta: customer.city, detail: customer.serviceNeed, pill: customer.status };
    }), "No demo customers.");
    renderList("#betaDemoJobs", data.demoJobs.map(function (job) {
      return { title: job.title, meta: job.customerName, detail: job.status + " | " + money(job.value), pill: job.priority };
    }), "No demo jobs.");
    renderList("#betaDemoEstimates", data.demoEstimates.map(function (estimate) {
      return { title: estimate.service, meta: estimate.customerName, detail: money(estimate.low) + " - " + money(estimate.high) + " | Recommended " + money(estimate.recommended), pill: estimate.status };
    }), "No demo estimates.");
    renderList("#betaDemoInvoices", data.demoInvoices.map(function (invoice) {
      return { title: invoice.id, meta: invoice.customerName, detail: money(invoice.amount), pill: invoice.status };
    }), "No demo invoices.");
    renderList("#betaKnownLimitations", data.limitations.map(function (item) {
      return { title: item, meta: "Known limitation", detail: "Explain before customer demo.", pill: "transparent" };
    }), "No known limitations.");
    renderList("#betaFeedbackForm", data.feedbackFields.map(function (field) {
      return { title: field, meta: "Feedback Form", detail: "Capture manually during beta demo.", pill: "field" };
    }), "No feedback fields.");
    renderList("#betaReleaseChecklist", data.checklist.map(function (item) {
      return { title: item, meta: "Release Checklist", detail: "Required before first beta customer.", pill: "ready" };
    }), "No checklist items.");
    if ($("#betaResult")) {
      $("#betaResult").textContent = JSON.stringify({ view: view || "dashboard", data: data }, null, 2);
    }
  }

  function renderReleaseCenter(view) {
    var target = $("#releaseMetrics");
    if (!target) return;
    var data = releaseCandidateData();
    var cards = [
      ["Release", data.version],
      ["System Health", data.systemHealth],
      ["Performance Score", data.performanceScore + "/100"],
      ["Security Score", data.securityScore + "/100"],
      ["Test Coverage", data.testCoverage],
      ["Deployment", data.deploymentStatus],
      ["Modules", data.installedModules.length],
      ["Readiness", data.overallReadiness + "/100"]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    renderList("#releaseArchitecture", data.architecture.map(function (item) {
      return { title: item.title, meta: "Architecture", detail: item.detail, pill: "V1" };
    }), "No architecture notes.");
    renderList("#releaseSystemHealth", [
      { title: "System Health", meta: data.systemHealth, detail: "Core pages, dashboard, API layer, docs, and tests are present.", pill: "healthy" },
      { title: "Performance Score", meta: data.performanceScore + "/100", detail: "Large file warnings still require release review.", pill: "review" },
      { title: "Security Score", meta: data.securityScore + "/100", detail: "Security keyword warnings require human confirmation.", pill: "review" },
      { title: "Test Coverage", meta: data.testCoverage, detail: "Focused tests exist for major centers and release candidate.", pill: "tests" }
    ], "No system health data.");
    renderList("#releaseInstalledModules", data.installedModules.map(function (name) {
      return { title: name, meta: "Installed Module", detail: "Included in V1.0 release candidate review.", pill: "installed" };
    }), "No installed modules.");
    renderList("#releaseNotes", data.releaseNotes.map(function (note) {
      return { title: note, meta: "Release Note", detail: "Review with first beta customers.", pill: "note" };
    }), "No release notes.");
    renderList("#releaseVersionHistory", data.versionHistory.map(function (item) {
      return { title: item, meta: "Version History", detail: "Project Titan release path.", pill: "version" };
    }), "No version history.");
    renderList("#releaseDeploymentStatus", data.deploymentChecklist.map(function (item) {
      return { title: item, meta: "Deployment Gate", detail: "Approval required before production action.", pill: "gate" };
    }), "No deployment status.");
    if ($("#releaseResult")) {
      $("#releaseResult").textContent = JSON.stringify({ view: view || "dashboard", data: data }, null, 2);
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

  function renderDecision(payload) {
    var target = $("#decisionMetrics");
    if (!target || !payload) return;
    var data = payload.data || payload;
    var decision = data.decision || data;
    var validation = data.validation || {};
    var policies = data.policies || (data.engine && data.engine.policies) || {};
    var recent = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
    var cards = [
      ["Decision Status", data.status || validation.status || "ready"],
      ["Decision Queue", recent.length || "ready"],
      ["Decision Confidence", decision.confidence !== undefined ? Math.round(decision.confidence * 100) + "%" : "ready"],
      ["Recent Decisions", recent.length || "ready"],
      ["Policy Health", policies.status || "ready"],
      ["Priority", decision.priority || "ready"],
      ["Risk", decision.risk || "ready"]
    ];
    target.innerHTML = cards.map(function (metric) {
      return '<article class="card"><p class="muted">' + metric[0] + '</p><div class="metric">' + escapeHtml(metric[1]) + '</div></article>';
    }).join("");
    if ($("#decisionResult")) {
      $("#decisionResult").textContent = JSON.stringify(payload, null, 2);
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

  async function refreshFounderDashboard() {
    var results = await Promise.all([
      executiveApi("executive.dashboard", {}).catch(function () { return { data: fallbackExecutive() }; }),
      executiveApi("executive.briefing", {}).catch(function () { return { data: fallbackBriefing() }; }),
      recommendationIntelligenceApi("recommendation.generate", { record: false }).catch(function () { return { data: fallbackRecommendations() }; }),
      salesApi("sales.dashboard", {}).catch(function () { return { data: fallbackSales() }; }),
      workflowApi("workflow.status", {}).catch(function () { return { data: fallbackWorkflow() }; }),
      workflowApi("workflow.history", { limit: 10 }).catch(function () { return { data: [] }; }),
      workflowApi("workflow.events", { limit: 10 }).catch(function () { return { data: [] }; }),
      brainApi("brain.status", {}).catch(function () { return { data: { status: "ready" } }; })
    ]);
    var workflowStatus = unwrap(results[4]);
    var workflowHistory = unwrap(results[5]);
    var workflowEvents = unwrap(results[6]);
    renderFounderDashboard({
      executive: unwrap(results[0]),
      briefing: unwrap(results[1]),
      recommendations: unwrap(results[2]),
      sales: unwrap(results[3]),
      workflow: {
        status: workflowStatus.status || "ready",
        registry: workflowStatus.registry || {},
        workflowCount: workflowStatus.registry ? workflowStatus.registry.workflowCount : 0,
        supportedEvents: workflowStatus.registry ? workflowStatus.registry.supportedEvents : [],
        historyCount: Array.isArray(workflowHistory) ? workflowHistory.length : 0,
        eventCount: Array.isArray(workflowEvents) ? workflowEvents.length : 0,
        pendingApprovals: Array.isArray(workflowHistory) ? workflowHistory.filter(function (item) { return item.status === "needs_approval"; }).length : 0
      },
      brain: unwrap(results[7])
    });
  }

  function unwrap(response) {
    return response && response.data !== undefined ? response.data : response || {};
  }

  function fallbackExecutive() {
    return {
      businessHealth: { overallScore: 72, status: "demo" },
      revenueToday: 0,
      revenueThisMonth: 0,
      openJobs: 0,
      openEstimates: 0,
      averageJobValue: 0,
      collections: 0,
      technicianUtilization: 0,
      businessRisks: [],
      growthOpportunities: [],
      aiPriorityQueue: [],
      kpis: { customerSatisfaction: { score: "ready" }, inventoryStatus: { status: "ready" } }
    };
  }

  function fallbackBriefing() {
    return {
      executiveSummary: "Add leads, estimates, projects, invoices, and workflow activity to unlock stronger executive intelligence."
    };
  }

  function fallbackRecommendations() {
    return {
      aiPriorityQueue: [
        { title: "Review new leads", category: "Sales", priority: "HIGH", description: "Check new requests and book free estimates." },
        { title: "Follow up on open estimates", category: "Sales", priority: "HIGH", description: "Call the highest probability estimate first." }
      ],
      recommendations: []
    };
  }

  function fallbackSales() {
    return {
      salesOverview: {
        bestNextCustomer: "Next qualified lead",
        expectedRevenue: 0,
        probability: 0,
        priority: "MEDIUM",
        recommendedAction: "Add or qualify a lead, then offer a free estimate."
      },
      kpis: { openEstimates: 0, wonEstimates: 0, lostEstimates: 0, conversionRate: 0, averageDealSize: 0, revenuePipeline: 0 },
      todaysFollowups: [],
      revenueOpportunities: []
    };
  }

  function fallbackWorkflow() {
    return {
      status: "ready",
      registry: { workflowCount: 8, supportedEvents: [] }
    };
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
    renderBetaCenter("dashboard");
    renderReleaseCenter("dashboard");
    await refreshFounderDashboard().catch(function () {});
    await operationsApi("operations.dashboard", {}).then(renderOperationsDashboard).catch(function () {});
    await financeApi("finance.dashboard", {}).then(renderFinanceDashboard).catch(function () {});
    await customerSuccessApi("customerSuccess.dashboard", {}).then(renderCustomerSuccessDashboard).catch(function () {});
    await refreshCustomerCrm().catch(function () {});
    await marketingGrowthApi("marketing.dashboard", {}).then(renderMarketingGrowthDashboard).catch(function () {});
    await analyticsReportsApi("analytics.dashboard", {}).then(renderAnalyticsReportsDashboard).catch(function () {});
    await dispatchAIApi("dispatchAI.dashboard", {}).then(renderDispatchAIDashboard).catch(function () {});
    await refreshJobDispatch().catch(function () {});
    await refreshRevenueFlow().catch(function () {});
    await saasApi("saas.dashboard", {}).then(renderSaasDashboard).catch(function () {});
    await billingApi("billing.dashboard", {}).then(renderBillingDashboard).catch(function () {});
    await integrationsApi("integrations.dashboard", {}).then(renderIntegrationsDashboard).catch(function () {});
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

    if ($("#customerForm")) {
      $("#customerForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        var form = event.currentTarget;
        var payload = formData(form);
        var action = payload.id ? "customer.update" : "customer.create";
        $("#customerFormStatus").textContent = "Saving customer...";
        try {
          var result = await customerApi(action, payload);
          var customer = unwrap(result);
          $("#customerFormStatus").textContent = "Customer saved.";
          await refreshCustomerCrm();
          await loadCustomerProfile(customer.id);
        } catch (error) {
          $("#customerFormStatus").innerHTML = '<span class="danger">' + escapeHtml(error.message) + '</span>';
        }
      });
    }

    if ($("#resetCustomerForm")) {
      $("#resetCustomerForm").addEventListener("click", resetCustomerForm);
    }

    if ($("#searchCustomers")) {
      $("#searchCustomers").addEventListener("click", function () {
        refreshCustomerCrm().catch(function (error) {
          $("#customerCrmDetail").textContent = error.message;
        });
      });
    }

    if ($("#customerFilter")) {
      $("#customerFilter").addEventListener("change", function () {
        refreshCustomerCrm().catch(function () {});
      });
    }

    [
      ["#archiveCustomerButton", "customer.archive", "Customer archived."],
      ["#restoreCustomerButton", "customer.restore", "Customer restored."],
      ["#deleteCustomerButton", "customer.delete", "Customer deleted."]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      var message = item[2];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var customerId = $("#customerForm").elements.id.value;
          if (!customerId) {
            $("#customerFormStatus").innerHTML = '<span class="danger">Select a customer first.</span>';
            return;
          }
          try {
            await customerApi(action, { customerId: customerId });
            $("#customerFormStatus").textContent = message;
            await refreshCustomerCrm();
            if (action === "customer.delete") {
              resetCustomerForm();
            } else {
              await loadCustomerProfile(customerId);
            }
          } catch (error) {
            $("#customerFormStatus").innerHTML = '<span class="danger">' + escapeHtml(error.message) + '</span>';
          }
        });
      }
    });

    if ($("#customerNoteForm")) {
      $("#customerNoteForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        var form = event.currentTarget;
        var payload = formData(form);
        payload.pinned = form.elements.pinned.checked;
        payload.internal = form.elements.internal.checked;
        $("#customerNoteStatus").textContent = "Saving note...";
        try {
          await customerApi("customer.note", payload);
          $("#customerNoteStatus").textContent = "Note saved.";
          form.elements.body.value = "";
          form.elements.pinned.checked = false;
          await loadCustomerProfile(payload.customerId);
        } catch (error) {
          $("#customerNoteStatus").innerHTML = '<span class="danger">' + escapeHtml(error.message) + '</span>';
        }
      });
    }

    if ($("#jobForm")) {
      $("#jobForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        var form = event.currentTarget;
        var payload = formData(form);
        var action = payload.id ? "job.update" : "job.create";
        $("#jobFormStatus").textContent = "Saving job...";
        try {
          var result = await jobApi(action, payload);
          var job = unwrap(result);
          $("#jobFormStatus").textContent = "Job saved.";
          await refreshJobDispatch();
          await loadJobDetails(job.id);
        } catch (error) {
          $("#jobFormStatus").innerHTML = '<span class="danger">' + escapeHtml(error.message) + '</span>';
        }
      });
    }

    if ($("#resetJobForm")) $("#resetJobForm").addEventListener("click", resetJobForm);
    if ($("#refreshJobDispatch")) $("#refreshJobDispatch").addEventListener("click", function () { refreshJobDispatch().catch(function () {}); });
    if ($("#suggestJobDispatch")) {
      $("#suggestJobDispatch").addEventListener("click", async function () {
        try {
          $("#jobDispatchAi").textContent = JSON.stringify(unwrap(await jobApi("job.aiDispatch", {})), null, 2);
        } catch (error) {
          $("#jobDispatchAi").textContent = error.message;
        }
      });
    }

    [
      ["#assignJobButton", "job.assign"],
      ["#scheduleJobButton", "job.schedule"],
      ["#completeJobButton", "job.complete"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var form = $("#jobForm");
          var payload = formData(form);
          if (!payload.id) {
            $("#jobFormStatus").innerHTML = '<span class="danger">Select or save a job first.</span>';
            return;
          }
          payload.jobId = payload.id;
          $("#jobFormStatus").textContent = "Updating job...";
          try {
            await jobApi(action, payload);
            $("#jobFormStatus").textContent = "Job updated.";
            await refreshJobDispatch();
            await loadJobDetails(payload.jobId);
          } catch (error) {
            $("#jobFormStatus").innerHTML = '<span class="danger">' + escapeHtml(error.message) + '</span>';
          }
        });
      }
    });

    if ($("#revenueEstimateForm")) {
      $("#revenueEstimateForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        var form = event.currentTarget;
        var payload = formData(form);
        var action = payload.id ? "estimate.update" : "estimate.create";
        $("#revenueEstimateStatus").textContent = "Saving estimate...";
        try {
          var result = await revenueApi(action, payload);
          var estimate = unwrap(result);
          form.elements.id.value = estimate.id;
          $("#revenueEstimateStatus").textContent = "Estimate saved.";
          $("#estimateResult").textContent = JSON.stringify(estimate, null, 2);
          await refreshRevenueFlow();
        } catch (error) {
          $("#revenueEstimateStatus").innerHTML = '<span class="danger">' + escapeHtml(error.message) + '</span>';
        }
      });
    }

    [
      ["#approveEstimateButton", "estimate.approve"],
      ["#rejectEstimateButton", "estimate.reject"],
      ["#convertEstimateButton", "estimate.convertToJob"]
    ].forEach(function (item) {
      if ($(item[0])) {
        $(item[0]).addEventListener("click", async function () {
          var estimateId = $("#revenueEstimateForm").elements.id.value;
          if (!estimateId) {
            $("#revenueEstimateStatus").innerHTML = '<span class="danger">Save or select an estimate first.</span>';
            return;
          }
          try {
            var result = await revenueApi(item[1], { estimateId: estimateId });
            $("#revenueEstimateStatus").textContent = "Estimate updated.";
            $("#estimateResult").textContent = JSON.stringify(result, null, 2);
            await refreshRevenueFlow();
            await refreshJobDispatch().catch(function () {});
          } catch (error) {
            $("#revenueEstimateStatus").innerHTML = '<span class="danger">' + escapeHtml(error.message) + '</span>';
          }
        });
      }
    });

    if ($("#revenueInvoiceForm")) {
      $("#revenueInvoiceForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        var form = event.currentTarget;
        var payload = formData(form);
        var action = payload.id ? "invoice.update" : "invoice.create";
        $("#revenueInvoiceStatus").textContent = "Saving invoice...";
        try {
          var result = await revenueApi(action, payload);
          var invoice = unwrap(result);
          form.elements.id.value = invoice.id;
          $("#revenueInvoiceStatus").textContent = "Invoice saved.";
          await refreshRevenueFlow();
        } catch (error) {
          $("#revenueInvoiceStatus").innerHTML = '<span class="danger">' + escapeHtml(error.message) + '</span>';
        }
      });
    }

    [
      ["#markInvoiceSent", "invoice.markSent"],
      ["#markInvoicePaid", "invoice.markPaid"],
      ["#markInvoiceOverdue", "invoice.markOverdue"]
    ].forEach(function (item) {
      if ($(item[0])) {
        $(item[0]).addEventListener("click", async function () {
          var invoiceId = $("#revenueInvoiceForm").elements.id.value;
          if (!invoiceId) {
            $("#revenueInvoiceStatus").innerHTML = '<span class="danger">Save or select an invoice first.</span>';
            return;
          }
          try {
            await revenueApi(item[1], { invoiceId: invoiceId });
            $("#revenueInvoiceStatus").textContent = "Invoice updated.";
            await refreshRevenueFlow();
          } catch (error) {
            $("#revenueInvoiceStatus").innerHTML = '<span class="danger">' + escapeHtml(error.message) + '</span>';
          }
        });
      }
    });

    if ($("#revenuePaymentForm")) {
      $("#revenuePaymentForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        try {
          var result = await revenueApi("payment.record", formData(event.currentTarget));
          $("#revenuePaymentStatus").textContent = "Payment status recorded.";
          $("#customerFinancialResult").textContent = JSON.stringify(result, null, 2);
          await refreshRevenueFlow();
        } catch (error) {
          $("#revenuePaymentStatus").innerHTML = '<span class="danger">' + escapeHtml(error.message) + '</span>';
        }
      });
    }

    if ($("#loadCustomerFinancials")) {
      $("#loadCustomerFinancials").addEventListener("click", async function () {
        try {
          var query = $("#customerFinancialSearch").value.trim();
          $("#customerFinancialResult").textContent = JSON.stringify(await revenueApi("customer.financials", { customerName: query, customerId: query }), null, 2);
        } catch (error) {
          $("#customerFinancialResult").textContent = error.message;
        }
      });
    }

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

    if ($("#refreshFounderDashboard")) {
      $("#refreshFounderDashboard").addEventListener("click", async function () {
        var button = $("#refreshFounderDashboard");
        button.disabled = true;
        try {
          await refreshFounderDashboard();
        } finally {
          button.disabled = false;
        }
      });
    }

    [
      ["#refreshExecutiveDashboard", "executive.dashboard"],
      ["#showExecutiveBriefing", "executive.briefing"],
      ["#showExecutiveKpis", "executive.kpi"],
      ["#showExecutiveForecast", "executive.forecast"],
      ["#showExecutiveRisks", "executive.risks"],
      ["#showExecutiveOpportunities", "executive.opportunities"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderExecutiveDashboard(await executiveApi(action, {}));
          } catch (error) {
            $("#executiveResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    [
      ["#refreshSalesDashboard", "sales.dashboard"],
      ["#showSalesPipeline", "sales.pipeline"],
      ["#showSalesEstimates", "sales.estimates"],
      ["#showSalesFollowups", "sales.followups"],
      ["#showSalesConversion", "sales.conversion"],
      ["#showSalesOpportunitiesEngine", "sales.opportunities"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderSalesDashboard(await salesApi(action, {}));
          } catch (error) {
            $("#salesResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    [
      ["#refreshOperationsDashboard", "operations.dashboard"],
      ["#showOperationsJobs", "operations.jobs"],
      ["#showOperationsTechnicians", "operations.technicians"],
      ["#showOperationsDispatch", "operations.dispatchSuggestions"],
      ["#showOperationsSchedule", "operations.scheduleHealth"],
      ["#showOperationsPriorities", "operations.priorities"],
      ["#showOperationsCustomers", "operations.customerTimeline"],
      ["#showOperationsInventory", "operations.inventoryNeeds"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderOperationsDashboard(await operationsApi(action, {}));
          } catch (error) {
            $("#operationsResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    [
      ["#refreshFinanceDashboard", "finance.dashboard"],
      ["#showFinanceRevenue", "finance.revenue"],
      ["#showFinanceInvoices", "finance.invoices"],
      ["#showFinanceCashflow", "finance.cashflow"],
      ["#showFinanceExpenses", "finance.expenses"],
      ["#showFinanceProfit", "finance.profit"],
      ["#showFinanceForecast", "finance.forecast"],
      ["#showFinanceHealth", "finance.health"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderFinanceDashboard(await financeApi(action, {}));
          } catch (error) {
            $("#financeResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    [
      ["#refreshCustomerSuccessDashboard", "customerSuccess.dashboard"],
      ["#showCustomerHealth", "customerSuccess.health"],
      ["#showCustomerVip", "customerSuccess.vip"],
      ["#showCustomerRisks", "customerSuccess.risks"],
      ["#showCustomerLost", "customerSuccess.lost"],
      ["#showCustomerLtv", "customerSuccess.ltv"],
      ["#showCustomerTimeline", "customerSuccess.timeline"],
      ["#showCustomerRecommendations", "customerSuccess.recommendations"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderCustomerSuccessDashboard(await customerSuccessApi(action, {}));
          } catch (error) {
            $("#customerSuccessResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    [
      ["#refreshMarketingGrowthDashboard", "marketing.dashboard"],
      ["#showMarketingLeads", "marketing.leads"],
      ["#showMarketingCampaigns", "marketing.campaigns"],
      ["#showMarketingLocalSeo", "marketing.localSeo"],
      ["#showMarketingReviews", "marketing.reviews"],
      ["#showMarketingSocial", "marketing.social"],
      ["#showMarketingEmail", "marketing.email"],
      ["#showMarketingRoi", "marketing.roi"],
      ["#showMarketingRecommendations", "marketing.recommendations"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderMarketingGrowthDashboard(await marketingGrowthApi(action, {}));
          } catch (error) {
            $("#marketingGrowthResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    [
      ["#refreshAnalyticsReports", "analytics.dashboard"],
      ["#showAnalyticsKpis", "analytics.kpis"],
      ["#showAnalyticsTrends", "analytics.trends"],
      ["#showAnalyticsReports", "analytics.reports"],
      ["#showAnalyticsScorecard", "analytics.scorecard"],
      ["#showAnalyticsExport", "analytics.export"],
      ["#showAnalyticsInsights", "analytics.insights"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderAnalyticsReportsDashboard(await analyticsReportsApi(action, {}));
          } catch (error) {
            $("#analyticsReportsResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    [
      ["#refreshDispatchAIDashboard", "dispatchAI.dashboard"],
      ["#showDispatchAISchedule", "dispatchAI.schedule"],
      ["#showDispatchAIOptimize", "dispatchAI.optimize"],
      ["#showDispatchAITechnicians", "dispatchAI.technicians"],
      ["#showDispatchAIRoutes", "dispatchAI.routes"],
      ["#showDispatchAIETA", "dispatchAI.eta"],
      ["#showDispatchAICapacity", "dispatchAI.capacity"],
      ["#showDispatchAIEmergency", "dispatchAI.emergency"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderDispatchAIDashboard(await dispatchAIApi(action, {}));
          } catch (error) {
            $("#dispatchAIResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    [
      ["#refreshSaasDashboard", "saas.dashboard"],
      ["#showSaasOrganizations", "saas.organizations"],
      ["#showSaasTeams", "saas.teams"],
      ["#showSaasPermissions", "saas.permissions"],
      ["#showSaasSettings", "saas.settings"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderSaasDashboard(await saasApi(action, {}));
          } catch (error) {
            $("#saasResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    [
      ["#refreshBillingDashboard", "billing.dashboard"],
      ["#showBillingPlans", "billing.plans"],
      ["#showBillingSubscriptions", "billing.subscriptions"],
      ["#showBillingInvoices", "billing.invoices"],
      ["#showBillingUsage", "billing.usage"],
      ["#showBillingStatus", "billing.paymentStatus"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderBillingDashboard(await billingApi(action, {}));
          } catch (error) {
            $("#billingResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    [
      ["#refreshIntegrationsDashboard", "integrations.dashboard"],
      ["#showIntegrationsRegistry", "integrations.registry"],
      ["#showIntegrationsApiKeys", "integrations.apiKeys"],
      ["#showIntegrationsWebhooks", "integrations.webhooks"],
      ["#showIntegrationsLogs", "integrations.logs"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderIntegrationsDashboard(await integrationsApi(action, {}));
          } catch (error) {
            $("#integrationsResult").textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      }
    });

    [
      ["#refreshBetaCenter", "dashboard"],
      ["#showBetaTour", "tour"],
      ["#showBetaScenarios", "scenarios"],
      ["#showBetaChecklist", "checklist"],
      ["#showBetaLimitations", "limitations"]
    ].forEach(function (item) {
      var selector = item[0];
      var view = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", function () {
          renderBetaCenter(view);
        });
      }
    });

    [
      ["#refreshReleaseCenter", "dashboard"],
      ["#showReleaseHealth", "health"],
      ["#showReleaseNotes", "notes"],
      ["#showReleaseReadiness", "readiness"]
    ].forEach(function (item) {
      var selector = item[0];
      var view = item[1];
      if ($(selector)) {
        $(selector).addEventListener("click", function () {
          renderReleaseCenter(view);
        });
      }
    });

    [
      ["#refreshBrainStatus", "brain.status"],
      ["#showBrainHealth", "brain.health"],
      ["#showBrainRecommendation", "recommendation"],
      ["#showExecutiveSummary", "executiveSummary"],
      ["#showMemoryStatus", "memoryStatus"],
      ["#showKnowledgeStatus", "knowledgeStatus"],
      ["#runBrainPipeline", "brain.pipeline"],
      ["#showBrainMetrics", "brain.metrics"],
      ["#showBrainDiagnostics", "brain.diagnostics"]
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
      ["#generateBusinessRecommendations", "recommendation.generate", {}, ""],
      ["#showRevenueOpportunities", "recommendation.generate", { category: "Finance" }, "revenue"],
      ["#showOperationalImprovements", "recommendation.generate", { category: "Operations" }, "operations"],
      ["#showSalesOpportunities", "recommendation.generate", { category: "Sales" }, "sales"],
      ["#showCustomerAttention", "recommendation.generate", { category: "Customer" }, "customer"],
      ["#showAiPriorityQueue", "recommendation.priority", {}, "priority"]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      var payload = item[2];
      var focus = item[3];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderRecommendationIntelligence(await recommendationIntelligenceApi(action, payload), focus);
          } catch (error) {
            $("#recommendationIntelligenceResult").textContent = error.message;
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
      ["#refreshDecisionStatus", "status", {}],
      ["#evaluateDecision", "evaluate", { type: "leadQualification", flags: { businessHours: true } }],
      ["#showDecisionHistory", "history", {}],
      ["#scoreDecision", "score", { contextScore: 88, risk: "LOW" }],
      ["#showDecisionPolicies", "policies", {}]
    ].forEach(function (item) {
      var selector = item[0];
      var action = item[1];
      var payload = item[2];
      if ($(selector)) {
        $(selector).addEventListener("click", async function () {
          var button = $(selector);
          button.disabled = true;
          try {
            renderDecision(await decisionApi(action, payload));
          } catch (error) {
            $("#decisionResult").textContent = error.message;
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
