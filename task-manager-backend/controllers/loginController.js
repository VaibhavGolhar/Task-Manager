const asyncHandler = require("express-async-handler");
const sql = require('mssql');
const pool = require('../config/dbConnection');

// @desc check for user in database
// @route post /api/login
// @access public

const verifyLogin = asyncHandler(async (req, res) => {
    const { empId, password } = req.body;

    if (!empId || !password) {
        res.status(400).json({ message: "EmpId and password are required." });
        return;
    }

    const result = await pool.request()
    .input('empId', sql.BigInt, empId)
    .query(`
        SELECT L.*, EM.EmployeeName, D.Designation
        FROM Login L
        LEFT JOIN EmployeeMaster EM ON L.EmpID = EM.EmployeeId
        LEFT JOIN Designation D ON EM.DesignationId = D.DesignationId
        WHERE L.EmpID = @empId
    `);

    const user = result.recordset[0];
    //console.log(password + ": ", user.Password);

    if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
    }

    if (user.Password !== password.trim()) {
        res.status(401).json({ message: "Invalid password" });
        return;
    }

    const designation = user.Designation?.toLowerCase() || '';
    const isHighAuthority = ["ceo", "chief executive officer", "director"].some(role => designation.includes(role));

    res.status(200).json({
        message: "Login successful",
        user: {
            empId: user.EmpId.toString(),
            employeeName: user.EmployeeName,
            designation: user.Designation
        },
        redirectTo: isHighAuthority ? "Departments" : "Status"
    });
});

module.exports = { verifyLogin };