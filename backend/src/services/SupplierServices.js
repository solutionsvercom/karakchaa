const mongoose = require("mongoose");
const Supplier = require("../models/Supplier/SupplierSchema");

function buildSupplierFilters({ search, active }) {
  const filter = {};

  if (search && String(search).trim()) {
    filter.$text = { $search: String(search).trim() };
  }

  // active can be: "true" / "false" / undefined
  if (active === "true") filter.active = true;
  if (active === "false") filter.active = false;

  return filter;
}

async function createSupplier(payload) {
  return Supplier.create(payload);
}

async function getSupplierById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Supplier.findById(id);
}

async function updateSupplierById(id, payload) {
  if (!mongoose.isValidObjectId(id)) return null;

  return Supplier.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
}

async function deleteSupplierById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Supplier.findByIdAndDelete(id);
}

async function listSuppliers(query = {}) {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "20", 10), 1), 100);
  const skip = (page - 1) * limit;

  // default sort: latest first
  const sort = query.sort || "-createdAt";

  const filter = buildSupplierFilters(query);

  const [items, total] = await Promise.all([
    Supplier.find(filter).sort(sort).skip(skip).limit(limit),
    Supplier.countDocuments(filter),
  ]);

  return {
    items,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}

module.exports = {
  createSupplier,
  getSupplierById,
  updateSupplierById,
  deleteSupplierById,
  listSuppliers,
};
