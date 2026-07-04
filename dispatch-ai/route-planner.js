function planRoutes(schedule = []) {
  const byTechnician = schedule.reduce((acc, item) => {
    const key = item.technician || "Manual assignment needed";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const routes = Object.keys(byTechnician).map((technician) => {
    const stops = byTechnician[technician].slice().sort((a, b) => String(a.city || "").localeCompare(String(b.city || "")));
    return {
      technician,
      stops: stops.map((stop, index) => ({
        stopNumber: index + 1,
        jobId: stop.jobId,
        jobTitle: stop.jobTitle,
        city: stop.city || "Los Angeles",
        service: stop.service,
        window: stop.recommendedWindow
      })),
      routeNote: "Verify actual drive time in maps before confirming with customer.",
      estimatedDriveMinutes: Math.max(15, stops.length * 22)
    };
  });

  return {
    routes,
    routeSuggestions: routes.flatMap((route) => route.stops.map((stop) => ({
      technician: route.technician,
      title: stop.jobTitle,
      detail: `${stop.city} | ${stop.window}`,
      driveMinutes: route.estimatedDriveMinutes
    }))),
    generatedAt: new Date().toISOString()
  };
}

module.exports = { planRoutes };
