const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/OrderController");

/* Create order from digital menu */
router.post("/orders", OrderController.createOrder);

/* Get order status */
router.get("/orders/status/:orderRef", async(req, res) => {
    try {
        const Order = require("../models/Order/OrderSchema");
        const mongoose = require("mongoose");
        const { orderRef } = req.params;

        // Accept both tracking number (ORD-00001) and Mongo _id for backward compatibility.
        const orFilter = [{ orderNumber: orderRef }];
        if (mongoose.Types.ObjectId.isValid(orderRef)) {
            orFilter.push({ _id: orderRef });
        }
        const order = await Order.findOne({
            $or: orFilter
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status.toLowerCase(),
                items: order.items,
                totalAmount: order.totalAmount,
                customerName: order.customerName,
                phone: order.phone,
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/* Get all digital menu orders */
router.get("/orders", async(req, res) => {
    try {
        const Order = require("../models/Order/OrderSchema");
        const orders = await Order.find({ orderType: "online" })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
