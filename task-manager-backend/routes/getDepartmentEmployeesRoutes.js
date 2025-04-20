const express = require('express');
const router = express.Router();
const { getDepartmentEmployees } = require('../controllers/getDepartmentEmployeesController');

router.route('/').post(getDepartmentEmployees);

module.exports = router;