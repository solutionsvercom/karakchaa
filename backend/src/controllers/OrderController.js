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
            const {
                page,
                limit,
                status,
                orderSource,
                orderType,
                sortBy,
                sortOrder,
            } = req.query;

            const result = await orderService.getOrders({
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                status,
                orderSource,
                orderType,
                sortBy,
                sortOrder,
            });

            res.json({
                success: true,
                ...result, 
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
                req.body.paymentMethod
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
