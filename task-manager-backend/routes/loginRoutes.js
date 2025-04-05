const express = require('express');
const router = express.Router();
const { verifyLogin } = require('../controllers/loginController');

router.route('/').post(verifyLogin);

module.exports = router;