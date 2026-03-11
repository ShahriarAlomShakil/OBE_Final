const BaseService = require('./BaseService');
const AssessmentComponent = require('../models/AssessmentComponent');
const Joi = require('joi');
const { ValidationError, NotFoundError } = require('../utils/AppError');
const db = require('../config/database');

/**
 * Assessment Service
 * Business logic for Assessment Components
 */
class AssessmentService extends BaseService {
  constructor() {
    super(AssessmentComponent, 'Assessment Component');
  }

  /**
   * Validation schema for creating an assessment component
   */
  getCreateSchema() {
    return Joi.object({
      course_offering_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Course offering ID must be a number',
          'number.positive': 'Course offering ID must be positive',
          'any.required': 'Course offering ID is required'
        }),
      assessment_type_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Assessment type ID must be a number',
          'number.positive': 'Assessment type ID must be positive',
          'any.required': 'Assessment type ID is required'
        }),
      name: Joi.string().min(3).max(255).required()
        .messages({
          'string.min': 'Assessment name must be at least 3 characters',
          'string.max': 'Assessment name must not exceed 255 characters',
          'any.required': 'Assessment name is required'
        }),
      total_marks: Joi.number().positive().precision(2).required()
        .messages({
          'number.base': 'Total marks must be a number',
          'number.positive': 'Total marks must be positive',
          'any.required': 'Total marks is required'
        }),
      weight_percentage: Joi.number().min(0).max(100).precision(2).required()
        .messages({
          'number.base': 'Weight percentage must be a number',
          'number.min': 'Weight percentage must be at least 0',
          'number.max': 'Weight percentage must not exceed 100',
          'any.required': 'Weight percentage is required'
        }),
      scheduled_date: Joi.date().iso().allow(null).optional()
        .messages({
          'date.base': 'Scheduled date must be a valid date',
          'date.format': 'Scheduled date must be in ISO format (YYYY-MM-DD)'
        }),
      duration_minutes: Joi.number().integer().positive().allow(null).optional()
        .messages({
          'number.base': 'Duration must be a number',
          'number.positive': 'Duration must be positive'
        }),
      instructions: Joi.string().max(5000).allow(null, '').optional()
        .messages({
          'string.max': 'Instructions must not exceed 5000 characters'
        }),
      is_published: Joi.boolean().default(false).optional()
    });
  }

  /**
   * Validation schema for updating an assessment component
   */
  getUpdateSchema() {
    return Joi.object({
      assessment_type_id: Joi.number().integer().positive().optional()
        .messages({
          'number.base': 'Assessment type ID must be a number',
          'number.positive': 'Assessment type ID must be positive'
        }),
      name: Joi.string().min(3).max(255).optional()
        .messages({
          'string.min': 'Assessment name must be at least 3 characters',
          'string.max': 'Assessment name must not exceed 255 characters'
        }),
      total_marks: Joi.number().positive().precision(2).optional()
        .messages({
          'number.base': 'Total marks must be a number',
          'number.positive': 'Total marks must be positive'
        }),
      weight_percentage: Joi.number().min(0).max(100).precision(2).optional()
        .messages({
          'number.base': 'Weight percentage must be a number',
          'number.min': 'Weight percentage must be at least 0',
          'number.max': 'Weight percentage must not exceed 100'
        }),
      scheduled_date: Joi.date().iso().allow(null).optional()
        .messages({
          'date.base': 'Scheduled date must be a valid date',
          'date.format': 'Scheduled date must be in ISO format (YYYY-MM-DD)'
        }),
      duration_minutes: Joi.number().integer().positive().allow(null).optional()
        .messages({
          'number.base': 'Duration must be a number',
          'number.positive': 'Duration must be positive'
        }),
      instructions: Joi.string().max(5000).allow(null, '').optional()
        .messages({
          'string.max': 'Instructions must not exceed 5000 characters'
        }),
      is_published: Joi.boolean().optional()
    }).min(1);
  }

  /**
   * Validation schema for CLO mapping
   */
  getCLOMappingSchema() {
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
        }),
      weightage: Joi.number().min(0).max(100).precision(2).optional()
        .messages({
          'number.base': 'Weightage must be a number',
          'number.min': 'Weightage must be at least 0',
          'number.max': 'Weightage must not exceed 100'
        })
    });
  }

  /**
   * Validation schema for bulk student marks entry
   */
  getBulkMarksSchema() {
    return Joi.object({
      marks: Joi.array().items(
        Joi.object({
          student_id: Joi.number().integer().positive().required()
            .messages({
              'number.base': 'Student ID must be a number',
              'number.positive': 'Student ID must be positive',
              'any.required': 'Student ID is required'
            }),
          obtained_marks: Joi.number().min(0).precision(2).required()
            .messages({
              'number.base': 'Obtained marks must be a number',
              'number.min': 'Obtained marks must be at least 0',
              'any.required': 'Obtained marks is required'
            }),
          remarks: Joi.string().max(500).allow(null, '').optional()
            .messages({
              'string.max': 'Remarks must not exceed 500 characters'
            }),
          submitted_at: Joi.date().iso().allow(null).optional(),
          evaluated_at: Joi.date().iso().allow(null).optional()
        })
      ).min(1).required()
        .messages({
          'array.min': 'At least one student mark entry is required',
          'any.required': 'Marks array is required'
        })
    });
  }

  /**
   * Lifecycle hook: Before creating an assessment component
   */
  async beforeCreate(data) {
    // Validate course offering exists
    await this.model.validateCourseOfferingExists(data.course_offering_id);

    // Validate assessment type exists
    await this.model.validateAssessmentTypeExists(data.assessment_type_id);

    // Validate total weight percentage for course offering doesn't exceed 100%
    await this.validateTotalWeightage(data.course_offering_id, data.weight_percentage);

    return data;
  }

  /**
   * Lifecycle hook: Before updating an assessment component
   */
  async beforeUpdate(id, data) {
    // Validate assessment type if provided
    if (data.assessment_type_id) {
      await this.model.validateAssessmentTypeExists(data.assessment_type_id);
    }

    // Validate weight percentage if being updated
    if (data.weight_percentage !== undefined) {
      const assessment = await this.model.findById(id);
      if (!assessment) {
        throw new NotFoundError('Assessment component not found');
      }
      await this.validateTotalWeightage(
        assessment.course_offering_id, 
        data.weight_percentage, 
        id
      );
    }

    return data;
  }

  /**
   * Validate that total weightage for a course offering doesn't exceed 100%
   */
  async validateTotalWeightage(courseOfferingId, newWeightage, excludeAssessmentId = null) {
    let query = `
      SELECT SUM(weight_percentage) as total_weight
      FROM assessment_components
      WHERE course_offering_id = ?
        AND deleted_at IS NULL
    `;
    const params = [courseOfferingId];

    if (excludeAssessmentId) {
      query += ' AND id != ?';
      params.push(excludeAssessmentId);
    }

    const [rows] = await db.query(query, params);
    const currentTotal = parseFloat(rows[0]?.total_weight || 0);
    const newTotal = currentTotal + parseFloat(newWeightage);

    if (newTotal > 100) {
      throw new ValidationError(
        `Total weight percentage (${newTotal.toFixed(2)}%) would exceed 100%. ` +
        `Current total: ${currentTotal.toFixed(2)}%, New: ${newWeightage}%`
      );
    }

    return true;
  }

  /**
   * Get assessment with all relationships
   */
  async getWithRelations(id) {
    return await this.model.findByIdWithRelations(id);
  }

  /**
   * Get all assessments for a course offering
   */
  async getByCourseOffering(courseOfferingId) {
    return await this.model.findByCourseOffering(courseOfferingId);
  }

  /**
   * Get CLO mappings for an assessment
   */
  async getCLOMappings(id) {
    await this.ensureExists(id);
    return await this.model.getCLOMappings(id);
  }

  /**
   * Get questions for an assessment
   */
  async getQuestions(id) {
    await this.ensureExists(id);
    return await this.model.getQuestions(id);
  }

  /**
   * Get student marks for an assessment
   */
  async getStudentMarks(id) {
    await this.ensureExists(id);
    return await this.model.getStudentMarks(id);
  }

  /**
   * Get detailed marks for a specific student
   */
  async getStudentDetailedMarks(assessmentId, studentId) {
    await this.ensureExists(assessmentId);
    const marks = await this.model.getStudentDetailedMarks(assessmentId, studentId);
    if (!marks) {
      throw new NotFoundError('Student marks not found for this assessment');
    }
    return marks;
  }

  /**
   * Map a CLO to an assessment
   */
  async mapCLO(assessmentId, cloData) {
    // Validate input
    const { error } = this.getCLOMappingSchema().validate(cloData);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    // Ensure assessment exists
    await this.ensureExists(assessmentId);

    // Check if CLO exists and belongs to the same course
    const [cloRows] = await db.query(
      `SELECT clo.id, clo.course_id, co.course_id as offering_course_id
       FROM course_learning_outcomes clo
       INNER JOIN assessment_components ac ON ac.id = ?
       INNER JOIN course_offerings co ON ac.course_offering_id = co.id
       WHERE clo.id = ? AND clo.deleted_at IS NULL`,
      [assessmentId, cloData.clo_id]
    );

    if (cloRows.length === 0) {
      throw new NotFoundError('CLO not found');
    }

    if (cloRows[0].course_id !== cloRows[0].offering_course_id) {
      throw new ValidationError('CLO does not belong to the same course as this assessment');
    }

    // Check if mapping already exists
    const [existingMapping] = await db.query(
      `SELECT id FROM assessment_clo_mapping 
       WHERE assessment_component_id = ? AND clo_id = ?`,
      [assessmentId, cloData.clo_id]
    );

    if (existingMapping.length > 0) {
      throw new ValidationError('CLO is already mapped to this assessment');
    }

    // Create mapping
    const [result] = await db.query(
      `INSERT INTO assessment_clo_mapping 
       (assessment_component_id, clo_id, marks_allocated, weightage, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [
        assessmentId,
        cloData.clo_id,
        cloData.marks_allocated,
        cloData.weightage || null
      ]
    );

    return {
      id: result.insertId,
      assessment_component_id: assessmentId,
      ...cloData
    };
  }

  /**
   * Remove CLO mapping from an assessment
   */
  async unmapCLO(assessmentId, cloId) {
    await this.ensureExists(assessmentId);

    const [result] = await db.query(
      `DELETE FROM assessment_clo_mapping 
       WHERE assessment_component_id = ? AND clo_id = ?`,
      [assessmentId, cloId]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundError('CLO mapping not found');
    }

    return { message: 'CLO mapping removed successfully' };
  }

  /**
   * Bulk entry of student marks
   */
  async bulkEnterMarks(assessmentId, marksData) {
    // Validate input
    const { error } = this.getBulkMarksSchema().validate(marksData);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    // Ensure assessment exists
    const assessment = await this.model.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundError('Assessment component not found');
    }

    const totalMarks = parseFloat(assessment.total_marks);
    const results = [];
    const errors = [];

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      for (const mark of marksData.marks) {
        try {
          // Validate obtained marks doesn't exceed total marks
          if (parseFloat(mark.obtained_marks) > totalMarks) {
            throw new ValidationError(
              `Obtained marks (${mark.obtained_marks}) cannot exceed total marks (${totalMarks})`
            );
          }

          // Calculate percentage and grade
          const percentage = (parseFloat(mark.obtained_marks) / totalMarks) * 100;
          const grade = this.calculateGrade(percentage);

          // Check if marks already exist
          const [existing] = await connection.query(
            `SELECT id FROM student_assessment_marks 
             WHERE assessment_component_id = ? AND student_id = ?`,
            [assessmentId, mark.student_id]
          );

          let result;
          if (existing.length > 0) {
            // Update existing marks
            await connection.query(
              `UPDATE student_assessment_marks 
               SET obtained_marks = ?, percentage = ?, grade = ?, 
                   remarks = ?, submitted_at = ?, evaluated_at = ?, updated_at = NOW()
               WHERE id = ?`,
              [
                mark.obtained_marks,
                percentage,
                grade,
                mark.remarks || null,
                mark.submitted_at || null,
                mark.evaluated_at || NOW(),
                existing[0].id
              ]
            );
            result = { id: existing[0].id, updated: true };
          } else {
            // Insert new marks
            const [insertResult] = await connection.query(
              `INSERT INTO student_assessment_marks 
               (assessment_component_id, student_id, obtained_marks, percentage, grade, 
                remarks, submitted_at, evaluated_at, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                assessmentId,
                mark.student_id,
                mark.obtained_marks,
                percentage,
                grade,
                mark.remarks || null,
                mark.submitted_at || null,
                mark.evaluated_at || NOW()
              ]
            );
            result = { id: insertResult.insertId, updated: false };
          }

          results.push({
            student_id: mark.student_id,
            ...result,
            obtained_marks: mark.obtained_marks,
            percentage: percentage.toFixed(2),
            grade
          });
        } catch (error) {
          errors.push({
            student_id: mark.student_id,
            error: error.message
          });
        }
      }

      await connection.commit();
      connection.release();

      return {
        success: results,
        errors,
        summary: {
          total: marksData.marks.length,
          successful: results.length,
          failed: errors.length
        }
      };
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  /**
   * Calculate grade based on percentage
   */
  calculateGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    if (percentage >= 45) return 'D+';
    if (percentage >= 40) return 'D';
    return 'F';
  }

  /**
   * Get assessment statistics
   */
  async getStatistics(assessmentId) {
    await this.ensureExists(assessmentId);
    return await this.model.getStatistics(assessmentId);
  }

  /**
   * Get CLO-wise performance for an assessment
   */
  async getCLOPerformance(assessmentId) {
    await this.ensureExists(assessmentId);
    return await this.model.getCLOPerformance(assessmentId);
  }

  /**
   * Publish assessment results
   */
  async publishResults(assessmentId) {
    await this.ensureExists(assessmentId);
    
    const [result] = await db.query(
      `UPDATE assessment_components 
       SET is_published = TRUE, updated_at = NOW()
       WHERE id = ?`,
      [assessmentId]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundError('Assessment component not found');
    }

    return { message: 'Assessment results published successfully' };
  }

  /**
   * Unpublish assessment results
   */
  async unpublishResults(assessmentId) {
    await this.ensureExists(assessmentId);
    
    const [result] = await db.query(
      `UPDATE assessment_components 
       SET is_published = FALSE, updated_at = NOW()
       WHERE id = ?`,
      [assessmentId]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundError('Assessment component not found');
    }

    return { message: 'Assessment results unpublished successfully' };
  }

  /**
   * Helper method to ensure assessment exists
   */
  async ensureExists(id) {
    const assessment = await this.model.findById(id);
    if (!assessment) {
      throw new NotFoundError('Assessment component not found');
    }
    return assessment;
  }
}

module.exports = new AssessmentService();
