const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} = require("../services/EmployeesService");

/* ================= CREATE ================= */
exports.createEmployee = async (req, res) => {
  try {
    const employee = await createEmployee(req.body);
    res.status(201).json(employee);
  } catch (error) {

  // 🔥 Handle duplicate phone number
  if (error.code === 11000 && error.keyPattern?.phone) {
    return res.status(400).json({
      message: "Phone number already exists",
    });
  }

  // 🔥 Handle validation errors
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Please fill all required fields correctly",
    });
  }

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

/* ================= STATS ================= */
exports.getEmployeeStats = async (req, res) => {
  try {
    const stats = await getEmployeeStats();
    res.status(200).json({ data: stats });
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

  if (error.code === 11000 && error.keyPattern?.phone) {
    return res.status(400).json({
      message: "Phone number already exists",
    });
  }

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
