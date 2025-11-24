const express = require('express');
const router = express.Router();
const { auth, requireTenantAdmin } = require('../middleware/auth');
const controller = require('../controllers/tenantTemplatesController');

// Lưu file HTML custom cho tenant hiện tại
router.post('/custom-html', auth, requireTenantAdmin, controller.saveCustomHtml);

module.exports = router;
