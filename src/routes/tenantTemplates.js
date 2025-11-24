const express = require('express');
const router = express.Router();
const tenantTemplatesController = require('../controllers/tenantTemplatesController');
const { auth, requireTenantAdmin } = require('../middleware/auth');

// Public preview route by slug
router.get('/preview/:slug', tenantTemplatesController.previewBySlug);
// Public serve by domain
router.get('/domain/:domain', tenantTemplatesController.serveByDomain);

// Tenant admin routes
router.get('/', auth, requireTenantAdmin, tenantTemplatesController.getMyTemplates);
router.get('/:id', auth, requireTenantAdmin, tenantTemplatesController.getById);
router.put('/:id', auth, requireTenantAdmin, tenantTemplatesController.updateTemplate);

module.exports = router;
