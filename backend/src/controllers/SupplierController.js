const supplierService = require("../services/SupplierServices");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.createSupplier = asyncHandler(async (req, res) => {
  const created = await supplierService.createSupplier(req.body);
  res.status(201).json({
    success: true,
    message: "Supplier created",
    data: created,
  });
});

exports.getSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.getSupplierById(req.params.id);
  if (!supplier) {
    return res.status(404).json({ success: false, message: "Supplier not found" });
  }
  res.status(200).json({ success: true, data: supplier });
});

exports.updateSupplier = asyncHandler(async (req, res) => {
  const updated = await supplierService.updateSupplierById(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Supplier not found" });
  }
  res.status(200).json({
    success: true,
    message: "Supplier updated",
    data: updated,
  });
});

exports.deleteSupplier = asyncHandler(async (req, res) => {
  const deleted = await supplierService.deleteSupplierById(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: "Supplier not found" });
  }
  res.status(200).json({ success: true, message: "Supplier deleted" });
});

exports.listSuppliers = asyncHandler(async (req, res) => {
  const result = await supplierService.listSuppliers(req.query);
  res.status(200).json({ success: true, ...result });
});
