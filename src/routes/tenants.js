const express = require('express');
const router = express.Router();
const tenantsController = require('../controllers/tenantsController');
const { auth, requireTenantAdmin } = require('../middleware/auth');

// Định nghĩa các route cho tenant
router.get('/', tenantsController.getAllTenants);           // GET /api/tenants
router.get('/:id', tenantsController.getTenantById);        // GET /api/tenants/:id
router.post('/', auth, tenantsController.createTenant);           // POST /api/tenants (require auth)
router.put('/:id', tenantsController.updateTenant);         // PUT /api/tenants/:id
router.delete('/:id', tenantsController.deleteTenant);      // DELETE /api/tenants/:id
router.put('/self/update', auth, requireTenantAdmin, tenantsController.updateSelf);

module.exports = router;
