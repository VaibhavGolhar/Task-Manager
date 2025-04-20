const express = require('express');
const router = express.Router();
const { fetchTasks } = require('../controllers/fetchTasksController');

router.route('/').post(fetchTasks);

module.exports = router;