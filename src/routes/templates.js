const express = require('express');
const router = express.Router();
const templatesController = require('../controllers/templatesController');
const { auth, requireSuperAdmin } = require('../middleware/auth');

// Public: get templates for a plan
router.get('/plan/:planId', templatesController.getTemplatesByPlan);

// Admin routes (protected)
router.post('/', auth, requireSuperAdmin, templatesController.createTemplate);
router.put('/:id', auth, requireSuperAdmin, templatesController.updateTemplate);
router.delete('/:id', auth, requireSuperAdmin, templatesController.deleteTemplate);

module.exports = router;
