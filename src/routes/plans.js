const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plansController');

// Định nghĩa các route cho plans
router.get('/', plansController.getAllPlans);           // GET /api/plans
router.get('/:id', plansController.getPlanById);        // GET /api/plans/:id
router.post('/', plansController.createPlan);           // POST /api/plans
router.put('/:id', plansController.updatePlan);         // PUT /api/plans/:id
router.delete('/:id', plansController.deletePlan);      // DELETE /api/plans/:id

module.exports = router;