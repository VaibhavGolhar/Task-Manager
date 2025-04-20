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
                SELECT * FROM TaskCreate_Header
                WHERE AssignToId = @empIdBigInt;
            `);

        const tasks = result.recordset;
        console.log(tasks);
        if (tasks.length === 0) {
            res.status(404).json({ message: "No tasks found." });
            return;
        }

        res.status(200).json({
            message: "Tasks fetched successfully",
            tasks: tasks.map(task => ({
            taskId: task.Taskid?.toString() || '',
            department: task.DeptId?.toString() || '',
            taskHead: task.Remark?.toString() || '',
            task: task.TaskDesc || '',
            assignToId: task.AssignToId?.toString() || '',
            assignById: task.AssignById?.toString() || '',
            priority: task.Priority?.toString() || '',
            fromDate: task.FromDate ? new Date(task.FromDate).toISOString().split('T')[0] : '',
            toDate: task.EndDate ? new Date(task.EndDate).toISOString().split('T')[0] : '',
            estHours: task.EstimateHrs?.toString() || '',
            status: task.Status?.toString() || ''
            }))
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = { fetchTasks };