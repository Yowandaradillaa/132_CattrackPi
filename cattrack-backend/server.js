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
const userRoutes = require('./routes/userRoutes');

// Gunakan Routes (URL sesuai PDF Anda)
app.use('/api/auth', authRoutes);
app.use('/api/kucing', kucingRoutes);
app.use('/api/perawatan', perawatanRoutes);
app.use('/api/vaksin', vaksinRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);


// Izinkan semua akses dari frontend

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server CatTrack Berjalan di http://localhost:${PORT}`);
});