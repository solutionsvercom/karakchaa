const express = require("express");
const router = express.Router();

const saleController = require("../controllers/SaleController");

// Create sale (POS)
router.post("/", saleController.createSale);

// Get all sales (paginated)
router.get("/", saleController.getSales);

// Summary stats
router.get("/summary", saleController.getSalesSummary);

// Update sale status
router.put("/:id", saleController.updateSale);

module.exports = router;