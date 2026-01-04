const db = require('../config/db');

// 1. GET /api/dashboard/stats
exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id; // Diambil dari middleware auth

        // Query untuk Total Kucing
        const [kucing] = await db.query(
            'SELECT COUNT(*) as total FROM kucing WHERE user_id = ?', 
            [userId]
        );

        // Query untuk Vaksin Pending (harus join dengan tabel kucing untuk filter user_id)
        const [vaksin] = await db.query(
            `SELECT COUNT(*) as pending FROM vaksin v 
             JOIN kucing k ON v.id_kucing = k.id 
             WHERE k.user_id = ? AND v.status = 'pending'`, 
            [userId]
        );

        // Query untuk Catatan Hari Ini (tanggal hari ini)
        const [catatan] = await db.query(
            `SELECT COUNT(*) as hari_ini FROM perawatan p 
             JOIN kucing k ON p.id_kucing = k.id 
             WHERE k.user_id = ? AND p.tanggal = CURDATE()`, 
            [userId]
        );

        res.json({
            total_kucing: kucing[0].total,
            vaksin_pending: vaksin[0].pending,
            catatan_hari_ini: catatan[0].hari_ini
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. GET /api/dashboard/recent-notes (5 Terakhir)
exports.getRecentNotes = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            `SELECT p.*, k.nama as nama_kucing FROM perawatan p 
             JOIN kucing k ON p.id_kucing = k.id 
             WHERE k.user_id = ? 
             ORDER BY p.tanggal DESC, p.id DESC LIMIT 5`, 
            [userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};