const CURRENT_RELEASE = "v0.7 Platform Foundation";
const CURRENT_SPRINT = "Project Control Center Sprint";

const completedMilestones = [
  "Marketplace dashboard foundation",
  "Phase 6.1 database layer with JSON fallback",
  "Release v0.7 Sprint 1 core platform foundation",
  "Project Titan Sprint Alpha engineering operating system foundation"
];

const nextSprints = [
  "v0.7 Sprint 2 - Supabase readiness and platform health checks",
  "v0.8 Sprint 1 - CompHelp Brain shared memory foundation",
  "v0.9 Sprint 1 - CRM Core pipeline and activity timeline"
];

const blockedItems = [
  "Production Supabase verification needs configured environment variables.",
  "Push and Vercel deployment require explicit owner approval."
];

const backlog = [
  "AI CEO operating brief",
  "AI COO daily operations planner",
  "Customer portal",
  "Vendor portal",
  "Technician app",
  "CompHelp Brain shared memory",
  "Voice AI dispatcher",
  "Plugin marketplace",
  "Mobile app"
];

function qualityGateStatus() {
  return {
    validation: "required",
    gitReview: "required",
    secretCheck: "required",
    ownerApproval: "required",
    deployApproval: "required"
  };
}

function run(context = {}) {
  return {
    ok: true,
    currentSprint: CURRENT_SPRINT,
    releaseStatus: CURRENT_RELEASE,
    nextActions: [
      "Keep this sprint documentation and dashboard-only.",
      "Validate with npm run check-project.",
      "Review git status and diff stat before commit.",
      "Ask owner approval before push or deploy."
    ],
    backlogCount: backlog.length,
    blockedItems,
    qualityGateStatus: qualityGateStatus(),
    recommendedNextStep: "Commit the Project Control Center foundation after validation, then plan v0.7 Sprint 2 Supabase readiness.",
    completedMilestones,
    nextSprints,
    context
  };
}

function roadmapSummary() {
  return {
    currentRelease: CURRENT_RELEASE,
    currentSprint: CURRENT_SPRINT,
    completedMilestones,
    nextSprints,
    blockedItems
  };
}

function backlogSummary() {
  return {
    totalIdeas: backlog.length,
    status: "captured",
    priorityRule: "New ideas go to backlog unless the owner approves a sprint scope change.",
    ideas: backlog
  };
}

function sprintPlan() {
  return {
    currentSprint: CURRENT_SPRINT,
    sprintGoal: "Create a permanent Project Control Center for roadmap, ideas, sprint planning, release tracking, decisions, and focus rules.",
    scope: ["planning docs", "dashboard tab", "Titan API actions", "project-control agent"],
    outOfScope: ["external APIs", "runtime automation", "customer messaging", "deployments"],
    acceptanceCriteria: ["docs created", "dashboard tab added", "API actions return safe JSON", "npm run check-project passes"],
    validationCommands: ["npm run check-project", "git status", "git diff --stat"],
    commitMessage: "Project Control Center - planning foundation"
  };
}

function releasePlan() {
  return {
    releases: [
      "v0.7 Platform Foundation",
      "v0.8 CompHelp Brain",
      "v0.9 CRM Core",
      "v1.0 Business OS MVP",
      "v2.0 SaaS Platform",
      "v3.0 AI Agent Marketplace"
    ]
  };
}

function decisionLog() {
  return {
    decisions: [
      {
        date: "2026-07-03",
        decision: "Use Project Control Center as the permanent planning source.",
        reason: "Prevent scope creep and keep sprint work focused.",
        impact: "All new ideas should be captured before implementation.",
        status: "active"
      }
    ]
  };
}

function focusRules() {
  return {
    rules: [
      "No new features during active sprint without owner approval.",
      "New ideas go to backlog first.",
      "Every sprint must pass CTO review.",
      "Every deploy must be approved.",
      "Every feature must create customer value."
    ]
  };
}

module.exports = {
  CURRENT_RELEASE,
  CURRENT_SPRINT,
  backlogSummary,
  decisionLog,
  focusRules,
  qualityGateStatus,
  releasePlan,
  roadmapSummary,
  run,
  sprintPlan
};
