const router = require("express").Router();
const expenseController = require("../controllers/ExpenseController");

// List + create
router.get("/", expenseController.listExpenses);
router.post("/", expenseController.createExpense);

// Totals for summary cards
router.get("/totals", expenseController.getTotals);

// Single item
router.get("/:id", expenseController.getExpense);
router.put("/:id", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);

module.exports = router;
