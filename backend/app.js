const express = require ('express');

const cors = require('cors');
const cookeieParser = require('cookie-parser');

const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');

const app = express();

app.use(
    cors({
        origin : ["http://localhost:5173",],
        credentials: true,
    })
)

app.use(express.json({ limit : '10kb'}))
app.use(cookeieParser());

app.all("/{*any}", (req, res, next) => {
    next (new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
})

app.use(globalErrorHandler);

module.exports = app;