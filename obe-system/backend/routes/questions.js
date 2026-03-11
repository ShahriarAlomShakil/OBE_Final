const express = require('express');
const router = express.Router();
const QuestionController = require('../controllers/QuestionController');
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../middlewares/asyncHandler');

// ============================================
// Public/Protected Routes (All authenticated users)
// ============================================

/**
 * @route   GET /api/v1/questions
 * @desc    Get all questions with pagination and filters
 * @query   ?assessment_component_id=123&clo_id=5&question_type=mcq&difficulty_level=medium&page=1&limit=10
 * @access  Protected
 */
router.get(
  '/',
  authenticate,
  asyncHandler(QuestionController.index.bind(QuestionController))
);

/**
 * @route   GET /api/v1/questions/assessment/:assessmentComponentId
 * @desc    Get all questions for a specific assessment component
 * @query   ?includeCLO=true&includeBloomLevel=true&orderBy=question_number ASC
 * @access  Protected
 */
router.get(
  '/assessment/:assessmentComponentId',
  authenticate,
  asyncHandler(QuestionController.getByAssessmentComponent.bind(QuestionController))
);

/**
 * @route   GET /api/v1/questions/clo/:cloId
 * @desc    Get all questions mapped to a specific CLO
 * @query   ?assessment_component_id=123 - Optional filter by assessment
 * @access  Protected
 */
router.get(
  '/clo/:cloId',
  authenticate,
  asyncHandler(QuestionController.getByCLO.bind(QuestionController))
);

/**
 * @route   GET /api/v1/questions/assessment/:assessmentComponentId/clo-distribution
 * @desc    Get CLO-wise marks distribution for an assessment
 * @access  Protected
 */
router.get(
  '/assessment/:assessmentComponentId/clo-distribution',
  authenticate,
  asyncHandler(QuestionController.getCLOMarksDistribution.bind(QuestionController))
);

/**
 * @route   GET /api/v1/questions/assessment/:assessmentComponentId/total-marks
 * @desc    Calculate total marks for an assessment component
 * @access  Protected
 */
router.get(
  '/assessment/:assessmentComponentId/total-marks',
  authenticate,
  asyncHandler(QuestionController.calculateTotalMarks.bind(QuestionController))
);

/**
 * @route   GET /api/v1/questions/assessment/:assessmentComponentId/student/:studentId/marks
 * @desc    Get student marks for all questions in an assessment
 * @access  Protected (Teachers only or own data)
 */
router.get(
  '/assessment/:assessmentComponentId/student/:studentId/marks',
  authenticate,
  asyncHandler(QuestionController.getStudentMarks.bind(QuestionController))
);

/**
 * @route   GET /api/v1/questions/:id
 * @desc    Get question by ID
 * @query   ?include=relations or ?includeCLO=true&includeBloomLevel=true&includeAssessmentComponent=true
 * @access  Protected
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(QuestionController.show.bind(QuestionController))
);

// ============================================
// Teacher/Admin Routes
// ============================================

/**
 * @route   POST /api/v1/questions
 * @desc    Create a new question
 * @access  Protected (Teacher, Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('teacher', 'admin'),
  asyncHandler(QuestionController.store.bind(QuestionController))
);

/**
 * @route   POST /api/v1/questions/bulk
 * @desc    Bulk create questions for an assessment
 * @body    { questions: [{question1}, {question2}, ...] }
 * @access  Protected (Teacher, Admin)
 */
router.post(
  '/bulk',
  authenticate,
  authorize('teacher', 'admin'),
  asyncHandler(QuestionController.bulkCreate.bind(QuestionController))
);

/**
 * @route   POST /api/v1/questions/copy
 * @desc    Copy questions from one assessment to another
 * @body    { source_assessment_id, target_assessment_id, question_ids }
 * @access  Protected (Teacher, Admin)
 */
router.post(
  '/copy',
  authenticate,
  authorize('teacher', 'admin'),
  asyncHandler(QuestionController.copyQuestions.bind(QuestionController))
);

/**
 * @route   PUT /api/v1/questions/:id
 * @desc    Update a question
 * @access  Protected (Teacher, Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('teacher', 'admin'),
  asyncHandler(QuestionController.update.bind(QuestionController))
);

/**
 * @route   PUT /api/v1/questions/assessment/:assessmentComponentId/reorder
 * @desc    Reorder questions in an assessment
 * @body    { questionOrders: [{id: 1, question_number: 1}, {id: 2, question_number: 2}] }
 * @access  Protected (Teacher, Admin)
 */
router.put(
  '/assessment/:assessmentComponentId/reorder',
  authenticate,
  authorize('teacher', 'admin'),
  asyncHandler(QuestionController.reorderQuestions.bind(QuestionController))
);

/**
 * @route   DELETE /api/v1/questions/:id
 * @desc    Delete a question (soft delete)
 * @access  Protected (Teacher, Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('teacher', 'admin'),
  asyncHandler(QuestionController.destroy.bind(QuestionController))
);

module.exports = router;
