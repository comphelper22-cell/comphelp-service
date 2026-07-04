function demoScenarios() {
  return {
    ok: true,
    data: {
      scenarios: [
        {
          title: "Owner opens dashboard",
          goal: "Understand business health in under 60 seconds.",
          steps: ["Open Founder Command Center", "Review health score", "Review top AI actions"]
        },
        {
          title: "New camera lead arrives",
          goal: "Show lead qualification and estimate follow-up.",
          steps: ["Open Sales Manager", "Review high priority estimate", "Open Dispatch AI for scheduling"]
        },
        {
          title: "Daily operations review",
          goal: "Show jobs, technicians, route suggestions, and risks.",
          steps: ["Open Operations Center", "Open Dispatch AI", "Review schedule conflicts"]
        },
        {
          title: "Owner reviews growth",
          goal: "Show marketing, finance, analytics, and recommendations.",
          steps: ["Open Marketing & Growth", "Open Finance Center", "Open Analytics & Reports"]
        }
      ],
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { demoScenarios };
