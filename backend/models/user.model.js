const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { default: isEmail } = require('validator/lib/isEmail');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "Please provide a user name"],
        unique: true,
        trim: true,
        minLength: [3, "User name must be at least 3 characters"],
        maxLength: [30, "User name must be at most 30 characters"],
        index: true
    },

    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        lowercase: true,
        validate: [isEmail, "Please provide a valid email"]
    },

    password: {
        type: String,
        required: [true, "Please provide a password"],
        minLength: [8, "Password must be at least 8 characters"],
        select: false
    },

    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords are not the same!"
        }
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    otp: String,
    otpExpires: Date,
    resetPasswordOtp: String,
    resetPasswordOtpExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now(),
    },

}, { timestamps: true })

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 463);
    this.passwordConfirm = undefined;
    next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;