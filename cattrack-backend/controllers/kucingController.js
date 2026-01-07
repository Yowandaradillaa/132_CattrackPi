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

// Tambah data kucing baru (Admin Only)
exports.create = async (req, res) => {
    const { nama, jenis, umur, foto } = req.body; // Tambah foto
    try {
        await db.query(
            'INSERT INTO kucing (user_id, nama, jenis, umur, foto) VALUES (?, ?, ?, ?, ?)', 
            [req.user.id, nama, jenis, umur, foto]
        );
        res.json({ message: 'Data Kucing Publik Berhasil Ditambahkan' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update data kucing (Admin Only)
exports.update = async (req, res) => {
    const { nama, jenis, umur, foto } = req.body; // Tambah foto
    try {
        await db.query(
            'UPDATE kucing SET nama=?, jenis=?, umur=?, foto=? WHERE id=?', 
            [nama, jenis, umur, foto, req.params.id]
        );
        res.json({ message: 'Data Kucing Publik Berhasil Diupdate' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Hapus data kucing (Admin Only)
exports.delete = async (req, res) => {
    try {
        await db.query('DELETE FROM kucing WHERE id=?', [req.params.id]);
        res.json({ message: 'Data Kucing Publik Berhasil Dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};