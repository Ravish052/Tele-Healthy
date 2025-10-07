const user = require("../models/user.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const generateotp = require("../utils/generateOtp.js");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const createSendToken = require("../utils/createSendToken");

exports.signup = catchAsync(async (req, res, next) => {
    const { userName, email, password, passwordConfirm } = req.body;

    const existingUser = await user.findOne({ email });

    if (existingUser) return next(new AppError("Email already in use", 400));

    const otp = generateotp();
    const otpExpires = Date.now() + 24 * 60 * 60 * 1000;

    const newUser = await user.create({
        userName,
        email,
        password,
        passwordConfirm,
        otp,
        otpExpires,
    })

    try {
        await sendEmail({
            email: newUser.email,
            subject: "Account Verification OTP",
            html: `<p>Your OTP for account verification is ${otp}. It is valid for 24 hours.</p>`
        });

        createSendToken(newuser, 200, res, "User registered successfully!");
    } catch (error) {
        console.error("Error sending email", error);
        await user.findByIdAndDelete(newUser._id);
        return next(new AppError("There was an error sending the email. Please try again later.", 500));
    }
});

exports.verifyAccount = catchAsync(async(req, res, next) => {
    const { email, otp} = req.body;

    if( !email || !otp) {
        return next ( new AppError( " Please provide email and otp", 400));
    }

    const user = await User.findOne({email});

    if(!user){
        return next(new AppError("No user found with this email", 404));
    }

    if (user.otp != otp ){
        return next (new AppError("Invalid otp", 400));
    }

    if(Date.now() > user.otpExpires) {
        return next(
            new AppError("OTP has expired. Please request a new one.", 400)
        )
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status : "Success",
        message: "Account verified successfully",
    })
})

