const { readFinanceData } = require("./financial-kpis");

function expenses(input = {}) {
  const data = readFinanceData(input);
  const totalExpenses = data.expenses.reduce((sum, expense) => sum + Number(expense.amount || expense.total || expense.cost || 0), 0);
  return {
    ok: true,
    data: {
      demoMode: data.demoMode,
      totalExpenses,
      expenseTrend: data.expenses.length > 2 ? "tracked" : "needs_more_data",
      byCategory: byCategory(data.expenses),
      expenses: data.expenses,
      generatedAt: new Date().toISOString()
    }
  };
}

function byCategory(expensesList) {
  return expensesList.reduce((acc, expense) => {
    const category = expense.category || "uncategorized";
    acc[category] = (acc[category] || 0) + Number(expense.amount || expense.total || expense.cost || 0);
    return acc;
  }, {});
}

module.exports = { expenses };
