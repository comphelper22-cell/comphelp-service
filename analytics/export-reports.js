const { reports } = require("./performance-reports");

function exportReports(input = {}) {
  const report = reports(input).data;
  return {
    ok: true,
    data: {
      format: input.format || "json",
      exportReady: true,
      filename: input.filename || "comphelp-analytics-report.json",
      report,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { exportReports };
