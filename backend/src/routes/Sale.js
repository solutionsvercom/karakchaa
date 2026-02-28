const express = require("express");
const router = express.Router();

const saleController = require("../controllers/SaleController");

// Create sale (POS)
router.post("/", saleController.createSale);

// Get all sales
router.get("/", saleController.getSales);

// Update sale status
router.put("/:id", saleController.updateSale);

module.exports = router;