const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(cors()); 
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const kucingRoutes = require('./routes/kucingRoutes');
const perawatanRoutes = require('./routes/perawatanRoutes');
const vaksinRoutes = require('./routes/vaksinRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

