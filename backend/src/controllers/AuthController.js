const User = require('../models/Users/UserSchema');
const Role = require("../models/Users/RoleSchema");
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/* =========================
   REGISTER USER (ADMIN ONLY)
========================= */
exports.register = async(req, res) => {
    try {
        const { name, email, password, role, phoneNumber } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, password and role"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // ✅ GET ROLE DOCUMENT
        const roleDoc = await Role.findById(role);

        if (!roleDoc) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        // ✅ CREATE USER WITH roleName
        const user = new User({
            name,
            email,
            password,
            role: roleDoc._id,
            roleName: roleDoc.name,
            phoneNumber
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
/* =========================
   LOGIN
========================= */
exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;

        console.log('🔐 Login attempt:', { email, password }); // ✅ ADD THIS

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email }).populate("role");

        console.log('👤 User found:', user ? 'YES' : 'NO'); // ✅ ADD THIS
        console.log('👤 User details:', user ? { id: user._id, email: user.email, role: user.role } : 'N/A'); // ✅ ADD THIS

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact admin.'
            });
        }

        console.log('🔑 Comparing password...'); // ✅ ADD THIS
        console.log('🔑 Stored hash:', user.password.substring(0, 30) + '...'); // ✅ ADD THIS

        const isPasswordValid = await user.comparePassword(password);
        console.log('🔑 Password valid:', isPasswordValid); // ✅ ADD THIS

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign({
                userId: user._id,
                email: user.email,
                role: user.role.name,
                name: user.name
            },
            JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }
        );


        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role.name,
                modules: user.role.modules
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error); // ✅ ADD THIS
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};
/* =========================
   GET CURRENT USER
========================= */
exports.getCurrentUser = async(req, res) => {
    try {

        const user = await User.findById(req.user.userId)
            .populate("role") // IMPORTANT
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role.name, // FIX
                modules: user.role.modules, // FIX
                phoneNumber: user.phoneNumber
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================
   GET ALL USERS (ADMIN ONLY)
========================= */
exports.getAllUsers = async(req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

/* =========================
   UPDATE USER (ADMIN ONLY)
========================= */
exports.updateUser = async(req, res) => {
    try {
        const { name, email, role, phoneNumber, isActive } = req.body;
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id, { name, email, role, phoneNumber, isActive }, { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

/* =========================
   DELETE USER (ADMIN ONLY)
========================= */
exports.deleteUser = async(req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};
exports.changePassword = async(req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.password = newPassword; // schema hashes automatically
        await user.save();

        res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};