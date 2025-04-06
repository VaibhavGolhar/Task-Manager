const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_NAME,
    driver: "ODBC Driver 18 for SQL Server",
    options: {
        encrypt: true,
        trustServerCertificate: true,
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
    console.error('SQL pool error', err);
});

module.exports = pool;