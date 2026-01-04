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

// GET /api/perawatan/{id}
exports.getById = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM perawatan WHERE id = ?', [req.params.id]);
    res.json(rows[0] || { message: 'Data tidak ditemukan' });
};

// PUT /api/perawatan/{id}
exports.update = async (req, res) => {
    const { catatan, tanggal } = req.body;
    await db.query('UPDATE perawatan SET catatan=?, tanggal=? WHERE id=?', [catatan, tanggal, req.params.id]);
    res.json({ message: 'Mengupdate/Edit catatan perawatan' });
};