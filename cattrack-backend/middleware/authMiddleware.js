const db = require('../config/db');

// Middleware untuk cek apakah API Key Valid
const authenticateApiKey = async (req, res, next) => {
    const apiKey = req.header('x-api-key');
    if (!apiKey) return res.status(401).json({ message: 'API Key diperlukan (x-api-key)' });

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE api_key = ?', [apiKey]);
        if (rows.length === 0) return res.status(403).json({ message: 'API Key tidak valid' });
        
        req.user = rows[0]; // Menyimpan data user (termasuk role) ke request
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Middleware tambahan untuk cek Role Admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            message: 'Akses Ditolak: Hanya Admin yang dapat mengelola (CRUD) data publik CatTrackPi.' 
        });
    }
    next();
};

module.exports = { authenticateApiKey, isAdmin };