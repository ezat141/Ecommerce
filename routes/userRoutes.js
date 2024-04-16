const express = require('express');

const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const userController = require('../controllers/userController');

router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);
router.delete('/:id',  authMiddleware, adminMiddleware, userController.deleteUser);


module.exports = router;