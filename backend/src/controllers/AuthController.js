const User = require('../models/Users/UserSchema');
const Role = require("../models/Users/RoleSchema");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

/* =========================
   REGISTER USER (ADMIN ONLY)
========================= */
exports.register = async(req, res) => {
    try {
        const { name, companyId, email, password, role, phoneNumber } = req.body;

        if (!name || !companyId || !password || !role) {
            return res.status(400).json({ success: false, message: "Please provide name, companyId, password and role" });
        }

        const cleanCompanyId = String(companyId).trim();
        if (!cleanCompanyId) return res.status(400).json({ success: false, message: "Company ID cannot be empty" });
        if (/\s/.test(cleanCompanyId)) return res.status(400).json({ success: false, message: "Company ID cannot contain spaces" });
        if (password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

        const existingUser = await User.findOne({ companyId: { $regex: new RegExp('^' + cleanCompanyId + '$', 'i') } });
        if (existingUser) return res.status(409).json({ success: false, message: "A user with this Company ID already exists" });

        const roleDoc = await Role.findById(role);
        if (!roleDoc) return res.status(400).json({ success: false, message: "Invalid role selected" });

        const user = new User({
            name: name.trim(),
            companyId: cleanCompanyId,
            email: email ? email.toLowerCase().trim() : null,
            password,
            role: roleDoc._id,
            roleName: roleDoc.name,
            phoneNumber: phoneNumber ? phoneNumber.trim() : null // ✅ no optional chaining
        });

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ success: true, message: "User created successfully", user: userResponse });

    } catch (error) {
        console.error('❌ Register error:', error);
        if (error.code === 11000) return res.status(409).json({ success: false, message: "A user with this Company ID already exists" });
        res.status(500).json({ success: false, message: "Error creating user. Please try again." });
    }
};

/* =========================
   LOGIN
========================= */
exports.login = async(req, res) => {
    try {
        const { companyId, password } = req.body;

        if (!companyId || !password) return res.status(400).json({ success: false, message: 'Please provide Company ID and password' });

        const cleanCompanyId = String(companyId).trim();
        const user = await User.findOne({ companyId: { $regex: new RegExp('^' + cleanCompanyId + '$', 'i') } }).populate("role");

        if (!user) return res.status(401).json({ success: false, message: 'Invalid Company ID or password' });
        if (!user.isActive) return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact administrator.' });

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid Company ID or password' });

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign({ userId: user._id, companyId: user.companyId, role: user.role.name, name: user.name },
            JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }
        );
        const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

        res.json({
            success: true,
            token,
            refreshToken,
            user: { _id: user._id, name: user.name, companyId: user.companyId, email: user.email, role: user.role.name, modules: user.role.modules || [] }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ success: false, message: 'Error logging in. Please try again.' });
    }
};

/* =========================
   VERIFY PASSWORD
   Checks a user's current password without side effects.
   Used by frontend before allowing password change in edit form.
========================= */
exports.verifyPassword = async(req, res) => {
    try {
        const { userId, password } = req.body;

        if (!userId || !password) {
            return res.status(400).json({ success: false, message: "userId and password are required" });
        }

        const user = await User.findById(userId).select('+password');
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Password is incorrect" });

        res.json({ success: true, message: "Password verified" });

    } catch (error) {
        console.error('❌ Verify password error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/* =========================
   GET CURRENT USER
========================= */
exports.getCurrentUser = async(req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate("role").select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (!user.isActive) return res.status(403).json({ success: false, message: 'Account has been deactivated' });

        res.json({
            success: true,
            user: { _id: user._id, name: user.name, companyId: user.companyId, email: user.email, role: user.role.name, modules: user.role.modules || [], phoneNumber: user.phoneNumber }
        });

    } catch (error) {
        console.error('❌ Get current user error:', error);
        res.status(500).json({ success: false, message: 'Error fetching user data' });
    }
};

/* =========================
   GET ALL USERS
========================= */
exports.getAllUsers = async(req, res) => {
    try {
        const users = await User.find().populate('role', 'name modules').select('-password').sort({ createdAt: -1 });

        const formattedUsers = users.map(function(user) {
            const userObj = user.toObject();
            if (user.role && !userObj.roleName) userObj.roleName = user.role.name;
            return userObj;
        });

        res.json({ success: true, count: formattedUsers.length, data: formattedUsers });

    } catch (error) {
        console.error('❌ Get all users error:', error);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
};

/* =========================
   UPDATE USER (ADMIN ONLY)
   ✅ FIXED: accepts password and hashes it manually
   (findByIdAndUpdate bypasses pre('save') hook so we hash with bcrypt directly)
========================= */
exports.updateUser = async(req, res) => {
    try {
        const { name, companyId, email, role, phoneNumber, isActive, password } = req.body;
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        if (companyId) {
            const cleanCompanyId = String(companyId).trim();
            if (/\s/.test(cleanCompanyId)) return res.status(400).json({ success: false, message: "Company ID cannot contain spaces" });
            const existingUser = await User.findOne({
                companyId: { $regex: new RegExp('^' + cleanCompanyId + '$', 'i') },
                _id: { $ne: id }
            });
            if (existingUser) return res.status(409).json({ success: false, message: 'Company ID already in use by another user' });
        }

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (companyId) updateData.companyId = String(companyId).trim();
        if (email !== undefined) updateData.email = email ? email.toLowerCase().trim() : null;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber ? phoneNumber.trim() : null; // ✅ no optional chaining
        if (isActive !== undefined) updateData.isActive = isActive;

        if (role) {
            const roleDoc = await Role.findById(role);
            if (!roleDoc) return res.status(400).json({ success: false, message: 'Invalid role selected' });
            updateData.role = role;
            updateData.roleName = roleDoc.name;
        }

        // ✅ Hash password manually — findByIdAndUpdate skips pre('save') hook
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('role')
            .select('-password');

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, message: 'User updated successfully', data: user });

    } catch (error) {
        console.error('❌ Update user error:', error);
        if (error.code === 11000) return res.status(409).json({ success: false, message: 'Company ID already in use' });
        res.status(500).json({ success: false, message: 'Error updating user' });
    }
};

/* =========================
   DELETE USER
========================= */
exports.deleteUser = async(req, res) => {
    try {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ success: false, message: 'Invalid user ID' });
        if (id === req.user.userId) return res.status(400).json({ success: false, message: 'You cannot delete your own account' });

        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, message: 'User deleted successfully' });

    } catch (error) {
        console.error('❌ Delete user error:', error);
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
};

/* =========================
   CHANGE PASSWORD
========================= */
exports.changePassword = async(req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: "Please provide current and new password" });
        if (newPassword.length < 6) return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) return res.status(401).json({ success: false, message: "Current password is incorrect" });

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: "Password changed successfully" });

    } catch (error) {
        console.error('❌ Change password error:', error);
        res.status(500).json({ success: false, message: 'Error changing password' });
    }
};

/* =========================
   REFRESH TOKEN
========================= */
exports.refreshToken = async(req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const user = await User.findById(decoded.userId).populate('role');
        if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Invalid refresh token' });

        const newToken = jwt.sign({ userId: user._id, companyId: user.companyId, role: user.role.name, name: user.name },
            JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({ success: true, token: newToken });

    } catch (error) {
        console.error('❌ Refresh token error:', error);
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
};