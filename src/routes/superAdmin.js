const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');

// Định nghĩa các route cho super admin
router.get('/', superAdminController.getAllSuperAdmins);           // GET /api/super-admin
router.get('/:id', superAdminController.getSuperAdminById);        // GET /api/super-admin/:id
router.post('/', superAdminController.createSuperAdmin);           // POST /api/super-admin
router.put('/:id', superAdminController.updateSuperAdmin);         // PUT /api/super-admin/:id
router.delete('/:id', superAdminController.deleteSuperAdmin);      // DELETE /api/super-admin/:id

module.exports = router;