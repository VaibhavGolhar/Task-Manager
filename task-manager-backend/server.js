const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const pool = require('./config/dbConnection');

pool.connect()
  .then(() => console.log('Database connected.'))
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

const app = express();

const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use('/api/login', require('./routes/loginRoutes'));
app.use('/api/employees', require('./routes/employeesRoutes'));
app.use('/api/assignTask', require('./routes/assignTaskRoutes'));
app.use('/api/fetchTasks', require('./routes/fetchTasksRoutes'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});