const orderService = require("../services/OrderService");

class OrderController {
    async createOrder(req, res, next) {
        try {
            const order = await orderService.createOrder(req.body);

            res.status(201).json({
                success: true,
                data: order,
            });
        } catch (err) {
            next(err);
        }
    }

    async getOrders(req, res, next) {
        try {
            const orders = await orderService.getOrders();

            res.json({
                success: true,
                data: orders,
            });
        } catch (err) {
            next(err);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const order = await orderService.updateOrderStatus(
                req.params.id,
                req.body.status,
                req.body.paymentMethod // ✅ NEW: pass payment method from request
            );

            res.json({
                success: true,
                data: order,
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new OrderController();
