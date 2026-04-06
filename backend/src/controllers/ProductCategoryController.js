const productCategoryService = require("../services/ProductCategoryService");

class ProductCategoryController {
  async list(req, res, next) {
    try {
      const includeInactive =
        req.query.includeInactive === "true" || req.query.includeInactive === "1";
      const data = await productCategoryService.listCategories({ includeInactive });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { label, slug } = req.body;
      if (!label || !String(label).trim()) {
        return res.status(400).json({
          success: false,
          message: "Label is required",
        });
      }
      const data = await productCategoryService.createCategory({ label, slug });
      res.status(201).json({ success: true, data });
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message,
        });
      }
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const data = await productCategoryService.updateCategory(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      const permanent =
        req.query.permanent === "true" || req.query.permanent === "1";
      if (permanent) {
        const data = await productCategoryService.hardDeleteCategory(
          req.params.id
        );
        return res.json({ success: true, data });
      }
      const data = await productCategoryService.softDeleteCategory(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({ success: false, message: err.message });
      }
      if (err.statusCode === 409) {
        return res.status(409).json({ success: false, message: err.message });
      }
      next(err);
    }
  }
}

module.exports = new ProductCategoryController();
