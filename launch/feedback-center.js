function feedbackCenter(input = {}) {
  return {
    ok: true,
    data: {
      fields: ["customer_name", "company", "role", "what_was_clear", "what_was_confusing", "top_requested_feature", "would_use_beta", "notes"],
      sampleFeedback: input.sampleFeedback || [],
      storageMode: "manual_or_future_api",
      externalServicesConnected: false,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { feedbackCenter };
