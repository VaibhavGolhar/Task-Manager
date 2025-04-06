const asyncHandler = require("express-async-handler");
const sql = require('mssql');
const pool = require('../config/dbConnection');

// @desc check for user in database
// @route post /api/login
// @access public

const verifyLogin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password) {
        res.status(400).json({ message: "Username and password are required." });
        return;
    }

    const result = await pool.request()
        .input('username', sql.VarChar, username)
        .query('SELECT * FROM Users WHERE username = @username');

    const user = result.recordset[0];
    if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
    }

    
    if (user.password !== password) {
        res.status(401).json({ message: "Invalid password" });
        return;
    }

    res.status(200).json({ message: "Login successful", user });
});

module.exports = { verifyLogin };