const ProductCategory = require("../models/ProductCategory/ProductCategorySchema");
const Product = require("../models/Product/ProductSchema");

const DEFAULT_CATEGORIES = [
  { slug: "beverages", label: "Beverages", sortOrder: 10 },
  { slug: "snacks", label: "Snacks", sortOrder: 20 },
  { slug: "meals", label: "Meals", sortOrder: 30 },
  { slug: "desserts", label: "Desserts", sortOrder: 40 },
  { slug: "drinks", label: "Drinks", sortOrder: 50 },
  { slug: "starters", label: "Starters", sortOrder: 60 },
  { slug: "breads", label: "Breads", sortOrder: 70 },
  { slug: "pizza", label: "Pizza", sortOrder: 80 },
  { slug: "sandwich", label: "Sandwich", sortOrder: 90 },
  { slug: "other", label: "Other", sortOrder: 1000 },
];

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureDefaultCategories() {
  const count = await ProductCategory.countDocuments();
  if (count > 0) return;
  await ProductCategory.insertMany(
    DEFAULT_CATEGORIES.map((c) => ({ ...c, isActive: true }))
  );
}

async function listCategories({ includeInactive = false } = {}) {
  await ensureDefaultCategories();
  const q = includeInactive ? {} : { isActive: true };
  return ProductCategory.find(q).sort({ sortOrder: 1, label: 1 }).lean();
}

async function createCategory({ label, slug }) {
  await ensureDefaultCategories();
  const finalSlug = slugify(slug || label);
  if (!finalSlug) {
    const err = new Error("Invalid category name or slug");
    err.statusCode = 400;
    throw err;
  }
  const exists = await ProductCategory.findOne({ slug: finalSlug });
  if (exists) {
    const err = new Error("A category with this slug already exists");
    err.statusCode = 409;
    throw err;
  }
  const maxOrder = await ProductCategory.findOne()
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean();
  const sortOrder = (maxOrder?.sortOrder ?? 0) + 10;
  const doc = await ProductCategory.create({
    slug: finalSlug,
    label: String(label).trim(),
    sortOrder,
    isActive: true,
  });
  return doc.toObject();
}

async function updateCategory(id, { label, sortOrder, isActive }) {
  const payload = {};
  if (label !== undefined) payload.label = String(label).trim();
  if (sortOrder !== undefined) payload.sortOrder = Number(sortOrder);
  if (isActive !== undefined) payload.isActive = Boolean(isActive);
  const doc = await ProductCategory.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
  if (!doc) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }
  return doc;
}

async function softDeleteCategory(id) {
  return updateCategory(id, { isActive: false });
}

async function hardDeleteCategory(id) {
  await ensureDefaultCategories();
  const cat = await ProductCategory.findById(id).lean();
  if (!cat) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }
  const slug = cat.slug;
  const usedCount = await Product.countDocuments({ category: slug });
  if (usedCount > 0) {
    const err = new Error(
      `${usedCount} product(s) still use this category. Change their category before deleting permanently.`
    );
    err.statusCode = 409;
    throw err;
  }
  await ProductCategory.findByIdAndDelete(id);
  return { _id: id, slug };
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  softDeleteCategory,
  hardDeleteCategory,
  slugify,
  ensureDefaultCategories,
};
