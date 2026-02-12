const Employee = require("../models/Employees/EmployeesSchema");

/* ================= CREATE ================= */
const createEmployee = async (data) => {
  return await Employee.create(data);
};

/* ================= GET ALL ================= */
const getEmployees = async (search = "") => {
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  return await Employee.find(query).sort({ createdAt: -1 });
};

/* ================= GET BY ID ================= */
const getEmployeeById = async (id) => {
  return await Employee.findById(id);
};

/* ================= UPDATE ================= */
const updateEmployee = async (id, data) => {
  return await Employee.findByIdAndUpdate(id, data, { new: true });
};

/* ================= DELETE ================= */
const deleteEmployee = async (id) => {
  return await Employee.findByIdAndDelete(id);
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
