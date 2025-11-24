const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');

// Validation rules (Giữ nguyên)
const loginValidation = [
    check('email', 'Email không hợp lệ').isEmail(),
    check('password', 'Password phải có ít nhất 6 ký tự').isLength({ min: 6 })
];

const registerValidation = [
    check('username', 'Username là bắt buộc').not().isEmpty(),
    check('email', 'Email không hợp lệ').isEmail(),
    check('password', 'Password phải có ít nhất 6 ký tự').isLength({ min: 6 }),
    check('role', 'Role không hợp lệ').optional().isIn(['superadmin', 'admin'])
];

// === THÊM VALIDATION MỚI CHO MÃ 6 SỐ ===
const verifyValidation = [
    check('email', 'Email không hợp lệ').isEmail(),
    check('code', 'Mã xác thực phải là 6 số').isLength({ min: 6, max: 6 }).isNumeric()
];
// ======================================

// Routes
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);
router.post('/verify-email', verifyValidation, authController.verifyEmail);
// ===================================

module.exports = router;