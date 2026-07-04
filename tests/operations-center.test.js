const assert = require("assert");
const operationsEngine = require("../operations/operations-engine");

function run() {
  const result = operationsEngine.dashboard({ data: sampleData() });

  assert.strictEqual(result.ok, true, "Operations dashboard should return ok.");
  assert.ok(Array.isArray(result.data.todaysJobs), "Today's jobs should exist.");
  assert.ok(Array.isArray(result.data.technicianBoard), "Technician board should exist.");
  assert.ok(Array.isArray(result.data.dispatchSuggestions), "Dispatch suggestions should exist.");
  assert.ok(result.data.scheduleHealth.score >= 0, "Schedule health score should exist.");
  assert.ok(Array.isArray(result.data.customerWaiting), "Customer waiting list should exist.");
  assert.ok(result.data.inventoryNeeded, "Inventory needs should exist.");
  assert.ok(Array.isArray(result.data.jobPriorityQueue), "Job priority queue should exist.");

  return {
    ok: true,
    todaysJobs: result.data.todaysJobs.length,
    technicians: result.data.technicianBoard.length,
    urgentJobs: result.data.urgentJobs.length,
    atRiskJobs: result.data.atRiskJobs.length,
    scheduleHealth: result.data.scheduleHealth.score,
    dispatchSuggestions: result.data.dispatchSuggestions.length
  };
}

function sampleData() {
  return {
    projects: [
      {
        id: "job-1",
        title: "Camera install",
        customerName: "Test Customer",
        service: "Security Camera Installation",
        city: "Los Angeles",
        status: "scheduled",
        technician: "Preferred Camera Installer",
        notes: "same-day urgent install"
      },
      {
        id: "job-2",
        title: "WiFi repair",
        customerName: "Waiting Customer",
        service: "WiFi & Network Installation",
        city: "Burbank",
        status: "late",
        technician: "Unassigned",
        notes: "customer waiting"
      }
    ],
    vendors: [
      {
        id: "tech-1",
        name: "Preferred Camera Installer",
        category: "Cameras",
        city: "Los Angeles",
        serviceArea: "Los Angeles County",
        rating: 4.8,
        status: "active",
        availability: "Today"
      }
    ],
    leads: [{ name: "Lead Waiting", service: "Computer Repair", status: "New Lead" }],
    estimates: [],
    inventory: [{ name: "Ethernet Cable", quantity: 0, reorderPoint: 1 }]
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
