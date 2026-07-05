function seedStatus() {
  return {
    ok: true,
    data: {
      seedMode: "demo_only",
      productionSeedingEnabled: false,
      seedFile: "database/sql/004_seed_demo_data.sql",
      requiredApproval: true
    }
  };
}

module.exports = {
  seedStatus
};
