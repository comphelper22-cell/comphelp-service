const recommendationEngine = require("../brain/recommendation/recommendation-engine");
const { calculateKpis } = require("./financial-kpis");
const { invoices } = require("./invoice-engine");
const { expenses } = require("./expense-engine");
const { forecast } = require("./forecast-engine");
const { health } = require("./financial-health");

function dashboard(input = {}) {
  const kpis = calculateKpis(input).data;
  const invoiceData = invoices(input).data;
  const expenseData = expenses(input).data;
  const forecastData = forecast(input).data;
  const healthData = health(input).data;
  const recommendations = recommendationEngine.generate({ category: "Finance", record: false }).data.recommendations;
  return {
    ok: true,
    data: {
      ...kpis,
      invoices: invoiceData,
      expenseBreakdown: expenseData.byCategory,
      forecast: forecastData,
      health: healthData,
      aiFinancialRecommendations: recommendations,
      financialAlerts: healthData.alerts.concat(invoiceData.alerts || []),
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { dashboard };
