const router = require("express").Router();
const supplierController = require("../controllers/SupplierController");

// list + create
router.get("/", supplierController.listSuppliers);
router.post("/", supplierController.createSupplier);

// single
router.get("/:id", supplierController.getSupplier);
router.put("/:id", supplierController.updateSupplier);
router.delete("/:id", supplierController.deleteSupplier);

module.exports = router;
