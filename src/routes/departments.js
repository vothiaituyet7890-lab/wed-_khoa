const express = require('express');
const router = express.Router();
const departmentsController = require('../controllers/departmentsController');

// Định nghĩa các route cho department
router.get('/', departmentsController.getAllDepartments);           // GET /api/departments
router.get('/:id', departmentsController.getDepartmentById);        // GET /api/departments/:id
router.post('/', departmentsController.createDepartment);           // POST /api/departments
router.put('/:id', departmentsController.updateDepartment);         // PUT /api/departments/:id
router.delete('/:id', departmentsController.deleteDepartment);      // DELETE /api/departments/:id

module.exports = router;