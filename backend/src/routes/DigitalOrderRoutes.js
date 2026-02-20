const express = require("express");

const router = express.Router();

const {
    createDigitalOrder,
    getDigitalOrderStatus,
    getAllDigitalOrders,
} = require("../controllers/DigitalOrderController");

/* Create order */
router.post("/orders", createDigitalOrder);

/* Get order status */
router.get("/orders/status/:orderId", getDigitalOrderStatus);

/* Optional admin route */
router.get("/orders", getAllDigitalOrders);

module.exports = router;