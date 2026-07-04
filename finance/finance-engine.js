const { dashboard } = require("./finance-dashboard");
const { revenue } = require("./revenue-engine");
const { invoices } = require("./invoice-engine");
const { cashflow } = require("./cashflow-engine");
const { expenses } = require("./expense-engine");
const { profit } = require("./profit-engine");
const { forecast } = require("./forecast-engine");
const { health } = require("./financial-health");
const { calculateKpis } = require("./financial-kpis");

function status() {
  return {
    ok: true,
    status: "ready",
    engine: "Finance Center",
    modules: ["dashboard", "revenue", "invoices", "cashflow", "expenses", "profit", "forecast", "health", "kpis"],
    externalApisConnected: false,
    paymentGatewaysConnected: false,
    jsonCompatible: true,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  cashflow,
  dashboard,
  expenses,
  forecast,
  health,
  invoices,
  kpis: calculateKpis,
  profit,
  revenue,
  status
};
