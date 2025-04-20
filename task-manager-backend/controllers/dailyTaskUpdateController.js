const asyncHandler = require("express-async-handler");
const sql = require('mssql');
const pool = require('../config/dbConnection');

const dailyTaskUpdate = asyncHandler(async (req, res) => {
    try {
        const { userId, taskId, hours, remark } = req.body;
        const uploadedFile = req.file;

        console.log("User ID:", userId);
        console.log("Task ID:", taskId);
        console.log("Hours:", hours);
        console.log("Remark:", remark);
        console.log("Uploaded file info:", uploadedFile);

        // Prepare the file path or null if no file is uploaded
        const filePath = uploadedFile ? uploadedFile.path : null;

        // Insert data into TaskCreate_Row table
        const poolConnection = await pool.connect();
        const query = `
            INSERT INTO TaskCreate_Row (TaskId, Comment, WorkingHrs, FileUpload)
            VALUES (@taskId, @remark, @hours, @filePath)
        `;
        await poolConnection.request()
            .input('taskId', sql.BigInt, taskId)
            .input('remark', sql.NVarChar(500), remark)
            .input('hours', sql.Int, hours)
            .input('filePath', sql.NVarChar(sql.MAX), filePath)
            .query(query);

        res.status(200).json({ message: "Task updated successfully" });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Failed to update task", error: error.message });
    }
});

module.exports = { dailyTaskUpdate };