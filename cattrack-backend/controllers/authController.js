const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.register = async (req, res) => {
    const { nama, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const apiKey = uuidv4();
        
        // Secara default role adalah 'user'
        await db.query('INSERT INTO users (nama, email, password, api_key, role) VALUES (?, ?, ?, ?, "user")', 
            [nama, email, hashedPassword, apiKey]);
        
        res.status(201).json({ 
            message: 'Registrasi Developer Berhasil', 
            api_key: apiKey, 
            nama: nama,
            role: 'user'
        });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0 || !(await bcrypt.compare(password, users[0].password))) {
            return res.status(401).json({ message: 'Email/Password Salah' });
        }

        res.json({ 
            message: 'Login Berhasil', 
            api_key: users[0].api_key, 
            nama: users[0].nama,
            role: users[0].role // Kirim role (admin/user) ke frontend
        });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nama, email, role, api_key, created_at FROM users');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.logout = (req, res) => {
    res.json({ message: 'Logout berhasil' });
};