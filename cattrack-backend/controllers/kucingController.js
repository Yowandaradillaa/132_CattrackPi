const db = require('../config/db');

// Semua user (Developer) bisa melihat data publik
exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM kucing');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM kucing WHERE id = ?', [req.params.id]);
        res.json(rows[0] || { message: 'Data tidak ditemukan' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

