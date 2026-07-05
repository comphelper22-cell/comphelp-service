function storageReadiness() {
  return {
    ok: true,
    data: {
      storageConnected: false,
      strategy: "Supabase Storage placeholder only",
      buckets: ["project-files", "gallery-media", "documents"],
      privateByDefault: true
    }
  };
}

module.exports = {
  storageReadiness
};
