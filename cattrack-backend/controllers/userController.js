const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');


// 1. Ambil Semua User
exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nama, email, role, api_key, created_at FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Tambah User Manual (Admin Only)
exports.createUser = async (req, res) => {
    const { nama, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const apiKey = uuidv4();
        await db.query('INSERT INTO users (nama, email, password, api_key, role) VALUES (?, ?, ?, ?, ?)', 
            [nama, email, hashedPassword, apiKey, role || 'user']);
        res.status(201).json({ message: 'User berhasil dibuat' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. Update User (Nama/Email/Role)
exports.updateUser = async (req, res) => {
    const { nama, email, role } = req.body;
    try {
        await db.query('UPDATE users SET nama=?, email=?, role=? WHERE id=?', [nama, email, role, req.params.id]);
        res.json({ message: 'User berhasil diperbarui' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. Hapus User
exports.deleteUser = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
        res.json({ message: 'User berhasil dihapus' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};