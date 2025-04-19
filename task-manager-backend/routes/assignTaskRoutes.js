const express = require('express');
const router = express.Router();
const { assignTask } = require('../controllers/assignTaskController');

router.route('/').post(assignTask);

module.exports = router;