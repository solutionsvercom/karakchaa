const Role = require("../models/Users/RoleSchema");

/* ================= CREATE ROLE ================= */
exports.createRole = async(req, res) => {
    try {
        const role = new Role({
            name: req.body.name,
            modules: req.body.modules
        });

        await role.save();

        res.json({
            success: true,
            role
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* ================= GET ALL ROLES ================= */
exports.getRoles = async(req, res) => {

    const roles = await Role.find().sort({ createdAt: -1 });

    res.json({
        success: true,
        roles
    });

};


/* ================= UPDATE ROLE ================= */
exports.updateRole = async(req, res) => {

    try {

        const { name, modules } = req.body;

        const role = await Role.findByIdAndUpdate(
            req.params.id, { name, modules }, { new: true }
        );

        res.json({
            success: true,
            role
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


/* ================= DELETE ROLE ================= */
exports.deleteRole = async(req, res) => {

    try {

        await Role.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Role deleted"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};