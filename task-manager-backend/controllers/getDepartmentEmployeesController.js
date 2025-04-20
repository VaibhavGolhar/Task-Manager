const asyncHandler = require("express-async-handler");
const sql = require('mssql');
const pool = require('../config/dbConnection');

const getDepartmentEmployees = asyncHandler(async (req, res) => {
    try {
        //console.log('Fetching employees...');
        const { departmentName } = req.body;

        if (!departmentName) {
            return res.status(400).json({ error: 'Department name is required' });
        }

        const query = `
            SELECT 
                e.Id AS EmployeeId,
                e.EmployeeName,
                des.Designation AS DesignationName,
                t.Status AS TaskStatus
            FROM dbo.EmployeeMaster e
            INNER JOIN dbo.Department d ON e.DepartmentId = d.DearptmentId
            INNER JOIN dbo.Designation des ON e.DesignationId = des.DesignationId
            LEFT JOIN dbo.TaskCreate_Header t ON e.EmployeeId = t.AssignToId
            WHERE d.Department = @departmentName;
        `;

        const result = await pool.request()
            .input('departmentName', sql.VarChar, departmentName)
            .query(query);

        const rows = result.recordset;
        //console.log(rows);
        // Group tasks by employee and count task statuses
        const employeesMap = new Map();

        rows.forEach(row => {
            if (!employeesMap.has(row.EmployeeId)) {
                employeesMap.set(row.EmployeeId, {
                    id: row.EmployeeId,
                    name: row.EmployeeName,
                    designation: row.DesignationName,
                    newTasks: 0,
                    inProgressTasks: 0,
                    submittedTasks: 0,
                    completedTasks: 0
                });
            }

            const employee = employeesMap.get(row.EmployeeId);

            switch (row.TaskStatus) {
                case 'new':
                    employee.newTasks += 1;
                    break;
                case 'inProgress':
                    employee.inProgressTasks += 1;
                    break;
                case 'submitted':
                    employee.submittedTasks += 1;
                    break;
                case 'completed':
                    employee.completedTasks += 1;
                    break;
                default:
                    break;
            }
        });

        const employees = Array.from(employeesMap.values());

        //console.log('Employees fetched successfully:', employees);
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

module.exports = { getDepartmentEmployees };