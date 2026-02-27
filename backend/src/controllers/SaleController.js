const saleService = require("../services/SaleService");

class SaleController {

   async createSale(req, res, next) {
    try {
        const payload = {
            product: req.body.product,
            quantity: req.body.quantity,
            paymentMethod: req.body.paymentMethod, // "Cash" | "Card" | "UPI"
            paymentStatus: req.body.paymentStatus || "Completed",
            customer: req.body.customer || null,
            soldBy: req.body.soldBy || null,
        };

        const sale = await saleService.createSale(payload);

        res.status(201).json({
            success: true,
            data: sale,
        });
    } catch (err) {
        next(err);
    }
}


    async updateSale(req, res, next) {
        try {
            const { id } = req.params;
            const { paymentStatus } = req.body;

            const allowed = ["Completed", "Pending", "Cancelled"];
            if (paymentStatus && !allowed.includes(paymentStatus)) {
                return res.status(400).json({ success: false, message: "Invalid paymentStatus" });
            }

            const Sale = require("../models/Sale");
            const sale = await Sale.findByIdAndUpdate(
                id,
                { $set: { paymentStatus } },
                { new: true }
            ).populate("product", "name sku").populate("customer", "fullName phoneNumber");

            if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });

            res.json({ success: true, data: sale });
        } catch (err) {
            next(err);
        }
    }

    async getSales(req, res, next) {
        try {
            const payload = {
                from: req.query.from,
                to: req.query.to,
                product: req.query.product,
                page: req.query.page,
                limit: req.query.limit,
            };

            const { items, pagination } = await saleService.getAllSales(payload);

            res.json({
                success: true,
                data: items,
                pagination,
            });
        } catch (err) {
            next(err);
        }
    }

    async getSalesSummary(req, res, next) {
        try {
            const summary = await saleService.getSalesSummary();
            res.json({
                success: true,
                data: summary,
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new SaleController();