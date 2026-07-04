function technicianContext(input = {}) {
  const technician = input.currentTechnician || input.technician || null;
  return {
    key: "technician",
    label: "Technician",
    score: technician ? 94 : 76,
    missing: technician ? [] : ["currentTechnician"],
    data: technician || { status: "not_assigned" }
  };
}

module.exports = { technicianContext };
