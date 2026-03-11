const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/CourseController');
const { authenticate, authorize } = require('../middlewares/auth');

/**
 * Course Routes
 * All routes are protected and require authentication
 * Admin and HOD can create, update, delete
 * All authenticated users can view
 */

// Public routes (require authentication only)
router.get('/', authenticate, CourseController.index.bind(CourseController));
router.get('/count', authenticate, CourseController.getCount.bind(CourseController));
router.get('/active', authenticate, CourseController.getActive.bind(CourseController));
router.get('/search', authenticate, CourseController.search.bind(CourseController));
router.get('/by-credit-hours', authenticate, CourseController.getByCreditHours.bind(CourseController));
router.get('/:id', authenticate, CourseController.show.bind(CourseController));

// Course relationships
router.get('/:id/department', authenticate, CourseController.getWithDepartment.bind(CourseController));
router.get('/:id/relations', authenticate, CourseController.getWithRelations.bind(CourseController));
router.get('/:id/statistics', authenticate, CourseController.getStatistics.bind(CourseController));

// Course academic data
router.get('/:id/clos', authenticate, CourseController.getCLOs.bind(CourseController));
router.get('/:id/objectives', authenticate, CourseController.getObjectives.bind(CourseController));
router.get('/:id/offerings', authenticate, CourseController.getOfferings.bind(CourseController));
router.get('/:id/prerequisites', authenticate, CourseController.getPrerequisites.bind(CourseController));
router.get('/:id/dependent-courses', authenticate, CourseController.getDependentCourses.bind(CourseController));

// Admin/HOD only routes
router.post(
  '/',
  authenticate,
  authorize('admin', 'hod'),
  CourseController.createValidation,
  CourseController.store.bind(CourseController)
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'hod'),
  CourseController.updateValidation,
  CourseController.update.bind(CourseController)
);

router.patch(
  '/:id/toggle-status',
  authenticate,
  authorize('admin'),
  CourseController.toggleStatus.bind(CourseController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  CourseController.destroy.bind(CourseController)
);

module.exports = router;
