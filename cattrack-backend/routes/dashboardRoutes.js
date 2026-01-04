const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateApiKey } = require('../middleware/authMiddleware');

router.get('/stats', authenticateApiKey, dashboardController.getStats);
router.get('/recent-notes', authenticateApiKey, dashboardController.getRecentNotes);

module.exports = router;