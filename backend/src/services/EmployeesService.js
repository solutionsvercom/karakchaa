const Employee = require("../models/Employees/EmployeesSchema");

const createEmployee = async (data) => {
  return await Employee.create(data);
};

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

const getEmployeeStats = async () => {
  const employees = await Employee.find({});

  const totalEmployees = employees.length;
  const active = employees.filter((e) => e.active !== false).length;
  const inactive = totalEmployees - active;
  const totalSalary = employees
    .filter((e) => e.active !== false)
    .reduce((sum, e) => sum + (e.salary || 0), 0);

  return {
    totalEmployees,
    active,
    inactive,
    totalSalary,
  };
};

const getEmployeeById = async (id) => {
  return await Employee.findById(id);
};

const updateEmployee = async (id, data) => {
  return await Employee.findByIdAndUpdate(id, data, { new: true });
};

const deleteEmployee = async (id) => {
  return await Employee.findByIdAndDelete(id);
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
};
