const assert = require("assert");
const dispatchAiEngine = require("../dispatch-ai/dispatch-ai-engine");

function run() {
  const input = { data: sampleData() };
  const dashboard = dispatchAiEngine.dashboard(input);
  const schedule = dispatchAiEngine.schedule(input);
  const techs = dispatchAiEngine.technicians(input);
  const routes = dispatchAiEngine.routes(input);
  const eta = dispatchAiEngine.eta(input);
  const capacity = dispatchAiEngine.capacity(input);
  const emergency = dispatchAiEngine.emergency(input);

  assert.strictEqual(dashboard.ok, true, "Dispatch dashboard should return ok.");
  assert.ok(Array.isArray(dashboard.data.todaySchedule), "Today schedule should exist.");
  assert.ok(Array.isArray(dashboard.data.technicianAvailability), "Technician availability should exist.");
  assert.ok(Array.isArray(dashboard.data.routeSuggestions), "Route suggestions should exist.");
  assert.ok(Array.isArray(dashboard.data.eta), "ETA output should exist.");
  assert.ok(Array.isArray(dashboard.data.emergencyJobs), "Emergency jobs should exist.");
  assert.strictEqual(schedule.ok, true, "Schedule should return ok.");
  assert.strictEqual(techs.ok, true, "Technicians should return ok.");
  assert.strictEqual(routes.ok, true, "Routes should return ok.");
  assert.strictEqual(eta.ok, true, "ETA should return ok.");
  assert.strictEqual(capacity.ok, true, "Capacity should return ok.");
  assert.strictEqual(emergency.ok, true, "Emergency should return ok.");

  return {
    ok: true,
    scheduled: dashboard.data.todaySchedule.length,
    technicians: dashboard.data.technicianAvailability.length,
    emergencyJobs: dashboard.data.emergencyJobs.length,
    capacityStatus: dashboard.data.capacity.status
  };
}

function sampleData() {
  const now = new Date().toISOString();
  return {
    vendors: [
      { id: "tech-camera", name: "Camera Technician", category: "Cameras", city: "Los Angeles", serviceArea: "Los Angeles, Burbank", rating: 4.9, availability: "Today", status: "active" },
      { id: "tech-network", name: "Network Technician", category: "WiFi", city: "Glendale", serviceArea: "Glendale, Los Angeles", rating: 4.7, availability: "Tomorrow", status: "active" }
    ],
    projects: [
      { id: "job-camera", title: "Urgent camera install", customerName: "Market Customer", service: "Security Camera Installation", city: "Los Angeles", status: "scheduled", scheduledDate: now, notes: "urgent same-day request", technician: "Unassigned" },
      { id: "job-wifi", title: "WiFi tune up", customerName: "Office Customer", service: "WiFi & Network Installation", city: "Glendale", status: "scheduled", scheduledDate: now, notes: "standard job", technician: "Unassigned" }
    ]
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
