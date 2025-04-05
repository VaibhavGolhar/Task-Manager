const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const connectDb = require('./config/dbConnection');

connectDb();
const app = express();

const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use('/api/login', require('./routes/loginRoutes'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});