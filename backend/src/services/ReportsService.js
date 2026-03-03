const Sale = require("../models/Sales/SaleSchema");
const Expense = require("../models/Expenses/ExpenseSchema");

const getDateRange = (period) => {
  let startDate = null;
  let endDate = new Date();

  switch (period) {
    case "Today":
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;

    case "Yesterday":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "Last 7 Days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;

    case "Last 14 Days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);
      break;

    case "Last 30 Days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      break;

    case "Last 3 Months":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      break;

    case "Last 6 Months":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      break;

    case "Last 1 Year":
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;

    default:
      startDate = null;
  }

  return { startDate, endDate };
};

const buildReports = async (period = "All Time") => {
  const { startDate, endDate } = getDateRange(period);

  const dateFilter = startDate
    ? { createdAt: { $gte: startDate, $lte: endDate } }
    : {};

  const sales = await Sale.find(dateFilter).lean();
  const expenses = await Expense.find(dateFilter).lean();

  const totalRevenue = sales.reduce(
    (sum, s) => sum + (s.totalAmount || 0),
    0
  );

  const totalOrders = sales.length;

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );

  const netProfit = totalRevenue - totalExpenses;

  return {
    period,
    totalRevenue,
    totalOrders,
    totalExpenses,
    netProfit,
  };
};

module.exports = { buildReports };
