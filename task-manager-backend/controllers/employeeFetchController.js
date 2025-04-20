const asyncHandler = require("express-async-handler");
const sql = require('mssql');
const pool = require('../config/dbConnection');

const fetchEmployees = asyncHandler(async (req, res) => {
    try {
      //console.log('Fetching employees...');
      const result = await pool.query('SELECT EmployeeId, EmployeeName FROM dbo.EmployeeMaster;');
      
      // Get the actual rows from the result object
      const rows = result.recordset;
      
      const employees = rows.map((emp) => ({
        id: emp.EmployeeId,
        name: emp.EmployeeName
      }));
      //console.log('Employees fetched successfully:', employees);
      res.status(200).json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: 'Failed to fetch employees' });
    }
  });

  module.exports = { fetchEmployees };