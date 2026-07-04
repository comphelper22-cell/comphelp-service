function jobContext(input = {}) {
  const job = input.currentJob || input.currentProject || input.project || null;
  const previousJobs = Array.isArray(input.previousJobs) ? input.previousJobs : [];
  return {
    key: "job",
    label: "Job",
    score: job ? 92 : 72,
    missing: job ? [] : ["currentJob"],
    data: { currentJob: job || { status: "not_selected" }, previousJobs }
  };
}

module.exports = { jobContext };
