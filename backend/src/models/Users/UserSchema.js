const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    // ✅ CHANGED: companyId replaces email as login credential
    // Accepts any format: "john123", "EMP-001", "1001", "john.doe"
    companyId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // ✅ CHANGED: email is now optional — contact use only, not for login
    email: {
        type: String,
        required: false,
        lowercase: true,
        trim: true,
        default: null
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true
    },

    roleName: {
        type: String
    },

    phoneNumber: {
        type: String
    },

    isActive: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    lastLogin: {
        type: Date
    }
});

// Only hash if password is modified AND not already hashed
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

module.exports = mongoose.model('User', userSchema);