const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MARKETPLACE_FILE = path.join(ROOT, "data", "marketplace.json");

function readFinanceData(input = {}) {
  if (input.data) return normalize(input.data, false);
  try {
    const raw = JSON.parse(fs.readFileSync(MARKETPLACE_FILE, "utf8").replace(/^\uFEFF/, ""));
    return normalize(raw, false);
  } catch (_) {
    return normalize({}, true);
  }
}

function normalize(data = {}, forcedDemo = false) {
  const projects = arr(data.projects);
  const jobs = arr(data.jobs);
  const estimates = arr(data.estimates);
  const invoices = arr(data.invoices);
  const expenses = arr(data.expenses);
  const customers = arr(data.customers);
  const hasFinanceData = projects.length || estimates.length || invoices.length || expenses.length;
  const demoMode = forcedDemo || !hasFinanceData;
  return {
    projects: demoMode ? demoProjects() : projects.concat(jobs),
    estimates: demoMode ? demoEstimates() : estimates,
    invoices: demoMode ? demoInvoices() : invoices,
    expenses: demoMode ? demoExpenses() : expenses,
    customers: demoMode ? demoCustomers() : customers,
    demoMode
  };
}

function calculateKpis(input = {}) {
  const data = readFinanceData(input);
  const revenue = revenueItems(data);
  const invoiceSummary = invoiceKpis(data.invoices);
  const expenseSummary = expenseKpis(data.expenses);
  const revenueThisMonth = sum(revenue.month);
  const totalExpenses = expenseSummary.totalExpenses;
  const profitEstimate = revenueThisMonth - totalExpenses;
  return {
    ok: true,
    data: {
      demoMode: data.demoMode,
      revenueToday: sum(revenue.today),
      revenueThisWeek: sum(revenue.week),
      revenueThisMonth,
      outstandingInvoices: invoiceSummary.outstandingInvoices,
      overdueInvoices: invoiceSummary.overdueInvoices,
      paidInvoices: invoiceSummary.paidInvoices,
      paidInvoiceValue: invoiceSummary.paidInvoiceValue,
      cashFlow: revenueThisMonth - invoiceSummary.outstandingValue - totalExpenses,
      profitEstimate,
      expenses: totalExpenses,
      monthlyForecast: forecastValue(revenueThisMonth, invoiceSummary.outstandingValue),
      financialHealthScore: healthScore(revenueThisMonth, invoiceSummary, totalExpenses),
      revenueTrend: trend(revenue.week, revenue.month),
      expenseTrend: expenseSummary.expenseTrend,
      topCustomersByRevenue: topCustomers(data, revenue.all),
      generatedAt: new Date().toISOString()
    }
  };
}

function revenueItems(data) {
  const paidInvoices = data.invoices.filter((invoice) => isBillableInvoice(invoice) && isPaid(invoice.paymentStatus || invoice.status)).map((invoice) => amountItem(invoice, invoice.paidAt || invoice.updatedAt || invoice.date));
  const all = paidInvoices;
  return {
    all,
    today: all.filter((item) => withinDays(item.date, 1)),
    week: all.filter((item) => withinDays(item.date, 7)),
    month: all.filter((item) => withinMonth(item.date))
  };
}

function invoiceKpis(invoices) {
  const billable = invoices.filter(isBillableInvoice);
  const paid = billable.filter((invoice) => isPaid(invoice.paymentStatus || invoice.status));
  const overdue = billable.filter((invoice) => /overdue|late/i.test(String(invoice.paymentStatus || invoice.status || "")) || isPastDue(invoice.dueDate));
  const outstanding = billable.filter((invoice) => !isPaid(invoice.paymentStatus || invoice.status));
  return {
    outstandingInvoices: outstanding.length,
    outstandingValue: sum(outstanding.map((invoice) => money(invoice.amount || invoice.total || invoice.balance))),
    overdueInvoices: overdue.length,
    overdueValue: sum(overdue.map((invoice) => money(invoice.amount || invoice.total || invoice.balance))),
    paidInvoices: paid.length,
    paidInvoiceValue: sum(paid.map((invoice) => money(invoice.amount || invoice.total)))
  };
}

function expenseKpis(expenses) {
  const values = expenses.map((expense) => money(expense.amount || expense.total || expense.cost));
  return {
    totalExpenses: sum(values),
    expenseTrend: values.length > 2 ? "tracked" : "needs_more_data"
  };
}

function topCustomers(data, revenue) {
  const totals = {};
  revenue.forEach((item) => {
    const name = item.customerName || item.name || "Customer";
    totals[name] = (totals[name] || 0) + money(item.amount);
  });
  if (!Object.keys(totals).length && data.customers.length) {
    data.customers.slice(0, 3).forEach((customer) => { totals[customer.name || "Customer"] = 0; });
  }
  return Object.keys(totals)
    .map((name) => ({ customerName: name, revenue: totals[name] }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

function amountItem(item, date) {
  return {
    amount: money(item.amount || item.total || item.value || item.projectValue || item.recommendedPrice || item.recommended),
    customerName: item.customerName || item.name,
    date: date || new Date().toISOString()
  };
}

function forecastValue(revenueThisMonth, outstandingValue) {
  return Math.round(revenueThisMonth + outstandingValue * 0.35);
}

function healthScore(revenueThisMonth, invoices, expenses) {
  let score = 72;
  if (revenueThisMonth > 0) score += 10;
  if (invoices.overdueInvoices > 0) score -= Math.min(20, invoices.overdueInvoices * 8);
  if (expenses > revenueThisMonth && revenueThisMonth > 0) score -= 12;
  if (invoices.outstandingValue > revenueThisMonth && revenueThisMonth > 0) score -= 8;
  return Math.max(0, Math.min(100, score));
}

function trend(week, month) {
  const weekValue = sum(week);
  const monthValue = sum(month);
  if (!monthValue) return "needs_more_data";
  return weekValue * 4 >= monthValue ? "up" : "flat";
}

function withinDays(value, days) {
  if (!value) return false;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return false;
  return Date.now() - date.getTime() <= days * 86400000;
}

function withinMonth(value) {
  if (!value) return false;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function isPastDue(value) {
  if (!value) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() < Date.now();
}

function isPaid(status) {
  return /paid|complete|completed/i.test(String(status || ""));
}

function isBillableInvoice(invoice = {}) {
  if (invoice.placeholder || invoice.paymentStatus === "not_applicable" || invoice.status === "placeholder") return false;
  return money(invoice.amount || invoice.total) > 0;
}

function money(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function sum(values) {
  return values.reduce((total, value) => total + money(value.amount !== undefined ? value.amount : value), 0);
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function demoProjects() {
  return [{ customerName: "Demo Camera Customer", service: "Security Camera Installation", status: "completed", value: 899, completionDate: new Date().toISOString() }];
}

function demoEstimates() {
  return [{ customerName: "Demo WiFi Estimate", service: "WiFi & Network Installation", status: "approved", recommendedPrice: 650, createdAt: new Date().toISOString() }];
}

function demoInvoices() {
  return [
    { customerName: "Demo Paid Invoice", status: "paid", amount: 899, paidAt: new Date().toISOString() },
    { customerName: "Demo Outstanding Invoice", status: "open", amount: 450, dueDate: new Date(Date.now() + 86400000 * 7).toISOString() }
  ];
}

function demoExpenses() {
  return [
    { category: "materials", amount: 180, date: new Date().toISOString() },
    { category: "fuel", amount: 45, date: new Date().toISOString() }
  ];
}

function demoCustomers() {
  return [{ name: "Demo Camera Customer" }, { name: "Demo WiFi Estimate" }];
}

module.exports = {
  calculateKpis,
  invoiceKpis,
  readFinanceData,
  revenueItems
};
