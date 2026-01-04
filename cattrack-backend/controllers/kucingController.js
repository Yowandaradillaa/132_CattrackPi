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

// Hanya Admin yang bisa menambah, mengubah, dan menghapus
exports.create = async (req, res) => {
    const { nama, jenis, umur } = req.body;
    await db.query('INSERT INTO kucing (user_id, nama, jenis, umur) VALUES (?, ?, ?, ?)', [req.user.id, nama, jenis, umur]);
    res.json({ message: 'Data Kucing Publik Berhasil Ditambahkan (Admin Only)' });
};

exports.update = async (req, res) => {
    const { nama, jenis, umur } = req.body;
    await db.query('UPDATE kucing SET nama=?, jenis=?, umur=? WHERE id=?', [nama, jenis, umur, req.params.id]);
    res.json({ message: 'Data Kucing Publik Berhasil Diupdate' });
};

exports.delete = async (req, res) => {
    await db.query('DELETE FROM kucing WHERE id=?', [req.params.id]);
    res.json({ message: 'Data Kucing Publik Berhasil Dihapus' });
};