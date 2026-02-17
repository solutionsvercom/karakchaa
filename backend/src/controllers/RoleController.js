const Role = require("../models/Users/RoleSchema");
const User = require("../models/Users/UserSchema");

// ✅ Maps ANY variation the frontend might send → correct stored value
const normalizeModule = (module) => {
    if (!module) return null;
    const map = {
        // Customer (your menu key is 'customers' but DB stores 'customer')
        "customers": "customer",
        "customer": "customer",
        "Customers": "customer",
        "Customer": "customer",
        // Dashboard
        "dashboard": "dashboard",
        "Dashboard": "dashboard",
        // POS
        "pos": "pos",
        "Pos": "pos",
        "POS": "pos",
        // Products
        "products": "products",
        "Products": "products",
        // Sales
        "sales": "sales",
        "Sales": "sales",
        // Stock Management
        "stockmanagement": "stockmanagement",
        "Stockmanagement": "stockmanagement",
        "stock management": "stockmanagement",
        "Stock Management": "stockmanagement",
        "stock-management": "stockmanagement",
        // Suppliers
        "suppliers": "suppliers",
        "Suppliers": "suppliers",
        // Employees
        "employees": "employees",
        "Employees": "employees",
        // Expenses
        "expenses": "expenses",
        "Expenses": "expenses",
        // Reports
        "reports": "reports",
        "Reports": "reports",
        // Feedback
        "feedback": "feedback",
        "Feedback": "feedback",
        // Users
        "users": "users",
        "Users": "users",
        // Roles
        "roles": "roles",
        "Roles": "roles",
    };
    return map[module] !== undefined ? map[module] : module.toLowerCase();
};

const VALID_MODULES = [
    "dashboard", "pos", "products", "customer",
    "stockmanagement", "sales", "suppliers",
    "employees", "expenses", "reports",
    "feedback", "users", "roles"
];

const cleanModules = (modules) => {
    if (!modules || !Array.isArray(modules)) return [];
    return [...new Set(
        modules
        .map(m => normalizeModule(m))
        .filter(m => m && VALID_MODULES.includes(m))
    )];
};

/* ================= CREATE ROLE ================= */
exports.createRole = async(req, res) => {
    try {
        const { name, modules } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "Role name is required" });
        }

        const existingRole = await Role.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });
        if (existingRole) {
            return res.status(409).json({ success: false, message: "Role with this name already exists" });
        }

        const role = new Role({
            name: name.trim(),
            modules: cleanModules(modules)
        });

        await role.save();

        res.status(201).json({ success: true, message: "Role created successfully", role });

    } catch (error) {
        console.error('Create role error:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Role with this name already exists" });
        }
        res.status(500).json({ success: false, message: "Error creating role" });
    }
};

/* ================= GET ALL ROLES ================= */
exports.getRoles = async(req, res) => {
    try {
        const roles = await Role.find().sort({ createdAt: -1 });

        // ✅ Normalize + deduplicate on every read (fixes stale DB data too)
        const cleanedRoles = roles.map(role => {
            const roleObj = role.toObject();
            roleObj.modules = cleanModules(roleObj.modules);
            return roleObj;
        });

        res.json({ success: true, count: cleanedRoles.length, roles: cleanedRoles });

    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ success: false, message: "Error fetching roles" });
    }
};

/* ================= UPDATE ROLE ================= */
exports.updateRole = async(req, res) => {
    try {
        const { name, modules } = req.body;
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid role ID' });
        }

        const existingRole = await Role.findById(id);
        if (!existingRole) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        // Check duplicate name
        if (name && name.trim().toLowerCase() !== existingRole.name.toLowerCase()) {
            const duplicate = await Role.findOne({
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
                _id: { $ne: id }
            });
            if (duplicate) {
                return res.status(409).json({ success: false, message: "Another role with this name already exists" });
            }
        }

        const updateData = {};
        if (name) updateData.name = name.trim();

        // ✅ Always normalize + deduplicate modules before saving
        if (modules && Array.isArray(modules)) {
            updateData.modules = cleanModules(modules);
        }

        const role = await Role.findByIdAndUpdate(
            id, updateData, { new: true, runValidators: true }
        );

        // Sync roleName in users if role name changed
        if (name && name.trim().toLowerCase() !== existingRole.name.toLowerCase()) {
            await User.updateMany({ role: id }, { $set: { roleName: name.trim() } });
        }

        res.json({ success: true, message: "Role updated successfully", role });

    } catch (error) {
        console.error('Update role error:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Role name already exists" });
        }
        res.status(500).json({ success: false, message: "Error updating role" });
    }
};

/* ================= DELETE ROLE ================= */
exports.deleteRole = async(req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid role ID' });
        }

        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        const usersWithRole = await User.countDocuments({ role: id });
        if (usersWithRole > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete. ${usersWithRole} user(s) assigned to this role. Reassign them first.`
            });
        }

        await Role.findByIdAndDelete(id);
        res.json({ success: true, message: "Role deleted successfully" });

    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({ success: false, message: "Error deleting role" });
    }
};