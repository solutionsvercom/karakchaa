const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/OrderController");

router.post("/", OrderController.createOrder);
router.get("/next-token", OrderController.getNextToken);
router.get("/", OrderController.getOrders);
router.put("/:id/status", OrderController.updateStatus);

module.exports = router;
