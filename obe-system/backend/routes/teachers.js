const express = require('express');
const router = express.Router();
const TeacherController = require('../controllers/TeacherController');
const { authenticate, authorize } = require('../middlewares/auth');

/**
 * @route   GET /api/v1/teachers
 * @desc    Get all teachers with pagination
 * @access  Protected
 */
router.get(
    '/',
    authenticate,
    TeacherController.index.bind(TeacherController)
);

/**
 * @route   POST /api/v1/teachers
 * @desc    Create a new teacher
 * @access  Protected (Admin, HOD)
 */
router.post(
    '/',
    authenticate,
    authorize('admin', 'hod'),
    TeacherController.getCreateValidationRules(),
    TeacherController.store.bind(TeacherController)
);

/**
 * @route   GET /api/v1/teachers/active
 * @desc    Get all active teachers
 * @access  Protected
 */
router.get(
    '/active',
    authenticate,
    TeacherController.getActive.bind(TeacherController)
);

/**
 * @route   GET /api/v1/teachers/search
 * @desc    Search teachers by name, employee ID, or email
 * @access  Protected
 * @query   q - Search term
 */
router.get(
    '/search',
    authenticate,
    TeacherController.search.bind(TeacherController)
);

/**
 * @route   GET /api/v1/teachers/by-department
 * @desc    Get teachers by department
 * @access  Protected
 * @query   departmentId - Department ID
 */
router.get(
    '/by-department',
    authenticate,
    TeacherController.getByDepartment.bind(TeacherController)
);

/**
 * @route   GET /api/v1/teachers/by-designation
 * @desc    Get teachers by designation
 * @access  Protected
 * @query   designationId - Designation ID
 */
router.get(
    '/by-designation',
    authenticate,
    TeacherController.getByDesignation.bind(TeacherController)
);

/**
 * @route   GET /api/v1/teachers/by-user
 * @desc    Get teacher by user ID
 * @access  Protected
 * @query   userId - User ID
 */
router.get(
    '/by-user',
    authenticate,
    TeacherController.getByUser.bind(TeacherController)
);

/**
 * @route   GET /api/v1/teachers/by-employee-id
 * @desc    Get teacher by employee ID
 * @access  Protected
 * @query   employeeId - Employee ID
 */
router.get(
    '/by-employee-id',
    authenticate,
    TeacherController.getByEmployeeId.bind(TeacherController)
);

/**
 * @route   GET /api/v1/teachers/:id
 * @desc    Get teacher by ID
 * @access  Protected
 */
router.get(
    '/:id',
    authenticate,
    TeacherController.show.bind(TeacherController)
);

/**
 * @route   GET /api/v1/teachers/:id/user
 * @desc    Get teacher with user information
 * @access  Protected
 */
router.get(
    '/:id/user',
    authenticate,
    TeacherController.getWithUser.bind(TeacherController)
);

/**
 * @route   GET /api/v1/teachers/:id/department
 * @desc    Get teacher with department information
 * @access  Protected
 */
router.get(
    '/:id/department',
    authenticate,
    TeacherController.getWithDepartment.bind(TeacherController)
);

/**
 * @route   GET /api/v1/teachers/:id/relations
 * @desc    Get teacher with all relationships
 * @access  Protected
 */
router.get(
    '/:id/relations',
    authenticate,
    TeacherController.getWithRelations.bind(TeacherController)
);

/**
 * @route   GET /api/v1/teachers/:id/course-offerings
 * @desc    Get course offerings for a teacher
 * @access  Protected
 */
router.get(
    '/:id/course-offerings',
    authenticate,
    TeacherController.getCourseOfferings.bind(TeacherController)
);

/**
 * @route   GET /api/v1/teachers/:id/statistics
 * @desc    Get statistics for a teacher
 * @access  Protected
 */
router.get(
    '/:id/statistics',
    authenticate,
    TeacherController.getStatistics.bind(TeacherController)
);

/**
 * @route   PUT /api/v1/teachers/:id
 * @desc    Update teacher
 * @access  Protected (Admin, HOD)
 */
router.put(
    '/:id',
    authenticate,
    authorize('admin', 'hod'),
    TeacherController.getUpdateValidationRules(),
    TeacherController.update.bind(TeacherController)
);

/**
 * @route   PATCH /api/v1/teachers/:id/toggle-status
 * @desc    Toggle teacher active status
 * @access  Protected (Admin)
 */
router.patch(
    '/:id/toggle-status',
    authenticate,
    authorize('admin'),
    TeacherController.toggleStatus.bind(TeacherController)
);

/**
 * @route   DELETE /api/v1/teachers/:id
 * @desc    Delete teacher (soft delete)
 * @access  Protected (Admin)
 */
router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    TeacherController.destroy.bind(TeacherController)
);

module.exports = router;
