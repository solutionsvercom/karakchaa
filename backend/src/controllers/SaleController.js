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
            ).populate("product", "name sku").populate("customer", "fullName");

            if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });

            res.json({ success: true, data: sale });
        } catch (err) {
            next(err);
        }
    }

    async getSales(req, res, next) {
        try {
            // ✅ Controlled filter payload
            const payload = {
                from: req.query.from,
                to: req.query.to,
                product: req.query.product,
            };

            const sales = await saleService.getAllSales(payload);

            res.json({
                success: true,
                count: sales.length,
                data: sales,
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new SaleController();