const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const constants = require("../constants");

// @desc check for user in database
// @route post /api/login
// @access public

const verifyLogin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt with username:", username);
    const user = await User.findOne({ username });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    if (user.password !== password) {
        res.status(401).json({ message: "Invalid password" });
        return;
    }

    res.status(200).json({ message: "Login successful", user });
});

module.exports = { verifyLogin };