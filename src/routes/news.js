const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Định nghĩa các route cho news
router.get('/', newsController.getAllNews);           // GET /api/news
router.get('/:id', newsController.getNewsById);        // GET /api/news/:id
router.post('/', newsController.createNews);           // POST /api/news
router.put('/:id', newsController.updateNews);         // PUT /api/news/:id
router.delete('/:id', newsController.deleteNews);      // DELETE /api/news/:id

module.exports = router;