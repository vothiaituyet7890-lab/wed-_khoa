const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

// Định nghĩa các route cho events
router.get('/', eventsController.getAllEvents);           // GET /api/events
router.get('/:id', eventsController.getEventById);        // GET /api/events/:id
router.post('/', eventsController.createEvent);           // POST /api/events
router.put('/:id', eventsController.updateEvent);         // PUT /api/events/:id
router.delete('/:id', eventsController.deleteEvent);      // DELETE /api/events/:id

module.exports = router;