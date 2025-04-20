const express = require('express');
const router = express.Router();
const { updateTask } = require('../controllers/updateTaskController');

router.route('/').post(updateTask);

module.exports = router;