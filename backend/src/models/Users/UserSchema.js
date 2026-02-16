const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    role: {
        type: String,
        enum: ['admin', 'manager', 'staff'],
        default: 'staff'
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

// ✅ IMPORTANT: Do NOT hash password on save (CreateAdmin already does this)
// Only hash if password is modified AND not already hashed
userSchema.pre('save', async function() {

    if (!this.isModified('password')) {
        return;
    }

    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

});


// ✅ Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

module.exports = mongoose.model('User', userSchema);