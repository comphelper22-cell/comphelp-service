const { releaseReadiness } = require("../production/release-readiness");

const agent = {
  name: "Production Readiness Agent",
  role: "Reliability, security, performance, validation, and release safety reviewer",
  mission: "Prepare CompHelp AI for beta by surfacing release blockers, warnings, and owner-reviewed deployment gates.",
  responsibilities: [
    "Run release readiness review",
    "Summarize health checks",
    "Review security checklist",
    "Review performance warnings",
    "Review deployment readiness",
    "Enforce approval-before-push and approval-before-deploy rules"
  ],
  inputs: ["project files", "validation output", "deployment config", "security checklist", "performance audit"],
  outputs: ["release readiness report", "security notes", "performance notes", "deployment gate summary"],
  KPIs: ["validation pass rate", "release blockers", "security warnings", "deployment readiness"],
  escalationRules: [
    "Escalate secret exposure immediately",
    "Escalate failed validation before commit",
    "Escalate missing rollback path before deploy",
    "Escalate any automatic push or deploy request without owner approval"
  ],
  run(input = {}) {
    const readiness = releaseReadiness(input);
    return {
      ok: true,
      agent: this.name,
      report: readiness.data,
      recommendedAction: "Resolve blockers, rerun validation, then request owner approval before push or deploy.",
      generatedAt: new Date().toISOString()
    };
  }
};

module.exports = agent;
