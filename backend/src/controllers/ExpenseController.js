const expenseService = require("../services/ExpenseServices");

// Small helper to avoid repeating try/catch everywhere
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.body);
  res.status(201).json({
    success: true,
    message: "Expense created",
    data: expense,
  });
});

exports.getExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.id);
  if (!expense) {
    return res.status(404).json({ success: false, message: "Expense not found" });
  }
  res.status(200).json({ success: true, data: expense });
});

exports.updateExpense = asyncHandler(async (req, res) => {
  const updated = await expenseService.updateExpenseById(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Expense not found" });
  }
  res.status(200).json({
    success: true,
    message: "Expense updated",
    data: updated,
  });
});

exports.deleteExpense = asyncHandler(async (req, res) => {
  const deleted = await expenseService.deleteExpenseById(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: "Expense not found" });
  }
  res.status(200).json({ success: true, message: "Expense deleted" });
});

exports.listExpenses = asyncHandler(async (req, res) => {
  const result = await expenseService.listExpenses(req.query);
  res.status(200).json({ success: true, ...result });
});

exports.getTotals = asyncHandler(async (req, res) => {
  const totals = await expenseService.getExpenseTotals(req.query);
  res.status(200).json({ success: true, data: totals });
});
