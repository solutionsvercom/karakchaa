const productService = require("../services/ProductService");
const cloudinary = require("../../config/cloudinary");
const streamifier = require("streamifier");

function uploadToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: "restaurant/products" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

function getPublicIdFromUrl(url) {
    if (!url) return null;
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\.[^.]+)?$/);
    return matches ? matches[1] : null;
}

class ProductController {

    async createProduct(req, res, next) {
        try {
            let imageData = null;

            if (req.file) {
                const result = await uploadToCloudinary(req.file.buffer);
                imageData = {
                    url: result.secure_url, 
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

            res.status(201).json({ success: true, data: product });
        } catch (err) {
            next(err);
        }
    }
    
    async getProducts(req, res, next) {
        try {
            const products = await productService.getAllProducts();
            res.json({ success: true, data: products });
        } catch (err) {
            next(err);
        }
    }

    async getProduct(req, res, next) {
        try {
            const product = await productService.getProductById(req.params.id);
            res.json({ success: true, data: product });
        } catch (err) {
            next(err);
        }
    }

    async updateProduct(req, res, next) {
        try {
            const existingProduct = await productService.getProductById(req.params.id);

            let imageData = existingProduct.image; 

            if (req.file) {
                const existingImageUrl = existingProduct.image ? existingProduct.image.url : null;
                const oldPublicId = getPublicIdFromUrl(existingImageUrl);
                if (oldPublicId) {
                    await cloudinary.uploader.destroy(oldPublicId);
                }

                const result = await uploadToCloudinary(req.file.buffer);
                imageData = {
                    url: result.secure_url, 
                };

            } else if (req.body.removeImage === "true") {
                const existingImageUrl = existingProduct.image ? existingProduct.image.url : null;
                const oldPublicId = getPublicIdFromUrl(existingImageUrl);
                if (oldPublicId) {
                    await cloudinary.uploader.destroy(oldPublicId);
                }
                imageData = null;
            }

            const payload = {
                ...req.body,
                isActive: req.body.isActive !== undefined ? req.body.isActive === "true" || req.body.isActive === true : existingProduct.isActive,
                isVeg: req.body.isVeg !== undefined ? req.body.isVeg === "true" || req.body.isVeg === true : existingProduct.isVeg,
                image: imageData,
            };

            const product = await productService.updateProduct(req.params.id, payload);

            res.json({ success: true, data: product });
        } catch (err) {
            next(err);
        }
    }

    async toggleProductStatus(req, res, next) {
        try {
            const product = await productService.toggleProductStatus(
                req.params.id,
                req.body.isActive
            );
            res.json({ success: true, data: product });
        } catch (err) {
            next(err);
        }
    }

    async getLowStockProducts(req, res, next) {
        try {
            const products = await productService.getLowStockProducts();
            res.json({ success: true, count: products.length, data: products });
        } catch (err) {
            next(err);
        }
    }

    async deleteProduct(req, res, next) {
        try {
            const existingProduct = await productService.getProductById(req.params.id);

            const existingImageUrl = existingProduct.image ? existingProduct.image.url : null;
            const publicId = getPublicIdFromUrl(existingImageUrl);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }

            await productService.deleteProduct(req.params.id);

            res.json({ success: true, message: "Product deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async syncStock(req, res, next) {
        try {
            const result = await productService.syncAllProductsToStock();
            res.json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    }

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