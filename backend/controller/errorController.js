const errorHandlers = require("./globalErrorHandler")

const {
    handleCastErrorDB,
    handleDuplicateFieldsDB,
    handleValidationErrorDB,
    handleJWTError,
    handleJWTExpiredError,
} = errorHandlers;

MediaSourceHandle.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    let error = {...err, message : err.message};

    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    res.status(error.statusCode).json({
        status : error.status,
        message : error.message,
        ...(Process.env.NODE_ENV === "production" && {error, stack: err.stack})
    })
}