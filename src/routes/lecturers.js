const express = require('express');
const router = express.Router();
const lecturersController = require('../controllers/lecturersController');

// Định nghĩa các route cho lecturer
router.get('/', lecturersController.getAllLecturers);           // GET /api/lecturers
router.get('/:id', lecturersController.getLecturerById);        // GET /api/lecturers/:id
router.post('/', lecturersController.createLecturer);           // POST /api/lecturers
router.put('/:id', lecturersController.updateLecturer);         // PUT /api/lecturers/:id
router.delete('/:id', lecturersController.deleteLecturer);      // DELETE /api/lecturers/:id

module.exports = router;