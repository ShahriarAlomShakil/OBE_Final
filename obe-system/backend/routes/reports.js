const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');
const { authenticate, authorize } = require('../middlewares/auth');

// ==================== CLO ATTAINMENT REPORTS ====================

/**
 * @route   GET /api/v1/reports/clo-attainment/:courseOfferingId
 * @desc    Generate CLO attainment report for a course offering
 * @access  Teacher, HOD, Admin
 * @returns { course, clos[], students[], attainmentMatrix[][], summary }
 */
router.get(
  '/clo-attainment/:courseOfferingId',
  authenticate,
  authorize(['teacher', 'hod', 'admin']),
  ReportController.validateGetCLOAttainmentReport(),
  ReportController.getCLOAttainmentReport.bind(ReportController)
);

/**
 * @route   GET /api/v1/reports/clo-attainment/:courseOfferingId/pdf
 * @desc    Generate CLO attainment report as PDF
 * @access  Teacher, HOD, Admin
 * @returns PDF file download
 */
router.get(
  '/clo-attainment/:courseOfferingId/pdf',
  authenticate,
  authorize(['teacher', 'hod', 'admin']),
  ReportController.validateGetCLOAttainmentReport(),
  ReportController.getCLOAttainmentReportPDF.bind(ReportController)
);

// ==================== PLO ATTAINMENT REPORTS ====================

/**
 * @route   GET /api/v1/reports/plo-attainment/:degreeId
 * @desc    Generate PLO attainment report for a degree/program
 * @access  HOD, Admin
 * @query   batch - Optional batch year filter
 * @returns { degree, plos[], students[], attainmentMatrix[][], summary }
 */
router.get(
  '/plo-attainment/:degreeId',
  authenticate,
  authorize(['hod', 'admin']),
  ReportController.validateGetPLOAttainmentReport(),
  ReportController.getPLOAttainmentReport.bind(ReportController)
);

/**
 * @route   GET /api/v1/reports/plo-attainment/:degreeId/pdf
 * @desc    Generate PLO attainment report as PDF
 * @access  HOD, Admin
 * @query   batch - Optional batch year filter
 * @returns PDF file download
 */
router.get(
  '/plo-attainment/:degreeId/pdf',
  authenticate,
  authorize(['hod', 'admin']),
  ReportController.validateGetPLOAttainmentReport(),
  ReportController.getPLOAttainmentReportPDF.bind(ReportController)
);

// ==================== CLO-PLO MAPPING REPORTS ====================

/**
 * @route   GET /api/v1/reports/clo-plo-mapping/:courseId
 * @desc    Generate CLO-PLO mapping matrix report for a course
 * @access  Teacher, HOD, Admin
 * @returns { course, clos[], plos[], mappingMatrix[][], summary }
 */
router.get(
  '/clo-plo-mapping/:courseId',
  authenticate,
  authorize(['teacher', 'hod', 'admin']),
  ReportController.validateGetCLOPLOMappingReport(),
  ReportController.getCLOPLOMappingReport.bind(ReportController)
);

/**
 * @route   GET /api/v1/reports/clo-plo-mapping/:courseId/pdf
 * @desc    Generate CLO-PLO mapping report as PDF
 * @access  Teacher, HOD, Admin
 * @returns PDF file download
 */
router.get(
  '/clo-plo-mapping/:courseId/pdf',
  authenticate,
  authorize(['teacher', 'hod', 'admin']),
  ReportController.validateGetCLOPLOMappingReport(),
  ReportController.getCLOPLOMappingReportPDF.bind(ReportController)
);

// ==================== STUDENT TRANSCRIPT REPORTS ====================

/**
 * @route   GET /api/v1/reports/student-transcript/:studentId
 * @desc    Generate comprehensive OBE transcript for a student
 * @access  All authenticated users (students can view own, others need authorization)
 * @returns { student, courses[], cloAttainment[], ploAttainment[], summary }
 */
router.get(
  '/student-transcript/:studentId',
  authenticate,
  ReportController.validateGetStudentTranscript(),
  ReportController.getStudentTranscript.bind(ReportController)
);

/**
 * @route   GET /api/v1/reports/student-transcript/:studentId/pdf
 * @desc    Generate student OBE transcript as PDF
 * @access  All authenticated users (students can view own)
 * @returns PDF file download
 */
router.get(
  '/student-transcript/:studentId/pdf',
  authenticate,
  ReportController.validateGetStudentTranscript(),
  ReportController.getStudentTranscriptPDF.bind(ReportController)
);

// ==================== GAP ANALYSIS REPORTS ====================

/**
 * @route   GET /api/v1/reports/gap-analysis/:courseOfferingId
 * @desc    Generate gap analysis report identifying underperforming CLOs
 * @access  Teacher, HOD, Admin
 * @returns { course, underperformingCLOs[], recommendations[], summary }
 */
router.get(
  '/gap-analysis/:courseOfferingId',
  authenticate,
  authorize(['teacher', 'hod', 'admin']),
  ReportController.validateGetGapAnalysisReport(),
  ReportController.getGapAnalysisReport.bind(ReportController)
);

/**
 * @route   GET /api/v1/reports/gap-analysis/:courseOfferingId/pdf
 * @desc    Generate gap analysis report as PDF
 * @access  Teacher, HOD, Admin
 * @returns PDF file download
 */
router.get(
  '/gap-analysis/:courseOfferingId/pdf',
  authenticate,
  authorize(['teacher', 'hod', 'admin']),
  ReportController.validateGetGapAnalysisReport(),
  ReportController.getGapAnalysisReportPDF.bind(ReportController)
);

module.exports = router;
