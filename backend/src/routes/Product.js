const express = require("express");
const router = express.Router();

const productController = require("../controllers/ProductController");

// Create product
router.post("/", productController.createProduct);
// Low stock products
router.get("/low-stock", productController.getLowStockProducts);

// Get all products
router.get("/", productController.getProducts);

// Get product by id
router.get("/:id", productController.getProduct);

// Update product
router.put("/:id", productController.updateProduct);
// Delete product
router.delete("/:id", productController.deleteProduct);

// Enable / Disable product
router.patch("/:id/status", productController.toggleProductStatus);

module.exports = router;