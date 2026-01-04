const express = require('express');
const router = express.Router();
const perawatanController = require('../controllers/perawatanController');
const { authenticateApiKey } = require('../middleware/authMiddleware');

router.get('/kucing/:id_kucing', authenticateApiKey, perawatanController.getByKucing);
router.get('/:id', authenticateApiKey, perawatanController.getById);
router.post('/', authenticateApiKey, perawatanController.create);
router.put('/:id', authenticateApiKey, perawatanController.update);

module.exports = router;