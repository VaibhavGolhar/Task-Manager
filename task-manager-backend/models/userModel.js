const sql = require('mssql');

const User = {
    username: {
        type: sql.VarChar,
        required: true
    },
    password: {
        type: sql.VarChar,
        required: true
    },
    role: {
        type: sql.VarChar,
        required: true
    },
    department: {
        type: sql.VarChar, // or sql.Int if it's a foreign key to a departments table
        required: false
    }
};

module.exports = User;