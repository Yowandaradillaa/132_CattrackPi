const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateApiKey, isAdmin } = require('../middleware/authMiddleware');


router.get('/', authenticateApiKey, isAdmin, userController.getUsers);
// Pasang Middleware secara global untuk rute ini
router.use(authenticateApiKey, isAdmin);

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;