const asyncHandler = require("express-async-handler");
const sql = require('mssql');
const pool = require('../config/dbConnection');

const assignTask = asyncHandler(async (req, res) => {
    const {
        department,
        Remark,
        TaskDesc,
        AssignToId,
        AssignById,
        Priority,
        fromDate,
        toDate,
        EstimateHrs
      } = req.body;

      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      
      const fromDateOnly = new Date(fromDateObj.toISOString().split('T')[0]);
      const toDateOnly = new Date(toDateObj.toISOString().split('T')[0]);
      console.log(fromDateOnly +", " + typeof(fromDateOnly));

      const assignByBigInt = BigInt(AssignById);

      const estHoursInt = parseInt(EstimateHrs);

      const assignToBigInts = AssignToId.map(id => BigInt(id));


    try {
        // Map priority to database values
        const priorityMap = {
            low: 3,
            medium: 2,
            high: 1
        };

        // Get current date and time for TaskCreateDate and CreatedByDate
        const currentDate = new Date();
        
        const now = new Date();
        const dateStr = now.getDate().toString().padStart(2, '0') + 
                       (now.getMonth() + 1).toString().padStart(2, '0') + 
                       now.getFullYear();
        const timeStr = now.getHours().toString().padStart(2, '0') + 
                       now.getMinutes().toString().padStart(2, '0') + 
                       now.getSeconds().toString().padStart(2, '0');
        const Taskid = BigInt(assignByBigInt.toString() + dateStr + timeStr);

        
        // Insert task into the database
        const poolConnection = await pool;
        const insertedTaskIds = [];

        for (const userId of assignToBigInts) {
            const result = await poolConnection.request()
                .input('Taskid', sql.BigInt, Taskid)
                .input('TaskTypeId', sql.Int, null)
                .input('TaskDesc', sql.NVarChar(sql.MAX), TaskDesc)
                .input('DeptId', sql.Int, department)
                .input('AssignToId', sql.BigInt, userId)
                .input('AssignById', sql.BigInt, assignByBigInt)
                .input('Priority', sql.Int, priorityMap[Priority.toLowerCase()])
                .input('TaskCreateDate', sql.DateTime, currentDate)
                .input('FromDate', sql.Date, fromDateOnly)
                .input('EndDate', sql.Date, toDateOnly)
                .input('EstimateHrs', sql.Int, estHoursInt)
                .input('Remark', sql.NVarChar(300), Remark)
                .input('ActualEndDate', sql.Date, null)
                .input('ActualEndTime', sql.Time, null)
                .input('CreatedBy', sql.BigInt, assignByBigInt)
                .input('CreatedByDate', sql.DateTime, currentDate)
                .input('Status', sql.VarChar(10), 'new')
                .query(`
                    INSERT INTO TaskCreate_Header (
                        TaskId, TaskTypeId, TaskDesc, DeptId, AssignToId, AssignById, Priority, 
                        TaskCreateDate, FromDate, EndDate, EstimateHrs, 
                        Remark, ActualEndDate, ActualEndTime, CreatedBy, CreatedByDate, Status
                    ) VALUES (
                        @Taskid, @TaskTypeId, @TaskDesc, @DeptId, @AssignToId, @AssignById, @Priority, 
                        @TaskCreateDate, @FromDate, @EndDate, @EstimateHrs, 
                        @Remark, @ActualEndDate, @ActualEndTime, @CreatedBy, @CreatedByDate, @Status
                    )
                `);

                insertedTaskIds.push(userId.toString());
        }

        res.status(201).json({ taskIds: insertedTaskIds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to assign task" });
    }
});

module.exports = { assignTask };