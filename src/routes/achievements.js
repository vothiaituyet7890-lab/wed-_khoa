const express = require('express');
const router = express.Router();
const achievementsController = require('../controllers/achievementsController');

// Định nghĩa các route cho achievements
router.get('/', achievementsController.getAllAchievements);           // GET /api/achievements
router.get('/:id', achievementsController.getAchievementById);        // GET /api/achievements/:id
router.post('/', achievementsController.createAchievement);           // POST /api/achievements
router.put('/:id', achievementsController.updateAchievement);         // PUT /api/achievements/:id
router.delete('/:id', achievementsController.deleteAchievement);      // DELETE /api/achievements/:id

module.exports = router;