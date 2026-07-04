function inventoryNeeds(data = {}, jobs = []) {
  const inventory = Array.isArray(data.inventory) ? data.inventory : [];
  const lowItems = inventory.filter((item) => Number(item.quantity || 0) <= Number(item.reorderPoint || 0));
  const inferred = inferNeeds(jobs);
  return {
    lowItems,
    inferredNeeds: inferred,
    status: lowItems.length ? "warning" : inferred.length ? "review" : "healthy"
  };
}

function inferNeeds(jobs) {
  const needs = [];
  if (jobs.some((job) => /camera|security/i.test(job.service))) needs.push("Cameras, cable, connectors, mounting hardware");
  if (jobs.some((job) => /wifi|network/i.test(job.service))) needs.push("Router, access points, ethernet cable, tester");
  if (jobs.some((job) => /computer/i.test(job.service))) needs.push("Diagnostic USB, SSD, backup drive");
  if (jobs.some((job) => /data/i.test(job.service))) needs.push("External storage, recovery workspace, transfer cable");
  return [...new Set(needs)];
}

module.exports = {
  inventoryNeeds
};
