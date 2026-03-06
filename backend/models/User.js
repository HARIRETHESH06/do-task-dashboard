const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Never return password in queries by default
        },
        role: {
            type: String,
            enum: ['admin', 'manager', 'employee'],
            default: 'employee',
        },
        avatar: {
            type: String,
            default: function () {
                return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.name}`;
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt
    }
);

// ─── HOOKS ────────────────────────────────────────────────────────────────────

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ─── INSTANCE METHODS ─────────────────────────────────────────────────────────

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Return a clean user object (without password) matching the frontend User type
userSchema.methods.toPublicJSON = function () {
    return {
        id: this._id.toString(),
        name: this.name,
        email: this.email,
        role: this.role,
        avatar: this.avatar,
        isActive: this.isActive,
        createdAt: this.createdAt.toISOString(),
    };
};

module.exports = mongoose.model('User', userSchema);
