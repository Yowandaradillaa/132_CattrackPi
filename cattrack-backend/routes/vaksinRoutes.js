const express = require('express');
const router = express.Router();
const vaksinController = require('../controllers/vaksinController');

// PASTIKAN import menggunakan nama { authenticateApiKey }
const { authenticateApiKey } = require('../middleware/authMiddleware');

// Gunakan 'authenticateApiKey' di semua baris, pastikan tidak ada kata 'auth' lagi
router.get('/kucing/:id_kucing', authenticateApiKey, vaksinController.getByKucing);
router.get('/:id', authenticateApiKey, vaksinController.getById);
router.post('/', authenticateApiKey, vaksinController.create);
router.put('/:id', authenticateApiKey, vaksinController.update);
router.delete('/:id', authenticateApiKey, vaksinController.delete); // Baris 10 yang tadi error

module.exports = router;