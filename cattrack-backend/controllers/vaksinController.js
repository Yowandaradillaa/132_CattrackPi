const db = require('../config/db');

// 1. GET /api/vaksin/kucing/{id_kucing} (Semua jadwal vaksin satu kucing)
exports.getByKucing = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM vaksin WHERE id_kucing = ?', [req.params.id_kucing]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 2. GET /api/vaksin/{id} (Detail satu jadwal vaksin)
exports.getById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM vaksin WHERE id = ?', [req.params.id]);
        res.json(rows[0] || { message: 'Jadwal vaksin tidak ditemukan' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. POST /api/vaksin (Menambahkan jadwal vaksin baru)
exports.create = async (req, res) => {
    const { id_kucing, nama_vaksin, status, tanggal } = req.body;
    try {
        await db.query('INSERT INTO vaksin (id_kucing, nama_vaksin, status, tanggal) VALUES (?, ?, ?, ?)', 
            [id_kucing, nama_vaksin, status || 'pending', tanggal]);
        res.status(201).json({ message: 'Menambahkan jadwal vaksin baru' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. PUT /api/vaksin/{id} (Mengupdate jadwal atau status)
exports.update = async (req, res) => {
    const { nama_vaksin, status, tanggal } = req.body;
    try {
        await db.query('UPDATE vaksin SET nama_vaksin=?, status=?, tanggal=? WHERE id=?', 
            [nama_vaksin, status, tanggal, req.params.id]);
        res.json({ message: 'Mengupdate jadwal vaksin atau status' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 5. DELETE /api/vaksin/{id} (Menghapus jadwal vaksin)
exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM vaksin WHERE id = ?', [req.params.id]);
        res.json({ message: 'Menghapus jadwal vaksin' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};