const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const tenantAccountsController = require('../controllers/tenantAccountsController');
const { auth } = require('../middleware/auth');
const { requireTenant } = require('../middleware/tenant');

// Validation middleware
const createAccountValidation = [
    check('tenantid', 'Tenant ID không hợp lệ').isInt(),
    check('username', 'Username là bắt buộc').not().isEmpty(),
    check('email', 'Email không hợp lệ').isEmail(),
    check('password', 'Password phải có ít nhất 6 ký tự').isLength({ min: 6 }),
    check('role', 'Role không hợp lệ').optional().isIn(['admin', 'user'])
];

const updateAccountValidation = [
    check('username', 'Username là bắt buộc').optional().not().isEmpty(),
    check('email', 'Email không hợp lệ').optional().isEmail(),
    check('password', 'Password phải có ít nhất 6 ký tự').optional().isLength({ min: 6 }),
    check('role', 'Role không hợp lệ').optional().isIn(['admin', 'user'])
];

// Routes with authentication
router.get('/', auth, requireTenant, tenantAccountsController.getAllAccounts);
router.get('/:id', auth, requireTenant, tenantAccountsController.getAccountById);
router.post('/', [auth, requireTenant, ...createAccountValidation], tenantAccountsController.createAccount);
router.put('/:id', [auth, requireTenant, ...updateAccountValidation], tenantAccountsController.updateAccount);
router.delete('/:id', auth, requireTenant, tenantAccountsController.deleteAccount);

module.exports = router;