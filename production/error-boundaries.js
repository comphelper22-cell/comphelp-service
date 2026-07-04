function errorBoundaries(input = {}) {
  return {
    ok: true,
    data: {
      status: "ready",
      apiBoundary: "All new system modules should return { ok, data } or { ok:false, error }.",
      uiBoundary: "Dashboard renderers catch failed module requests and show text output.",
      serverBoundary: "api/system.js wraps requests in try/catch and returns safe JSON.",
      recommendedBoundaries: [
        "Keep module functions side-effect-light.",
        "Never throw raw provider errors to public clients.",
        "Return safe JSON for all API failures.",
        "Log server errors without secrets."
      ],
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { errorBoundaries };
