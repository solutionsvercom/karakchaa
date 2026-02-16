const productService = require("../services/ProductService");

class ProductController {

    async createProduct(req, res, next) {
        try {
            const payload = {
                name: req.body.name,
                sku: req.body.sku,
                category: req.body.category,
                unit: req.body.unit,
                sellingPrice: req.body.sellingPrice,
                costPrice: req.body.costPrice,
                stockQty: req.body.stockQty,
                minStock: req.body.minStock,
                isActive: req.body.isActive,
                imageUrl: req.body.imageUrl,
            };

            const product = await productService.createProduct(payload);

            res.status(201).json({
                success: true,
                data: product,
            });
        } catch (err) {
            next(err);
        }
    }

    async getProducts(req, res, next) {
        try {
            const products = await productService.getAllProducts();
            res.json({
                success: true,
                data: products,
            });
        } catch (err) {
            next(err);
        }
    }

    async getProduct(req, res, next) {
        try {
            const product = await productService.getProductById(req.params.id);
            res.json({
                success: true,
                data: product,
            });
        } catch (err) {
            next(err);
        }
    }

    async updateProduct(req, res, next) {
        try {
            const payload = {...req.body };

            const product = await productService.updateProduct(
                req.params.id,
                payload
            );

            res.json({
                success: true,
                data: product,
            });
        } catch (err) {
            next(err);
        }
    }

    async toggleProductStatus(req, res, next) {
        try {
            const payload = {
                isActive: req.body.isActive,
            };

            const product = await productService.toggleProductStatus(
                req.params.id,
                payload.isActive
            );

            res.json({
                success: true,
                data: product,
            });
        } catch (err) {
            next(err);
        }
    }

    async getLowStockProducts(req, res, next) {
        try {
            const products = await productService.getLowStockProducts();
            res.json({
                success: true,
                count: products.length,
                data: products,
            });
        } catch (err) {
            next(err);
        }
    }
    async deleteProduct(req, res, next) {
        try {
            const product = await productService.deleteProduct(req.params.id);

            res.json({
                success: true,
                message: "Product deleted successfully",
                data: product,
            });
        } catch (err) {
            next(err);
        }
    }
}


module.exports = new ProductController();