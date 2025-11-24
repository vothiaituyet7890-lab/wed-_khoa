const express = require('express');
const router = express.Router();
const programsController = require('../controllers/programsController');

// Định nghĩa các route cho program
router.get('/', programsController.getAllPrograms);           // GET /api/programs
router.get('/:id', programsController.getProgramById);        // GET /api/programs/:id
router.post('/', programsController.createProgram);           // POST /api/programs
router.put('/:id', programsController.updateProgram);         // PUT /api/programs/:id
router.delete('/:id', programsController.deleteProgram);      // DELETE /api/programs/:id

module.exports = router;