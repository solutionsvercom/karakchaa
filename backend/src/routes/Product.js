const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const productController = require("../controllers/ProductController");

// Create product
router.post("/", upload.single("image"), productController.createProduct);

// Sync Products → Stock Management
router.post("/sync-stock", productController.syncStock);

// Sync Stock Management → Products (fixes minStock + stockQty drift)
router.post("/sync-from-stock", productController.syncStockToProducts);

// Fix product image URLs from Cloudinary (run once after deploy)
router.post("/repair-images", productController.repairImages);

// Low stock products
router.get("/low-stock", productController.getLowStockProducts);

// Get all products
router.get("/", productController.getProducts);

// Get product by id
router.get("/:id", productController.getProduct);

// Update product
router.put("/:id", upload.single("image"), productController.updateProduct);

// Delete product
router.delete("/:id", productController.deleteProduct);

// Enable / Disable product
router.patch("/:id/status", productController.toggleProductStatus);

module.exports = router;