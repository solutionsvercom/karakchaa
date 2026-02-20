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