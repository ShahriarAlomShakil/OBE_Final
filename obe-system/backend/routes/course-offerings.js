const express = require('express');
const router = express.Router();
const CourseOfferingController = require('../controllers/CourseOfferingController');
const EnrollmentController = require('../controllers/EnrollmentController');
const { authenticate, authorize } = require('../middlewares/auth');

/**
 * Course Offering Routes
 * All routes are protected and require authentication
 * Admin and HOD can create, update, delete
 * Teachers can view their offerings
 * All authenticated users can view
 */

// ============================================================================
// PUBLIC ROUTES (REQUIRE AUTHENTICATION ONLY)
// ============================================================================

/**
 * @route   GET /api/v1/course-offerings
 * @desc    Get all course offerings with pagination
 * @access  Authenticated
 */
router.get('/', authenticate, CourseOfferingController.index.bind(CourseOfferingController));

/**
 * @route   GET /api/v1/course-offerings/active
 * @desc    Get all active course offerings
 * @access  Authenticated
 */
router.get('/active', authenticate, CourseOfferingController.getActive.bind(CourseOfferingController));

/**
 * @route   GET /api/v1/course-offerings/search
 * @desc    Search course offerings
 * @access  Authenticated
 */
router.get(
  '/search',
  authenticate,
  CourseOfferingController.searchValidation,
  CourseOfferingController.search.bind(CourseOfferingController)
);

/**
 * @route   GET /api/v1/course-offerings/semester/:semesterId
 * @desc    Get offerings by semester
 * @access  Authenticated
 */
router.get(
  '/semester/:semesterId',
  authenticate,
  CourseOfferingController.getBySemester.bind(CourseOfferingController)
);

/**
 * @route   GET /api/v1/course-offerings/course/:courseId
 * @desc    Get offerings by course
 * @access  Authenticated
 */
router.get(
  '/course/:courseId',
  authenticate,
  CourseOfferingController.getByCourse.bind(CourseOfferingController)
);

/**
 * @route   GET /api/v1/course-offerings/:id
 * @desc    Get single course offering
 * @access  Authenticated
 */
router.get(
  '/:id',
  authenticate,
  CourseOfferingController.idValidation,
  CourseOfferingController.show.bind(CourseOfferingController)
);

// ============================================================================
// RELATIONSHIP ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/course-offerings/:id/details
 * @desc    Get offering with full details (course, semester, teachers)
 * @access  Authenticated
 */
router.get(
  '/:id/details',
  authenticate,
  CourseOfferingController.idValidation,
  CourseOfferingController.getWithRelations.bind(CourseOfferingController)
);

/**
 * @route   GET /api/v1/course-offerings/:id/course
 * @desc    Get offering with course details
 * @access  Authenticated
 */
router.get(
  '/:id/course',
  authenticate,
  CourseOfferingController.idValidation,
  CourseOfferingController.getWithCourse.bind(CourseOfferingController)
);

/**
 * @route   GET /api/v1/course-offerings/:id/semester
 * @desc    Get offering with semester details
 * @access  Authenticated
 */
router.get(
  '/:id/semester',
  authenticate,
  CourseOfferingController.idValidation,
  CourseOfferingController.getWithSemester.bind(CourseOfferingController)
);

/**
 * @route   GET /api/v1/course-offerings/:id/students
 * @desc    Get enrolled students for an offering
 * @access  Authenticated
 */
router.get(
  '/:id/students',
  authenticate,
  CourseOfferingController.idValidation,
  CourseOfferingController.getStudents.bind(CourseOfferingController)
);

/**
 * @route   GET /api/v1/course-offerings/:id/assessments
 * @desc    Get assessment components for an offering
 * @access  Authenticated
 */
router.get(
  '/:id/assessments',
  authenticate,
  CourseOfferingController.idValidation,
  CourseOfferingController.getAssessments.bind(CourseOfferingController)
);

/**
 * @route   GET /api/v1/course-offerings/:id/clo-attainment
 * @desc    Get CLO attainment summary for an offering
 * @access  Authenticated
 */
router.get(
  '/:id/clo-attainment',
  authenticate,
  CourseOfferingController.idValidation,
  CourseOfferingController.getCLOAttainment.bind(CourseOfferingController)
);

/**
 * @route   GET /api/v1/course-offerings/:id/statistics
 * @desc    Get offering statistics
 * @access  Authenticated
 */
router.get(
  '/:id/statistics',
  authenticate,
  CourseOfferingController.idValidation,
  CourseOfferingController.getStatistics.bind(CourseOfferingController)
);

/**
 * @route   GET /api/v1/course-offerings/:id/capacity
 * @desc    Check offering capacity
 * @access  Authenticated
 */
router.get(
  '/:id/capacity',
  authenticate,
  CourseOfferingController.idValidation,
  CourseOfferingController.checkCapacity.bind(CourseOfferingController)
);

/**
 * @route   GET /api/v1/course-offerings/:id/enrollments
 * @desc    Get all enrollments for a course offering
 * @access  Authenticated
 */
router.get(
  '/:id/enrollments',
  authenticate,
  EnrollmentController.getStudentsByCourseOffering
);

/**
 * @route   GET /api/v1/course-offerings/:id/enrollments/with-marks
 * @desc    Get enrollments with assessment marks
 * @access  Teachers, Admin, HOD
 */
router.get(
  '/:id/enrollments/with-marks',
  authenticate,
  authorize('teacher', 'admin', 'hod'),
  EnrollmentController.getEnrollmentsWithMarks
);

// ============================================================================
// ADMIN/HOD ROUTES (CREATE, UPDATE, DELETE)
// ============================================================================

/**
 * @route   POST /api/v1/course-offerings
 * @desc    Create new course offering
 * @access  Admin, HOD
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'hod'),
  CourseOfferingController.createValidation,
  CourseOfferingController.store.bind(CourseOfferingController)
);

/**
 * @route   PUT /api/v1/course-offerings/:id
 * @desc    Update course offering
 * @access  Admin, HOD
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'hod'),
  CourseOfferingController.updateValidation,
  CourseOfferingController.update.bind(CourseOfferingController)
);

/**
 * @route   DELETE /api/v1/course-offerings/:id
 * @desc    Delete course offering (soft delete)
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  CourseOfferingController.idValidation,
  CourseOfferingController.destroy.bind(CourseOfferingController)
);

// ============================================================================
// TEACHER MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   POST /api/v1/course-offerings/:id/teachers
 * @desc    Assign teacher to offering
 * @access  Admin, HOD
 */
router.post(
  '/:id/teachers',
  authenticate,
  authorize('admin', 'hod'),
  CourseOfferingController.assignTeacherValidation,
  CourseOfferingController.assignTeacher.bind(CourseOfferingController)
);

/**
 * @route   DELETE /api/v1/course-offerings/:id/teachers/:teacherId
 * @desc    Remove teacher from offering
 * @access  Admin, HOD
 */
router.delete(
  '/:id/teachers/:teacherId',
  authenticate,
  authorize('admin', 'hod'),
  CourseOfferingController.removeTeacherValidation,
  CourseOfferingController.removeTeacher.bind(CourseOfferingController)
);

// ============================================================================
// UTILITY ROUTES
// ============================================================================

/**
 * @route   PATCH /api/v1/course-offerings/:id/enrollment-count
 * @desc    Update enrollment count
 * @access  Admin, HOD
 */
router.patch(
  '/:id/enrollment-count',
  authenticate,
  authorize('admin', 'hod'),
  CourseOfferingController.idValidation,
  CourseOfferingController.updateEnrollmentCount.bind(CourseOfferingController)
);

module.exports = router;
