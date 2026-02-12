const Product = require("../models/Product");

/**
 * Create new product
 */
async function createProduct(data) {
  const existing = await Product.findOne({ sku: data.sku });
  if (existing) {
    const err = new Error("Product with this SKU already exists");
    err.statusCode = 409; // Conflict
    throw err;
  }

  const product = await Product.create(data);
  return product;
}

/**
 * Get all products
 */
async function getAllProducts() {
  return await Product.find().sort({ createdAt: -1 });
}

/**
 * Get single product by ID
 */
async function getProductById(id) {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }
  return product;
}

/**
 * Update product
 */
async function updateProduct(id, data) {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  Object.assign(product, data);
  return await product.save();
}

/**
 * Enable / Disable product (soft delete)
 */
async function toggleProductStatus(id, isActive) {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  product.isActive = isActive;
  return await product.save();
}

/**
 * Get low stock products
 */
async function getLowStockProducts() {
  return await Product.find({
    isActive: true,
    $expr: { $lte: ["$stockQty", "$minStock"] },
  }).sort({ stockQty: 1 });
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  toggleProductStatus,
  getLowStockProducts,
};
