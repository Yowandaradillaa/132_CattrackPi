const express = require('express');
const router = express.Router();
const kucingController = require('../controllers/kucingController');
const { authenticateApiKey, isAdmin } = require('../middleware/authMiddleware');

// Siapa saja yang punya API Key bisa mengambil data (GET)
router.get('/', authenticateApiKey, kucingController.getAll);
router.get('/:id', authenticateApiKey, kucingController.getById);

// Hanya Admin yang bisa POST, PUT, DELETE
router.post('/', authenticateApiKey, isAdmin, kucingController.create);
router.put('/:id', authenticateApiKey, isAdmin, kucingController.update);
router.delete('/:id', authenticateApiKey, isAdmin, kucingController.delete);

module.exports = router;