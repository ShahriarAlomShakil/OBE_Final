const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../middlewares/asyncHandler');
const { body, param, query } = require('express-validator');
const db = require('../config/database');

// ============================================
// CLO-PLO Mapping Routes
// ============================================

/**
 * @route   GET /api/v1/clo-plo-mappings
 * @desc    Get all CLO-PLO mappings with filters
 * @access  Protected
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { course_id, clo_id, plo_id, degree_id } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (clo_id) {
      whereClause += ' AND cpm.clo_id = ?';
      params.push(clo_id);
    }

    if (plo_id) {
      whereClause += ' AND cpm.plo_id = ?';
      params.push(plo_id);
    }

    if (course_id) {
      whereClause += ' AND c.id = ?';
      params.push(course_id);
    }

    if (degree_id) {
      whereClause += ' AND d.id = ?';
      params.push(degree_id);
    }

    const [mappings] = await db.query(
      `SELECT 
        cpm.id,
        cpm.clo_id,
        clo.clo_code,
        clo.description as clo_description,
        cpm.plo_id,
        plo.plo_code,
        plo.description as plo_description,
        cpm.mapping_strength,
        CASE 
          WHEN cpm.mapping_strength = 1 THEN 'Low'
          WHEN cpm.mapping_strength = 2 THEN 'Medium'
          WHEN cpm.mapping_strength = 3 THEN 'High'
          ELSE 'Unknown'
        END as strength_label,
        c.course_code,
        c.course_title as course_title,
        d.degree_code,
        d.degree_name,
        cpm.created_at,
        cpm.updated_at
      FROM clo_plo_mapping cpm
      INNER JOIN course_learning_outcomes clo ON cpm.clo_id = clo.id
      INNER JOIN program_learning_outcomes plo ON cpm.plo_id = plo.id
      INNER JOIN courses c ON clo.course_id = c.id
      INNER JOIN degrees d ON plo.degree_id = d.id
      ${whereClause}
      ORDER BY c.course_code, clo.clo_code, plo.plo_code`,
      params
    );

    res.json({
      success: true,
      data: mappings,
      count: mappings.length
    });
  })
);

/**
 * @route   GET /api/v1/clo-plo-mappings/:id
 * @desc    Get CLO-PLO mapping by ID
 * @access  Protected
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [[mapping]] = await db.query(
      `SELECT 
        cpm.id,
        cpm.clo_id,
        clo.clo_code,
        clo.description as clo_description,
        cpm.plo_id,
        plo.plo_code,
        plo.description as plo_description,
        cpm.mapping_strength,
        CASE 
          WHEN cpm.mapping_strength = 1 THEN 'Low'
          WHEN cpm.mapping_strength = 2 THEN 'Medium'
          WHEN cpm.mapping_strength = 3 THEN 'High'
          ELSE 'Unknown'
        END as strength_label,
        c.course_code,
        c.course_title as course_title,
        d.degree_code,
        d.degree_name,
        cpm.created_at,
        cpm.updated_at
      FROM clo_plo_mapping cpm
      INNER JOIN course_learning_outcomes clo ON cpm.clo_id = clo.id
      INNER JOIN program_learning_outcomes plo ON cpm.plo_id = plo.id
      INNER JOIN courses c ON clo.course_id = c.id
      INNER JOIN degrees d ON plo.degree_id = d.id
      WHERE cpm.id = ?`,
      [id]
    );

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'CLO-PLO mapping not found'
      });
    }

    res.json({
      success: true,
      data: mapping
    });
  })
);

/**
 * @route   POST /api/v1/clo-plo-mappings
 * @desc    Create new CLO-PLO mapping
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  [
    body('clo_id').isInt().withMessage('CLO ID must be an integer'),
    body('plo_id').isInt().withMessage('PLO ID must be an integer'),
    body('mapping_strength')
      .isInt({ min: 1, max: 3 })
      .withMessage('Mapping strength must be 1 (Low), 2 (Medium), or 3 (High)')
  ],
  asyncHandler(async (req, res) => {
    const { clo_id, plo_id, mapping_strength } = req.body;

    // Verify CLO exists
    const [[clo]] = await db.query(
      'SELECT id, course_id FROM course_learning_outcomes WHERE id = ? AND deleted_at IS NULL',
      [clo_id]
    );

    if (!clo) {
      return res.status(404).json({
        success: false,
        message: 'CLO not found'
      });
    }

    // Verify PLO exists and get degree
    const [[plo]] = await db.query(
      'SELECT id, degree_id FROM program_learning_outcomes WHERE id = ? AND deleted_at IS NULL',
      [plo_id]
    );

    if (!plo) {
      return res.status(404).json({
        success: false,
        message: 'PLO not found'
      });
    }

    // Verify that the CLO's course belongs to the PLO's degree
    const [[course]] = await db.query(
      'SELECT degree_id FROM courses WHERE id = ?',
      [clo.course_id]
    );

    if (course.degree_id !== plo.degree_id) {
      return res.status(400).json({
        success: false,
        message: 'CLO and PLO must belong to the same degree program'
      });
    }

    // Check if mapping already exists
    const [[existing]] = await db.query(
      'SELECT id FROM clo_plo_mapping WHERE clo_id = ? AND plo_id = ?',
      [clo_id, plo_id]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This CLO-PLO mapping already exists'
      });
    }

    // Create mapping
    const [result] = await db.query(
      'INSERT INTO clo_plo_mapping (clo_id, plo_id, mapping_strength) VALUES (?, ?, ?)',
      [clo_id, plo_id, mapping_strength]
    );

    const [[newMapping]] = await db.query(
      `SELECT 
        cpm.id,
        cpm.clo_id,
        clo.clo_code,
        cpm.plo_id,
        plo.plo_code,
        cpm.mapping_strength,
        CASE 
          WHEN cpm.mapping_strength = 1 THEN 'Low'
          WHEN cpm.mapping_strength = 2 THEN 'Medium'
          WHEN cpm.mapping_strength = 3 THEN 'High'
        END as strength_label
      FROM clo_plo_mapping cpm
      INNER JOIN course_learning_outcomes clo ON cpm.clo_id = clo.id
      INNER JOIN program_learning_outcomes plo ON cpm.plo_id = plo.id
      WHERE cpm.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'CLO-PLO mapping created successfully',
      data: newMapping
    });
  })
);

/**
 * @route   PUT /api/v1/clo-plo-mappings/:id
 * @desc    Update CLO-PLO mapping strength
 * @access  Protected (Teacher, HOD, Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  [
    param('id').isInt().withMessage('Invalid mapping ID'),
    body('mapping_strength')
      .isInt({ min: 1, max: 3 })
      .withMessage('Mapping strength must be 1 (Low), 2 (Medium), or 3 (High)')
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { mapping_strength } = req.body;

    const [[mapping]] = await db.query(
      'SELECT id FROM clo_plo_mapping WHERE id = ?',
      [id]
    );

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'CLO-PLO mapping not found'
      });
    }

    await db.query(
      'UPDATE clo_plo_mapping SET mapping_strength = ?, updated_at = NOW() WHERE id = ?',
      [mapping_strength, id]
    );

    const [[updated]] = await db.query(
      `SELECT 
        cpm.id,
        cpm.clo_id,
        clo.clo_code,
        cpm.plo_id,
        plo.plo_code,
        cpm.mapping_strength,
        CASE 
          WHEN cpm.mapping_strength = 1 THEN 'Low'
          WHEN cpm.mapping_strength = 2 THEN 'Medium'
          WHEN cpm.mapping_strength = 3 THEN 'High'
        END as strength_label
      FROM clo_plo_mapping cpm
      INNER JOIN course_learning_outcomes clo ON cpm.clo_id = clo.id
      INNER JOIN program_learning_outcomes plo ON cpm.plo_id = plo.id
      WHERE cpm.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'CLO-PLO mapping updated successfully',
      data: updated
    });
  })
);

/**
 * @route   DELETE /api/v1/clo-plo-mappings/:id
 * @desc    Delete CLO-PLO mapping
 * @access  Protected (Teacher, HOD, Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [[mapping]] = await db.query(
      'SELECT id FROM clo_plo_mapping WHERE id = ?',
      [id]
    );

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'CLO-PLO mapping not found'
      });
    }

    await db.query('DELETE FROM clo_plo_mapping WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'CLO-PLO mapping deleted successfully'
    });
  })
);

/**
 * @route   GET /api/v1/clo-plo-mappings/matrix/:courseId
 * @desc    Get CLO-PLO mapping matrix for a course
 * @access  Protected
 */
router.get(
  '/matrix/:courseId',
  authenticate,
  asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    // Get course and verify it exists
    const [[course]] = await db.query(
      'SELECT id, degree_id, course_code, title FROM courses WHERE id = ?',
      [courseId]
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get all CLOs for this course
    const [clos] = await db.query(
      `SELECT id, clo_code, description 
       FROM course_learning_outcomes 
       WHERE course_id = ? AND deleted_at IS NULL 
       ORDER BY clo_code`,
      [courseId]
    );

    // Get all PLOs for the degree
    const [plos] = await db.query(
      `SELECT id, plo_code, description 
       FROM program_learning_outcomes 
       WHERE degree_id = ? AND deleted_at IS NULL 
       ORDER BY plo_code`,
      [course.degree_id]
    );

    // Get all mappings for this course's CLOs
    const [mappings] = await db.query(
      `SELECT cpm.clo_id, cpm.plo_id, cpm.mapping_strength
       FROM clo_plo_mapping cpm
       INNER JOIN course_learning_outcomes clo ON cpm.clo_id = clo.id
       WHERE clo.course_id = ?`,
      [courseId]
    );

    // Build matrix
    const matrix = {};
    clos.forEach(clo => {
      matrix[clo.id] = {};
      plos.forEach(plo => {
        matrix[clo.id][plo.id] = null;
      });
    });

    // Fill in mappings
    mappings.forEach(mapping => {
      if (matrix[mapping.clo_id]) {
        matrix[mapping.clo_id][mapping.plo_id] = mapping.mapping_strength;
      }
    });

    res.json({
      success: true,
      data: {
        course: {
          id: course.id,
          code: course.course_code,
          title: course.title
        },
        clos,
        plos,
        matrix
      }
    });
  })
);

/**
 * @route   POST /api/v1/clo-plo-mappings/bulk
 * @desc    Bulk create/update CLO-PLO mappings
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/bulk',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  [
    body('mappings').isArray().withMessage('Mappings must be an array'),
    body('mappings.*.clo_id').isInt().withMessage('CLO ID must be an integer'),
    body('mappings.*.plo_id').isInt().withMessage('PLO ID must be an integer'),
    body('mappings.*.mapping_strength')
      .isInt({ min: 1, max: 3 })
      .withMessage('Mapping strength must be 1, 2, or 3')
  ],
  asyncHandler(async (req, res) => {
    const { mappings } = req.body;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const results = [];

      for (const mapping of mappings) {
        const { clo_id, plo_id, mapping_strength } = mapping;

        // Check if mapping exists
        const [[existing]] = await connection.query(
          'SELECT id FROM clo_plo_mapping WHERE clo_id = ? AND plo_id = ?',
          [clo_id, plo_id]
        );

        if (existing) {
          // Update
          await connection.query(
            'UPDATE clo_plo_mapping SET mapping_strength = ?, updated_at = NOW() WHERE id = ?',
            [mapping_strength, existing.id]
          );
          results.push({ clo_id, plo_id, action: 'updated' });
        } else {
          // Insert
          await connection.query(
            'INSERT INTO clo_plo_mapping (clo_id, plo_id, mapping_strength) VALUES (?, ?, ?)',
            [clo_id, plo_id, mapping_strength]
          );
          results.push({ clo_id, plo_id, action: 'created' });
        }
      }

      await connection.commit();

      res.json({
        success: true,
        message: `${results.length} CLO-PLO mappings processed successfully`,
        data: results
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  })
);

module.exports = router;
