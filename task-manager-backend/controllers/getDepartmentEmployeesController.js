const asyncHandler = require("express-async-handler");
const sql = require('mssql');
const pool = require('../config/dbConnection');

const getDepartmentEmployees = asyncHandler(async (req, res) => {
    try {
        const { departmentName } = req.body;

        if (!departmentName) {
            return res.status(400).json({ error: 'Department name is required' });
        }

        const query = `
            SELECT 
                e.EmployeeId AS EmployeeId,
                e.EmployeeName,
                des.Designation AS DesignationName,
                t.TaskId AS TaskId,
                t.TaskDesc,
                t.Status AS TaskStatus,
                SUM(tr.WorkingHrs) AS TotalWorkingHrs
            FROM dbo.EmployeeMaster e
            INNER JOIN dbo.Department d ON e.DepartmentId = d.DearptmentId
            INNER JOIN dbo.Designation des ON e.DesignationId = des.DesignationId
            LEFT JOIN dbo.TaskCreate_Header t ON e.EmployeeId = t.AssignToId
            LEFT JOIN dbo.TaskCreate_Row tr ON t.TaskId = tr.TaskId
            WHERE d.Department = @departmentName
			GROUP BY 
                e.EmployeeId, e.EmployeeName, des.Designation, 
                t.TaskId, t.TaskDesc, t.Status;
        `;

        const result = await pool.request()
            .input('departmentName', sql.VarChar, departmentName)
            .query(query);

        const rows = result.recordset;

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
                    completedTasks: 0,
                    tasks: [] // Add a tasks array to store task details
                });
            }

            const employee = employeesMap.get(row.EmployeeId);

            // Count task statuses
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

            // Add task details to the tasks array
            if (row.TaskId) {
                employee.tasks.push({
                    taskId: row.TaskId,
                    description: row.TaskDesc,
                    status: row.TaskStatus,
                    workingHrs: row.TotalWorkingHrs || 0 // Default to 0 if WorkingHrs is null
                });
            }
        });

        const employees = Array.from(employeesMap.values());

        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

module.exports = { getDepartmentEmployees };