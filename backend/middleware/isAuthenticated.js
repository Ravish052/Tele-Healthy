const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

const isAuthenticated = catchAsync(async (req, res, next) => {
    let token;

    if (req.cookies?.token) {
        token = req.cookies.token;
    }else if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401)
        )
    }

    let decoded;

    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }catch(error){
        return next(new AppError('Invalid token. Please log in again!', 401));
    }

    const currentUser = await User.findById(decoded._id);
    if(!currentUser){
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    req.user = currentUser;
    req.user = {
        id : currentUser.id,
        name : currentUser.name,
    }

    next();
})

module.exports = isAuthenticated;