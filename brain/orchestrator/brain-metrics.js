function now() {
  return Date.now();
}

function measure(label, callback) {
  const startedAt = now();
  try {
    const value = callback();
    return {
      ok: true,
      label,
      value,
      durationMs: now() - startedAt
    };
  } catch (error) {
    return {
      ok: false,
      label,
      error: error.message,
      durationMs: now() - startedAt
    };
  }
}

function summarize(measures = []) {
  const safeMeasures = measures.filter(Boolean);
  const totalMs = safeMeasures.reduce((sum, item) => sum + (Number(item.durationMs) || 0), 0);
  return {
    memoryAccessTimeMs: findDuration(safeMeasures, "memory"),
    contextBuildTimeMs: findDuration(safeMeasures, "context"),
    decisionTimeMs: findDuration(safeMeasures, "decision"),
    pipelineTimeMs: totalMs,
    averageResponseTimeMs: safeMeasures.length ? Math.round(totalMs / safeMeasures.length) : 0,
    measuredAt: new Date().toISOString()
  };
}

function findDuration(measures, label) {
  const found = measures.find((item) => item.label === label);
  return found ? found.durationMs : 0;
}

function status() {
  return {
    status: "ready",
    metrics: [
      "memoryAccessTimeMs",
      "contextBuildTimeMs",
      "decisionTimeMs",
      "pipelineTimeMs",
      "averageResponseTimeMs"
    ]
  };
}

module.exports = {
  measure,
  status,
  summarize
};
