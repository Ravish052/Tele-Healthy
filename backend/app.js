const express = require ('express');

const cors = require('cors');
const cookeieParser = require('cookie-parser');

const app = express();

app.use(
    cors({
        origin : ["http://localhost:5173",],
        credentials: true,
    })
)

app.use(express.json({ limit : '10kb'}))
app.use(cookeieParser());

module.exports = app;