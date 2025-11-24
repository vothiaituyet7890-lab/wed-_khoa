const express = require('express');
const router = express.Router();
const controller = require('../controllers/customTemplatesController');

router.get('/', controller.list); // GET /api/custom-templates?type=header|footer|content
router.post('/', controller.upload); // POST { type, name, htmlcontent }
router.delete('/:type/:name', controller.remove); // DELETE /api/custom-templates/:type/:name

module.exports = router;
