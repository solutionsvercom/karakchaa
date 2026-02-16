const mongoose = require("mongoose");
const Expense = require("../models/Expenses/ExpenseSchema");

function buildExpenseFilters({ search, category, from, to }) {
  const filter = {};

  if (search && String(search).trim()) {
    // uses the text index
    filter.$text = { $search: String(search).trim() };
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  return filter;
}

async function createExpense(payload) {
  const expense = await Expense.create(payload);
  return expense;
}

async function getExpenseById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Expense.findById(id);
}

async function updateExpenseById(id, payload) {
  if (!mongoose.isValidObjectId(id)) return null;

  // runValidators makes schema validations apply on update
  return Expense.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
}

async function deleteExpenseById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Expense.findByIdAndDelete(id);
}

async function listExpenses(query = {}) {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "20", 10), 1), 100);
  const skip = (page - 1) * limit;
  const sort = query.sort || "-date";

  const filter = buildExpenseFilters(query);

  const [items, total] = await Promise.all([
    Expense.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Expense.countDocuments(filter),
  ]);

  return {
    items,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}

async function getExpenseTotals(query = {}) {
  const filter = buildExpenseFilters(query);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const pipeline = [
    { $match: filter },
    {
      $facet: {
        overall: [
          {
            $group: {
              _id: null,
              totalExpenses: { $sum: "$amount" },
              totalTransactions: { $sum: 1 },
              averageExpense: { $avg: "$amount" },
            },
          },
        ],
        thisMonth: [
          {
            $match: {
              date: { $gte: monthStart, $lt: monthEnd },
            },
          },
          {
            $group: {
              _id: null,
              thisMonthExpenses: { $sum: "$amount" },
            },
          },
        ],
      },
    },
    {
      $project: {
        totalExpenses: { $ifNull: [{ $first: "$overall.totalExpenses" }, 0] },
        totalTransactions: {
          $ifNull: [{ $first: "$overall.totalTransactions" }, 0],
        },
        averageExpense: {
          $ifNull: [{ $first: "$overall.averageExpense" }, 0],
        },
        thisMonthExpenses: {
          $ifNull: [{ $first: "$thisMonth.thisMonthExpenses" }, 0],
        },
      },
    },
  ];

  const [result] = await Expense.aggregate(pipeline);

  return {
    totalExpenses: Math.round(result?.totalExpenses || 0),
    thisMonthExpenses: Math.round(result?.thisMonthExpenses || 0),
    totalTransactions: result?.totalTransactions || 0,
    averageExpense: Math.round(result?.averageExpense || 0),
  };
}

module.exports = {
  createExpense,
  getExpenseById,
  updateExpenseById,
  deleteExpenseById,
  listExpenses,
  getExpenseTotals,
};
