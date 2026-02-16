const saleService = require("../services/SaleService");

class SaleController {

  async createSale(req, res, next) {
    try {
      // ✅ Create controlled payload
      const payload = {
        product: req.body.product,
        quantity: req.body.quantity,
        sellingPrice: req.body.sellingPrice,
        customer: req.body.customer,
        paymentMethod: req.body.paymentMethod,
        paymentStatus: req.body.paymentStatus,
        soldBy: req.body.soldBy,
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
