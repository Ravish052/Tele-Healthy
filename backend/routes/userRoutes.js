const express = require('express');
const { signUp, signup } = require ('../controller/authController');

const router = express.router();

router.post('/signup', signup);

module.exports = router;