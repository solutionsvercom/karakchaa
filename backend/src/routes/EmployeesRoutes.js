const express = require("express");
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/EmployeesController");

const router = express.Router();

router.post("/", createEmployee);          // POST /api/employees
router.get("/", getEmployees);              // GET  /api/employees
router.get("/:id", getEmployeeById);        // GET  /api/employees/:id
router.put("/:id", updateEmployee);         // PUT  /api/employees/:id
router.delete("/:id", deleteEmployee);      // DELETE /api/employees/:id

module.exports = router;
