const express = require("express");
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} = require("../controllers/EmployeesController");

const router = express.Router();

router.post("/", createEmployee);          
router.get("/", getEmployees);             
router.get("/stats", getEmployeeStats);    
router.get("/:id", getEmployeeById);       
router.put("/:id", updateEmployee);        
router.delete("/:id", deleteEmployee);     

module.exports = router;
