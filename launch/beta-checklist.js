function betaChecklist() {
  const items = [
    "Demo data loads without external services.",
    "Founder Command Center explains business health quickly.",
    "Sales, Operations, Finance, Workflow, and Recommendation modules are visible.",
    "Known limitations are explained before the demo.",
    "Feedback form captures user reaction and blockers.",
    "No customer secrets, payment data, or private data are shown.",
    "Owner approval is required before push or deploy."
  ];
  return {
    ok: true,
    data: {
      items: items.map((title, index) => ({ id: `beta_${index + 1}`, title, status: "ready" })),
      requiredForDemo: true,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { betaChecklist };
