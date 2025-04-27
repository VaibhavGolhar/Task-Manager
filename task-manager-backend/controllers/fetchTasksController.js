const asyncHandler = require("express-async-handler");
const sql = require('mssql');
const pool = require('../config/dbConnection');

const fetchTasks = asyncHandler(async (req, res) => {
    const { empId } = req.body;
    const empIdBigInt = BigInt(empId);

    if (!empId) {
        res.status(400).json({ message: "EmpId is required." });
        return;
    }

    try {
        const result = await pool.request()
            .input('empIdBigInt', sql.BigInt, empIdBigInt)
            .query(`
                SELECT 
                    T.*, 
                    E.EmployeeName AS AssignByName, 
                    D.Designation AS AssignByDesignation,
                    ISNULL(SUM(R.WorkingHrs), 0) AS TotalWorkingHrs
                FROM TaskCreate_Header T
                JOIN EmployeeMaster E ON T.AssignById = E.EmployeeId
                JOIN Designation D ON E.DesignationId = D.DesignationId
                LEFT JOIN TaskCreate_Row R ON T.TaskId = R.TaskId
                WHERE T.AssignToId = @empIdBigInt
                GROUP BY 
                    T.TaskId, T.TaskTypeId, T.TaskDesc, T.DeptId, T.AssignToId, 
                    T.AssignById, T.Priority, T.TaskCreateDate, T.FromDate, T.FromTime, 
                    T.EndDate, T.EndTime, T.EstimateHrs, T.Remark, T.ActualEndDate, 
                    T.ActualEndTime, T.CreatedBy, T.CreatedByDate, T.Status, 
                    E.EmployeeName, D.Designation;
            `);

        
        const tasks = result.recordset;
        if (tasks.length === 0) {
            res.status(404).json({ message: "No tasks found." });
            return;
        }

        res.status(200).json({
            message: "Tasks fetched successfully",
            tasks: tasks.map(task => ({
                taskId: task.TaskId?.toString() || '',
                department: task.DeptId?.toString() || '',
                taskHead: task.Remark?.toString() || '',
                task: task.TaskDesc || '',
                assignToId: task.AssignToId?.toString() || '',
                assignById: task.AssignById?.toString() || '',
                assignByName: task.AssignByName || '',
                assignByDesignation: task.AssignByDesignation || '',
                priority: task.Priority?.toString() || '',
                fromDate: task.FromDate ? new Date(task.FromDate).toISOString().split('T')[0] : '',
                toDate: task.EndDate ? new Date(task.EndDate).toISOString().split('T')[0] : '',
                estHours: task.EstimateHrs?.toString() || '',
                workingHrs: task.TotalWorkingHrs?.toString() || '0',
                status: task.Status?.toString() || ''
            }))
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = { fetchTasks };