const user = require("../models/user.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const generateotp = require("../utils/generateOtp.js");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { StreamChat } = require("stream-chat");

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
    throw new Error(
        "Missing Stream credentials. Check your environment variables."
    );
}

console.log(apiKey, "KEY");
console.log(apiSecret, "Secret");

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

const createSendToken = (user, statusCode, res, message) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),

        httponly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
    };

    res.cookie("token", token, cookieOptions);

    user.password = undefined;
    user.passwordConfirm = undefined;
    user.otp = undefined;

    const streamToken = streamClient.createToken(user.id);

    //structure of the cookie response when sent to the user
    res.status(statusCode).json({
        status: "success",
        message,
        token,
        streamToken,
        data: {
            user: {
                id: user._id.toString(),
                name: user.username,
            },
        },
    });
};

const signToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "90d",
    });
};


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

        createSendToken(newUser, 200, res, "User registered successfully!");
    } catch (error) {
        console.error("Error sending email", error);
        await user.findByIdAndDelete(newUser._id);
        return next(new AppError("There was an error sending the email. Please try again later.", 500));
    }
});

exports.verifyAccount = catchAsync(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new AppError(" Please provide email and otp", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError("No user found with this email", 404));
    }

    if (user.otp != otp) {
        return next(new AppError("Invalid otp", 400));
    }

    if (Date.now() > user.otpExpires) {
        return next(
            new AppError("OTP has expired. Please request a new one.", 400)
        )
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: "Success",
        message: "Account verified successfully",
    })
})

exports.resendOTP = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError("Email is required to resend OTP", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (user.isVerified) {
        return next(new AppError("This account is already verified", 400));
    }

    const newOtp = generateOtp();
    user.otp = newOtp;
    user.otpExpires = Date.now() + 24 * 60 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user.email,
            subject: "Resend OTP for email verification",
            html: `<h1>Your new OTP is: ${newOtp}</h1>`,
        });

        res.status(200).json({
            status: "success",
            message: "A new OTP has been sent successfully to your email",
        });
    } catch (error) {
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                "There was an error sending the email. Please try again later.",
                500
            )
        );
    }
});


exports.login = catchAsync(async (req, res, next) => {
    {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError("Please provide email and password", 400));
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError("Incorrect email or password", 401));
        }

        const token = signToken(user._id);

        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        };

        res.cookie("token", token, cookieOptions);
    }
})

exports.logout = catchAsync(async (req, res, next) => {
    res.cookie("token", "loggedout", {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
        status: "success",
        message: "Logged out successfully",
    })
})

exports.forgetPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError("No user found", 404));
    }

    const otp = generateOtp();

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 300000; // 5mins

    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user.email,
            subject: "Your password Reset Otp (valid for 5min)",
            html: `<h1>Your password reset Otp : ${otp}</h1>`,
        });

        res.status(200).json({
            status: "success",
            message: "Password reset otp has been sent to your email",
        });
    } catch (error) {
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                "There was an error sending the email. Please try again later"
            )
        );
    }
});

//reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
    const { email, otp, password, passwordConfirm } = req.body;

    const users = await User.find({ email });
    // console.log("Users with that email:", users);

    const user = await User.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordOTPExpires: { $gt: Date.now() },
    });

    // console.log({ email, otp });
    // console.log(("User found?", user))

    if (!user) return next(new AppError("No user found", 400));

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;

    await user.save();

    createSendToken(user, 200, res, "Password reset Successfully");
});
