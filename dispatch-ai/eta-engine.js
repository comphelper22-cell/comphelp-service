function calculateEta(schedule = [], routes = []) {
  const routeLookup = routes.reduce((acc, route) => {
    acc[route.technician] = route;
    return acc;
  }, {});
  const eta = schedule.map((item, index) => {
    const route = routeLookup[item.technician] || {};
    return {
      jobId: item.jobId,
      jobTitle: item.jobTitle,
      technician: item.technician,
      etaWindow: item.recommendedWindow || fallbackWindow(index),
      confidence: item.confidence || 0.5,
      driveMinutes: route.estimatedDriveMinutes || 20,
      note: "ETA is advisory until route is verified."
    };
  });
  return {
    eta,
    generatedAt: new Date().toISOString()
  };
}

function fallbackWindow(index) {
  const start = 8 + (index % 5) * 2;
  return `${start}:00 - ${start + 2}:00`;
}

module.exports = { calculateEta };
