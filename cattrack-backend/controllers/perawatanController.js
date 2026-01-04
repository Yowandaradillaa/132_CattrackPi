const db = require('../config/db');

// POST /api/perawatan
exports.create = async (req, res) => {
    const { id_kucing, catatan, tanggal } = req.body;
    try {
        await db.query('INSERT INTO perawatan (id_kucing, catatan, tanggal) VALUES (?, ?, ?)', 
            [id_kucing, catatan, tanggal]);
        res.status(201).json({ message: 'Menambahkan catatan perawatan baru' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/perawatan/kucing/{id_kucing}
exports.getByKucing = async (req, res) => {
    const { id_kucing } = req.params;
    const [rows] = await db.query('SELECT * FROM perawatan WHERE id_kucing = ?', [id_kucing]);
    res.json(rows);
};

