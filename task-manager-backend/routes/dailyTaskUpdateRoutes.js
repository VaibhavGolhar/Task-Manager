const express = require('express');
const router = express.Router();
const { dailyTaskUpdate } = require('../controllers/dailyTaskUpdateController');

router.route('/').post(dailyTaskUpdate);

module.exports = router;