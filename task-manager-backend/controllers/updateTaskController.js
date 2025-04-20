const asyncHandler = require("express-async-handler");
const sql = require('mssql');
const pool = require('../config/dbConnection');

const updateTask = asyncHandler(async (req, res) => {
    const taskId = req.body.taskId;
    const newStatus = req.body.newStatus;

    const query = `
        UPDATE TaskCreate_Header
        SET Status = @newStatus
        WHERE TaskId = @taskId
    `;

    try {
        const request = pool.request();
        request.input('newStatus', sql.VarChar(10), newStatus);
        request.input('taskId', sql.BigInt, taskId);

        await request.query(query);

        res.status(200).json({ message: "Task status updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating task status", error: error.message });
    }
});

module.exports = { updateTask };