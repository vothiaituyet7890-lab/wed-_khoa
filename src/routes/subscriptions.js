const express = require('express');
const router = express.Router();
const subscriptionsController = require('../controllers/subscriptionsController');
const { auth, requireTenantAdmin } = require('../middleware/auth');

// Định nghĩa các route cho subscriptions
router.get('/', subscriptionsController.getAllSubscriptions);           // GET /api/subscriptions
router.get('/:id', subscriptionsController.getSubscriptionById);        // GET /api/subscriptions/:id
router.post('/', subscriptionsController.createSubscription);           // POST /api/subscriptions
router.post('/mine', auth, requireTenantAdmin, subscriptionsController.createForTenantSelf); // tenant tự đăng ký thêm
router.put('/:id', subscriptionsController.updateSubscription);         // PUT /api/subscriptions/:id
router.delete('/:id', subscriptionsController.deleteSubscription);      // DELETE /api/subscriptions/:id

module.exports = router;
