const express = require('express');
const router = express.Router();
const researchProjectsController = require('../controllers/researchProjectsController');

// Định nghĩa các route cho research projects
router.get('/', researchProjectsController.getAllProjects);           // GET /api/research-projects
router.get('/:id', researchProjectsController.getProjectById);        // GET /api/research-projects/:id
router.post('/', researchProjectsController.createProject);           // POST /api/research-projects
router.put('/:id', researchProjectsController.updateProject);         // PUT /api/research-projects/:id
router.delete('/:id', researchProjectsController.deleteProject);      // DELETE /api/research-projects/:id

module.exports = router;