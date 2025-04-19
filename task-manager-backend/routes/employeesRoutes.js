const express = require('express');
const router = express.Router();
const { fetchEmployees } = require('../controllers/employeeFetchController');

router.route('/').get(fetchEmployees);

module.exports = router;