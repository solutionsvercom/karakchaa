const Product = require("../models/Product");
const Stockmanagement = require("../models/Stockmanagement/StockmanagementSchema");

/* =============================================================
   HELPER: compute stock status
============================================================= */
function computeStatus(currentStock, minStockLevel) {
  if (currentStock === 0) return "Out of Stock";
  if (currentStock <= minStockLevel) return "Low Stock";
  return "In Stock";
}

/* =============================================================
   CREATE PRODUCT
   → Auto-creates matching Stockmanagement record
============================================================= */
async function createProduct(data) {
  const existing = await Product.findOne({ sku: data.sku });
  if (existing) {
    const err = new Error("Product with this SKU already exists");
    err.statusCode = 409;
    throw err;
  }

  const product = await Product.create(data);

  // Auto-create stock record when product is created
  const currentStock = product.stockQty ?? 0;
  const minStockLevel = product.minStock ?? 0;

  await Stockmanagement.create({
    productName: product.name,
    sku: product.sku,
    category: product.category,
    unit: product.unit,
    currentStock,
    minStockLevel,
    status: computeStatus(currentStock, minStockLevel),
    stockHistory: [],
  });

  return product;
}

/* =============================================================
   GET ALL PRODUCTS
============================================================= */
async function getAllProducts() {
  return await Product.find().sort({ createdAt: -1 });
}

/* =============================================================
   GET SINGLE PRODUCT BY ID
============================================================= */
async function getProductById(id) {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }
  return product;
}

/* =============================================================
   UPDATE PRODUCT
   → Syncs name, category, unit, minStock to Stockmanagement
   → Does NOT overwrite currentStock
============================================================= */
async function updateProduct(id, data) {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error("Product not found");
    err.statusCode = 404;
    throw err;
  }

  Object.assign(product, data);
  const updated = await product.save();

  // Sync only metadata — never touch currentStock
  await Stockmanagement.findOneAndUpdate(
    { sku: updated.sku },
    {
      $set: {
        productName: updated.name,
        category: updated.category,
        unit: updated.unit,
        minStockLevel: updated.minStock ?? 0,
      },
    }
  );

  return updated;
}

/* =============================================================
   TOGGLE PRODUCT STATUS
============================================================= */
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

/* =============================================================
   DELETE PRODUCT
   → Also removes the matching Stockmanagement record
============================================================= */
const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new Error("Product not found");
  }

  await Stockmanagement.findOneAndDelete({ sku: product.sku });

  return product;
};

/* =============================================================
   GET LOW STOCK PRODUCTS
============================================================= */
async function getLowStockProducts() {
  return await Product.find({
    isActive: true,
    $expr: { $lte: ["$stockQty", "$minStock"] },
  }).sort({ stockQty: 1 });
}

/* =============================================================
   ONE-TIME BULK SYNC — safe to run multiple times

   RULES:
   - Product NOT in Stock Management → CREATE with Product.stockQty
   - Product ALREADY in Stock Management → only update name/category/unit/minLevel
   - NEVER overwrites currentStock on existing records
============================================================= */
async function syncAllProductsToStock() {
  const products = await Product.find();
  let created = 0;
  let skipped = 0;

  for (const product of products) {
    const existing = await Stockmanagement.findOne({ sku: product.sku });

    if (!existing) {
      const currentStock = product.stockQty ?? 0;
      const minStockLevel = product.minStock ?? 0;

      await Stockmanagement.create({
        productName: product.name,
        sku: product.sku,
        category: product.category,
        unit: product.unit,
        currentStock,
        minStockLevel,
        status: computeStatus(currentStock, minStockLevel),
        stockHistory: [],
      });

      created++;
    } else {
      // Already exists — only update metadata, NEVER touch currentStock
      await Stockmanagement.findOneAndUpdate(
        { sku: product.sku },
        {
          $set: {
            productName: product.name,
            category: product.category,
            unit: product.unit,
            minStockLevel: product.minStock ?? 0,
          },
        }
      );

      skipped++;
    }
  }

  return {
    total: products.length,
    created,
    skipped,
    message: `Sync complete. ${created} new products added. ${skipped} existing records kept their stock quantities unchanged.`,
  };
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  toggleProductStatus,
  getLowStockProducts,
  deleteProduct,
  syncAllProductsToStock,
};