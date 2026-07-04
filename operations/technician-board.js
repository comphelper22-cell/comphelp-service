function technicianBoard(data = {}, jobs = []) {
  const vendors = Array.isArray(data.vendors) ? data.vendors : [];
  const technicians = vendors.map((vendor) => {
    const assignedJobs = jobs.filter((job) => job.technician === vendor.name || job.technician === vendor.id);
    return {
      technicianId: vendor.id || vendor.name,
      name: vendor.name || "Technician",
      category: vendor.category || "Service",
      city: vendor.city || "Los Angeles",
      serviceArea: vendor.serviceArea || "",
      status: vendor.status || "active",
      availability: vendor.availability || "Check availability",
      rating: Number(vendor.rating || 0),
      assignedJobs: assignedJobs.length,
      workload: assignedJobs.length >= 3 ? "busy" : assignedJobs.length ? "active" : "available"
    };
  });
  if (!technicians.length) {
    technicians.push({
      technicianId: "owner_operator",
      name: "Owner / Dispatcher",
      category: "All Services",
      city: "Los Angeles",
      serviceArea: "Los Angeles County",
      status: "available",
      availability: "Manual scheduling",
      rating: 5,
      assignedJobs: jobs.length,
      workload: jobs.length ? "active" : "available"
    });
  }
  return {
    technicians,
    available: technicians.filter((item) => item.workload === "available").length,
    busy: technicians.filter((item) => item.workload === "busy").length
  };
}

module.exports = {
  technicianBoard
};
