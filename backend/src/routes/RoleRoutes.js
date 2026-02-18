const router = require("express").Router();
const RoleController = require("../controllers/RoleController");
const { AuthMiddleware, RoleMiddleware } = require("../middleware/AuthMiddleware");

// CRUD - simple and clean, no extra routes
router.get("/", AuthMiddleware, RoleMiddleware("admin"), RoleController.getRoles);
router.post("/", AuthMiddleware, RoleMiddleware("admin"), RoleController.createRole);
router.put("/:id", AuthMiddleware, RoleMiddleware("admin"), RoleController.updateRole);
router.delete("/:id", AuthMiddleware, RoleMiddleware("admin"), RoleController.deleteRole);

module.exports = router;