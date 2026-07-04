function knownLimitations() {
  return {
    ok: true,
    data: {
      limitations: [
        "External services are not connected in beta demo mode.",
        "Authentication is still internal admin-code based.",
        "Billing is architecture-only and does not process payments.",
        "Public integrations are placeholders and do not send data.",
        "AI provider calls are optional/future for many business modules.",
        "Demo data is synthetic and should not be presented as real customer results."
      ],
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { knownLimitations };
