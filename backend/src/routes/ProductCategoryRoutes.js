const express = require("express");
const router = express.Router();
const { AuthMiddleware } = require("../middleware/AuthMiddleware");
const productCategoryController = require("../controllers/ProductCategoryController");

router.get("/", productCategoryController.list);

router.post("/", AuthMiddleware, productCategoryController.create);

router.patch("/:id", AuthMiddleware, productCategoryController.update);

router.delete("/:id", AuthMiddleware, productCategoryController.remove);

module.exports = router;
