const express = require('express');
const { signUp, signup } = require ('../controller/authController');

const { verifyAccount} = require("../controller/authController");
const isAuthenticated = require("../middlewares/isAuthenticated");

const {login} = require("../controller/authController");
const isAuthenticated = require("../middlewares/isAuthenticated");
const {logout} = require("../controller/authController");

const router = express.router();

router.post('/signup', signup);
router.post("/verify", isAuthenticated, verifyAccount);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;