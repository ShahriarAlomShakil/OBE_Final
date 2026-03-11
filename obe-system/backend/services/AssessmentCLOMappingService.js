const BaseService = require('./BaseService');
const Joi = require('joi');
const { ValidationError, NotFoundError } = require('../utils/AppError');
const db = require('../config/database');

/**
 * Assessment-CLO Mapping Service
 * Manages the mapping between assessment components and Course Learning Outcomes (CLOs)
 * Tracks how many marks from each assessment contribute to each CLO
 */
class AssessmentCLOMappingService extends BaseService {
  constructor() {
    // Using database connection directly since we don't have a model yet
    super({ findById: () => {} }, 'Assessment-CLO Mapping');
  }

  /**
   * Validation schema for mapping CLOs to assessment
   */
  getMappingSchema() {
    return Joi.object({
      clo_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'CLO ID must be a number',
          'number.positive': 'CLO ID must be positive',
          'any.required': 'CLO ID is required'
        }),
      marks_allocated: Joi.number().positive().precision(2).required()
        .messages({
          'number.base': 'Marks allocated must be a number',
          'number.positive': 'Marks allocated must be positive',
          'any.required': 'Marks allocated is required'
        })
    });
  }

  /**
   * Validation schema for bulk mapping
   */
  getBulkMappingSchema() {
    return Joi.object({
      assessment_component_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Assessment component ID must be a number',
          'number.positive': 'Assessment component ID must be positive',
          'any.required': 'Assessment component ID is required'
        }),
      mappings: Joi.array().items(this.getMappingSchema()).min(1).required()
        .messages({
          'array.min': 'At least one CLO mapping is required',
          'any.required': 'Mappings array is required'
        })
    });
  }

  /**
   * Validation schema for updating marks allocated
   */
  getUpdateMarksSchema() {
    return Joi.object({
      marks_allocated: Joi.number().positive().precision(2).required()
        .messages({
          'number.base': 'Marks allocated must be a number',
          'number.positive': 'Marks allocated must be positive',
          'any.required': 'Marks allocated is required'
        })
    });
  }

  /**
   * Map multiple CLOs to an assessment component with marks allocation
   * @param {number} assessmentComponentId - Assessment component ID
   * @param {Array} mappings - Array of {clo_id, marks_allocated}
   * @returns {Promise<Object>} Created mappings and summary
   */
  async mapCLOsToAssessment(assessmentComponentId, mappings) {
    // Validate input
    const { error, value } = this.getBulkMappingSchema().validate({
      assessment_component_id: assessmentComponentId,
      mappings
    });

    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Verify assessment component exists
      const [assessmentRows] = await connection.query(
        'SELECT id, total_marks FROM assessment_components WHERE id = ? AND deleted_at IS NULL',
        [assessmentComponentId]
      );

      if (assessmentRows.length === 0) {
        throw new NotFoundError('Assessment component not found');
      }

      const totalAssessmentMarks = assessmentRows[0].total_marks;

      // Calculate total marks being allocated
      const totalAllocatedMarks = mappings.reduce((sum, m) => sum + m.marks_allocated, 0);

      // Validate that allocated marks don't exceed assessment total marks
      if (totalAllocatedMarks > totalAssessmentMarks) {
        throw new ValidationError(
          `Total allocated marks (${totalAllocatedMarks}) exceeds assessment total marks (${totalAssessmentMarks})`
        );
      }

      // Check for duplicate CLO mappings
      const cloIds = mappings.map(m => m.clo_id);
      const uniqueCloIds = new Set(cloIds);
      if (cloIds.length !== uniqueCloIds.size) {
        throw new ValidationError('Duplicate CLO mappings detected');
      }

      // Verify all CLOs exist
      const cloIdsList = cloIds.join(',');
      const [cloRows] = await connection.query(
        `SELECT id FROM course_learning_outcomes WHERE id IN (${cloIdsList}) AND deleted_at IS NULL`
      );

      if (cloRows.length !== cloIds.length) {
        throw new NotFoundError('One or more CLOs not found');
      }

      // Delete existing mappings for this assessment (if any)
      await connection.query(
        'DELETE FROM assessment_clo_mapping WHERE assessment_component_id = ?',
        [assessmentComponentId]
      );

      // Insert new mappings
      const insertPromises = mappings.map(mapping => {
        return connection.query(
          `INSERT INTO assessment_clo_mapping 
           (assessment_component_id, clo_id, marks_allocated, created_at, updated_at)
           VALUES (?, ?, ?, NOW(), NOW())`,
          [assessmentComponentId, mapping.clo_id, mapping.marks_allocated]
        );
      });

      await Promise.all(insertPromises);

      // Fetch created mappings with CLO details
      const [createdMappings] = await connection.query(
        `SELECT 
          acm.id,
          acm.assessment_component_id,
          acm.clo_id,
          acm.marks_allocated,
          clo.clo_code,
          clo.description as clo_description,
          acm.created_at,
          acm.updated_at
         FROM assessment_clo_mapping acm
         INNER JOIN course_learning_outcomes clo ON acm.clo_id = clo.id
         WHERE acm.assessment_component_id = ?
         ORDER BY clo.clo_code`,
        [assessmentComponentId]
      );

      await connection.commit();

      return {
        assessment_component_id: assessmentComponentId,
        total_assessment_marks: totalAssessmentMarks,
        total_allocated_marks: totalAllocatedMarks,
        allocation_percentage: ((totalAllocatedMarks / totalAssessmentMarks) * 100).toFixed(2),
        mappings: createdMappings,
        count: createdMappings.length
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all CLO mappings for an assessment component
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<Object>} CLO mappings with details
   */
  async getAssessmentCLOs(assessmentComponentId) {
    const connection = await db.getConnection();
    
    try {
      // Verify assessment component exists
      const [assessmentRows] = await connection.query(
        'SELECT id, name, total_marks FROM assessment_components WHERE id = ? AND deleted_at IS NULL',
        [assessmentComponentId]
      );

      if (assessmentRows.length === 0) {
        throw new NotFoundError('Assessment component not found');
      }

      const assessment = assessmentRows[0];

      // Fetch mappings with CLO details
      const [mappings] = await connection.query(
        `SELECT 
          acm.id,
          acm.assessment_component_id,
          acm.clo_id,
          acm.marks_allocated,
          clo.clo_code,
          clo.description as clo_description,
          clo.bloom_taxonomy_level_id,
          btl.level_name as bloom_level,
          btl.level_number,
          acm.created_at,
          acm.updated_at
         FROM assessment_clo_mapping acm
         INNER JOIN course_learning_outcomes clo ON acm.clo_id = clo.id
         LEFT JOIN bloom_taxonomy_levels btl ON clo.bloom_taxonomy_level_id = btl.id
         WHERE acm.assessment_component_id = ?
         ORDER BY clo.clo_code`,
        [assessmentComponentId]
      );

      // Calculate summary statistics
      const totalAllocatedMarks = mappings.reduce((sum, m) => sum + parseFloat(m.marks_allocated), 0);
      const allocationPercentage = assessment.total_marks > 0 
        ? ((totalAllocatedMarks / assessment.total_marks) * 100).toFixed(2)
        : 0;

      return {
        assessment: {
          id: assessment.id,
          name: assessment.name,
          total_marks: assessment.total_marks
        },
        summary: {
          total_allocated_marks: totalAllocatedMarks,
          unallocated_marks: assessment.total_marks - totalAllocatedMarks,
          allocation_percentage: allocationPercentage,
          clo_count: mappings.length
        },
        mappings: mappings
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Update marks allocated for a specific mapping
   * @param {number} id - Mapping ID
   * @param {number} marksAllocated - New marks allocation
   * @returns {Promise<Object>} Updated mapping
   */
  async updateMapping(id, marksAllocated) {
    // Validate input
    const { error } = this.getUpdateMarksSchema().validate({ marks_allocated: marksAllocated });

    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Fetch existing mapping
      const [existingRows] = await connection.query(
        'SELECT * FROM assessment_clo_mapping WHERE id = ?',
        [id]
      );

      if (existingRows.length === 0) {
        throw new NotFoundError('Assessment-CLO mapping not found');
      }

      const existingMapping = existingRows[0];

      // Get assessment total marks
      const [assessmentRows] = await connection.query(
        'SELECT total_marks FROM assessment_components WHERE id = ? AND deleted_at IS NULL',
        [existingMapping.assessment_component_id]
      );

      if (assessmentRows.length === 0) {
        throw new NotFoundError('Assessment component not found');
      }

      const totalAssessmentMarks = assessmentRows[0].total_marks;

      // Get current total allocated marks (excluding this mapping)
      const [sumRows] = await connection.query(
        `SELECT COALESCE(SUM(marks_allocated), 0) as total_allocated 
         FROM assessment_clo_mapping 
         WHERE assessment_component_id = ? AND id != ?`,
        [existingMapping.assessment_component_id, id]
      );

      const otherAllocatedMarks = parseFloat(sumRows[0].total_allocated);
      const newTotalAllocated = otherAllocatedMarks + marksAllocated;

      // Validate that new total doesn't exceed assessment total marks
      if (newTotalAllocated > totalAssessmentMarks) {
        throw new ValidationError(
          `Total allocated marks (${newTotalAllocated}) would exceed assessment total marks (${totalAssessmentMarks})`
        );
      }

      // Update the mapping
      await connection.query(
        `UPDATE assessment_clo_mapping 
         SET marks_allocated = ?, updated_at = NOW()
         WHERE id = ?`,
        [marksAllocated, id]
      );

      // Fetch updated mapping with CLO details
      const [updatedRows] = await connection.query(
        `SELECT 
          acm.id,
          acm.assessment_component_id,
          acm.clo_id,
          acm.marks_allocated,
          clo.clo_code,
          clo.description as clo_description,
          acm.created_at,
          acm.updated_at
         FROM assessment_clo_mapping acm
         INNER JOIN course_learning_outcomes clo ON acm.clo_id = clo.id
         WHERE acm.id = ?`,
        [id]
      );

      await connection.commit();

      return updatedRows[0];

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete a CLO mapping from an assessment
   * @param {number} id - Mapping ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteMapping(id) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Verify mapping exists
      const [existingRows] = await connection.query(
        'SELECT id FROM assessment_clo_mapping WHERE id = ?',
        [id]
      );

      if (existingRows.length === 0) {
        throw new NotFoundError('Assessment-CLO mapping not found');
      }

      // Delete the mapping
      await connection.query(
        'DELETE FROM assessment_clo_mapping WHERE id = ?',
        [id]
      );

      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all assessments mapped to a specific CLO
   * @param {number} cloId - CLO ID
   * @returns {Promise<Array>} Assessments using this CLO
   */
  async getCLOAssessments(cloId) {
    const connection = await db.getConnection();
    
    try {
      // Verify CLO exists
      const [cloRows] = await connection.query(
        'SELECT id, clo_code, description FROM course_learning_outcomes WHERE id = ? AND deleted_at IS NULL',
        [cloId]
      );

      if (cloRows.length === 0) {
        throw new NotFoundError('CLO not found');
      }

      const clo = cloRows[0];

      // Fetch all assessments mapped to this CLO
      const [mappings] = await connection.query(
        `SELECT 
          acm.id as mapping_id,
          acm.marks_allocated,
          ac.id as assessment_id,
          ac.name as assessment_name,
          ac.total_marks as assessment_total_marks,
          at.type_name as assessment_type,
          ac.scheduled_date,
          co.id as course_offering_id,
          c.course_code,
          c.course_name
         FROM assessment_clo_mapping acm
         INNER JOIN assessment_components ac ON acm.assessment_component_id = ac.id
         INNER JOIN assessment_types at ON ac.assessment_type_id = at.id
         INNER JOIN course_offerings co ON ac.course_offering_id = co.id
         INNER JOIN courses c ON co.course_id = c.id
         WHERE acm.clo_id = ? AND ac.deleted_at IS NULL
         ORDER BY ac.scheduled_date DESC, ac.name`,
        [cloId]
      );

      return {
        clo: clo,
        assessments: mappings,
        count: mappings.length
      };

    } finally {
      connection.release();
    }
  }
}

module.exports = AssessmentCLOMappingService;
