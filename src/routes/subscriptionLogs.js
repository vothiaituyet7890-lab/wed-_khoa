const express = require('express');
const router = express.Router();
const subscriptionLogsController = require('../controllers/subscriptionLogsController');

// Định nghĩa các route cho subscription logs
router.get('/', subscriptionLogsController.getAllLogs);           // GET /api/subscription-logs
router.get('/:id', subscriptionLogsController.getLogById);        // GET /api/subscription-logs/:id
router.post('/', subscriptionLogsController.createLog);           // POST /api/subscription-logs
router.put('/:id', subscriptionLogsController.updateLog);         // PUT /api/subscription-logs/:id
router.delete('/:id', subscriptionLogsController.deleteLog);      // DELETE /api/subscription-logs/:id

module.exports = router;