const express = require('express');

const cors = require('cors');
const cookeieParser = require('cookie-parser');

const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');

const app = express();

app.use(
    cors({
        origin: ["http://localhost:5173",],
        credentials: true,
    })
)

app.use(express.json({ limit: '10kb' }))
app.use(cookeieParser());

app.all("/{*any}", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
})

app.use(globalErrorHandler);

const signToken = (userId) => {
    return jwt.sign({
        id: userId
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '90d'
    })
}

const createToken = (user, statusCode, res, message) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000),
        httponly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}

res.cookie("token", token, cookieOptions);

user.password = undefined;
user.passwordConfirm = undefined;
user.otp = undefined;

module.exports = app;