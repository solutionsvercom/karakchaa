const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { AuthMiddleware, RoleMiddleware } = require('../middleware/AuthMiddleware');

/* PUBLIC ROUTES */
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

/* PROTECTED ROUTES */
router.get('/me', AuthMiddleware, AuthController.getCurrentUser);
router.post('/change-password', AuthMiddleware, AuthController.changePassword);

/* ADMIN ONLY ROUTES */
router.post('/register', AuthMiddleware, RoleMiddleware('admin'), AuthController.register);
router.get('/users', AuthMiddleware, RoleMiddleware('admin'), AuthController.getAllUsers);
router.put('/users/:id', AuthMiddleware, RoleMiddleware('admin'), AuthController.updateUser);
router.delete('/users/:id', AuthMiddleware, RoleMiddleware('admin'), AuthController.deleteUser);

module.exports = router;