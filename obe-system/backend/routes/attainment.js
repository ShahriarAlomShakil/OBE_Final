const express = require('express');
const router = express.Router();
const AttainmentController = require('../controllers/AttainmentController');
const { authenticate, authorize } = require('../middlewares/auth');

// ==================== CALCULATION ENDPOINTS ====================

/**
 * @route   POST /api/v1/attainment/calculate/student-clo
 * @desc    Calculate CLO attainment for a single student
 * @access  Teacher, HOD, Admin
 * @body    { studentId: number, courseOfferingId: number }
 */
router.post(
  '/calculate/student-clo',
  authenticate,
  authorize(['teacher', 'hod', 'admin']),
  AttainmentController.validateCalculateStudentCLO(),
  AttainmentController.calculateStudentCLO.bind(AttainmentController)
);

/**
 * @route   POST /api/v1/attainment/calculate/course-clo
 * @desc    Calculate CLO attainment for all students in a course offering
 * @access  Teacher, HOD, Admin
 * @body    { courseOfferingId: number }
 */
router.post(
  '/calculate/course-clo',
  authenticate,
  authorize(['teacher', 'hod', 'admin']),
  AttainmentController.validateCalculateCourseCLO(),
  AttainmentController.calculateCourseCLO.bind(AttainmentController)
);

/**
 * @route   POST /api/v1/attainment/calculate/student-plo
 * @desc    Calculate PLO attainment for a single student
 * @access  HOD, Admin
 * @body    { studentId: number, degreeId: number }
 */
router.post(
  '/calculate/student-plo',
  authenticate,
  authorize(['hod', 'admin']),
  AttainmentController.validateCalculateStudentPLO(),
  AttainmentController.calculateStudentPLO.bind(AttainmentController)
);

/**
 * @route   POST /api/v1/attainment/calculate/program-plo
 * @desc    Calculate PLO attainment for a program/batch
 * @access  HOD, Admin
 * @body    { degreeId: number, batchYear: number }
 */
router.post(
  '/calculate/program-plo',
  authenticate,
  authorize(['hod', 'admin']),
  AttainmentController.validateCalculateProgramPLO(),
  AttainmentController.calculateProgramPLO.bind(AttainmentController)
);

// ==================== RETRIEVAL ENDPOINTS ====================

/**
 * @route   GET /api/v1/attainment/student/:studentId/clo
 * @desc    Get student's CLO attainment for a course
 * @access  Protected (Teacher, Student, HOD, Admin)
 * @query   courseOfferingId: number (required)
 */
router.get(
  '/student/:studentId/clo',
  authenticate,
  AttainmentController.validateGetStudentCLO(),
  AttainmentController.getStudentCLOAttainment.bind(AttainmentController)
);

/**
 * @route   GET /api/v1/attainment/course/:courseOfferingId/clo
 * @desc    Get course CLO attainment summary
 * @access  Protected (Teacher, HOD, Admin)
 */
router.get(
  '/course/:courseOfferingId/clo',
  authenticate,
  authorize(['teacher', 'hod', 'admin']),
  AttainmentController.validateGetCourseCLO(),
  AttainmentController.getCourseCLOAttainmentSummary.bind(AttainmentController)
);

/**
 * @route   GET /api/v1/attainment/student/:studentId/plo
 * @desc    Get student's PLO attainment
 * @access  Protected (Student, Teacher, HOD, Admin)
 * @query   degreeId: number (optional - if not provided, uses student's degree)
 */
router.get(
  '/student/:studentId/plo',
  authenticate,
  AttainmentController.validateGetStudentPLO(),
  AttainmentController.getStudentPLOAttainment.bind(AttainmentController)
);

/**
 * @route   GET /api/v1/attainment/program/:degreeId/plo
 * @desc    Get program PLO attainment summary
 * @access  Protected (HOD, Admin)
 * @query   batch: number (optional - year, e.g., 2023)
 */
router.get(
  '/program/:degreeId/plo',
  authenticate,
  authorize(['hod', 'admin']),
  AttainmentController.validateGetProgramPLO(),
  AttainmentController.getProgramPLOAttainmentSummary.bind(AttainmentController)
);

module.exports = router;
