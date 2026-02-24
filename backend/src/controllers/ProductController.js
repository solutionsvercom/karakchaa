const productService = require("../services/ProductService");
const cloudinary = require("../../config/cloudinary");

class ProductController {

    async createProduct(req, res, next) {
        try {

            let imageData = null;

            if (req.file) {
                const result = await cloudinary.uploader.upload(
                    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`, {
                        folder: "restaurant/products",
                    }
                );
                imageData = {
                    url: result.secure_url,
                    public_id: result.public_id,
                };
            }

            const payload = {
                name: req.body.name,
                sku: req.body.sku,
                category: req.body.category,
                unit: req.body.unit,
                sellingPrice: req.body.sellingPrice,
                costPrice: req.body.costPrice,
                stockQty: req.body.stockQty,
                minStock: req.body.minStock,
                description: req.body.description,
                isActive: req.body.isActive !== undefined ? req.body.isActive === "true" || req.body.isActive === true : true,
                isVeg: req.body.isVeg !== undefined ? req.body.isVeg === "true" || req.body.isVeg === true : true,
                image: imageData,
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

            const existingProduct = await productService.getProductById(req.params.id);

            let imageData = existingProduct.image; // default: keep existing

            if (req.file) {
                // ✅ New image uploaded — delete old one from Cloudinary, upload new
                if (existingProduct.image && existingProduct.image.public_id) {
                    await cloudinary.uploader.destroy(existingProduct.image.public_id);
                }

                const result = await cloudinary.uploader.upload(
                    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`, {
                        folder: "restaurant/products",
                    }
                );

                imageData = {
                    url: result.secure_url,
                    public_id: result.public_id,
                };

            } else if (req.body.removeImage === "true") {
                // ✅ User clicked Remove — delete from Cloudinary and set null
                if (existingProduct.image && existingProduct.image.public_id) {
                    await cloudinary.uploader.destroy(existingProduct.image.public_id);
                }
                imageData = null;
            }
            // else: no file, no removeImage signal — image unchanged

            const payload = {
                ...req.body,
                isActive: req.body.isActive !== undefined ? req.body.isActive === "true" || req.body.isActive === true : existingProduct.isActive,
                isVeg: req.body.isVeg !== undefined ? req.body.isVeg === "true" || req.body.isVeg === true : existingProduct.isVeg,
                image: imageData,
            };

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

            const existingProduct = await productService.getProductById(req.params.id);

            // Delete image from Cloudinary before deleting product
            if (existingProduct.image && existingProduct.image.public_id) {
                await cloudinary.uploader.destroy(existingProduct.image.public_id);
            }

            await productService.deleteProduct(req.params.id);

            res.json({
                success: true,
                message: "Product deleted successfully",
            });

        } catch (err) {
            next(err);
        }
    }

    // Sync Products → Stock Management
    async syncStock(req, res, next) {
        try {
            const result = await productService.syncAllProductsToStock();
            res.json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    }

    // ✅ Sync Stock Management → Products (fixes minStock + stockQty drift)
    async syncStockToProducts(req, res, next) {
        try {
            const result = await productService.syncStockToProducts();
            res.json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new ProductController();