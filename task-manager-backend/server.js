const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const pool = require('./config/dbConnection');
const { dailyTaskUpdate } = require('./controllers/dailyTaskUpdateController');
const upload = require('./middleware/uploadMiddleware');

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
app.use('/api/updateTask', require('./routes/updateTaskRoutes'));
app.post('/api/dailyTaskUpdate', upload.single('file'), dailyTaskUpdate);
app.use('/api/getDepartmentEmployees', require('./routes/getDepartmentEmployeesRoutes'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});