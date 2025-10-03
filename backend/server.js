require("dotenv").config();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({
    path: "./config.env",
});

const app = require("./app");

const db = process.env.DB

mongoose
    .connect(db)
    .then(() => { console.log("DB connection successful!") })
    .catch(err => {
        console.error("DB connection error:", err);
    });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});