const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../services/EmployeesService");

/* ================= CREATE ================= */
exports.createEmployee = async (req, res) => {
  try {
    const employee = await createEmployee(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= GET ALL ================= */
exports.getEmployees = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const employees = await getEmployees(search);
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ONE ================= */
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await getEmployeeById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE ================= */
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await updateEmployee(req.params.id, req.body);
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= DELETE ================= */
exports.deleteEmployee = async (req, res) => {
  try {
    await deleteEmployee(req.params.id);
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
