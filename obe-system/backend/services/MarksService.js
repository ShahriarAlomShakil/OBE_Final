const BaseService = require('./BaseService');
const StudentMark = require('../models/StudentMark');
const StudentQuestionMark = require('../models/StudentQuestionMark');
const AssessmentComponent = require('../models/AssessmentComponent');
const Question = require('../models/Question');
const Student = require('../models/Student');
const Joi = require('joi');
const { ValidationError, NotFoundError, AppError } = require('../utils/AppError');
const db = require('../config/database');

/**
 * Marks Service
 * Business logic for Student Assessment Marks
 */
class MarksService extends BaseService {
  constructor() {
    super(StudentMark, 'Student Mark');
  }

  /**
   * Validation schema for entering marks
   */
  getEnterMarksSchema() {
    return Joi.object({
      assessment_component_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Assessment component ID must be a number',
          'number.positive': 'Assessment component ID must be positive',
          'any.required': 'Assessment component ID is required'
        }),
      student_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Student ID must be a number',
          'number.positive': 'Student ID must be positive',
          'any.required': 'Student ID is required'
        }),
      marks_obtained: Joi.number().min(0).precision(2).required()
        .messages({
          'number.base': 'Marks obtained must be a number',
          'number.min': 'Marks obtained cannot be negative',
          'any.required': 'Marks obtained is required'
        }),
      is_absent: Joi.boolean().default(false).optional(),
      remarks: Joi.string().max(1000).allow(null, '').optional()
        .messages({
          'string.max': 'Remarks must not exceed 1000 characters'
        }),
      entered_by: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Entered by (user ID) must be a number',
          'number.positive': 'Entered by (user ID) must be positive',
          'any.required': 'Entered by (user ID) is required'
        })
    });
  }

  /**
   * Validation schema for bulk marks entry
   */
  getBulkEnterMarksSchema() {
    return Joi.object({
      assessment_component_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Assessment component ID must be a number',
          'number.positive': 'Assessment component ID must be positive',
          'any.required': 'Assessment component ID is required'
        }),
      entered_by: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Entered by (user ID) must be a number',
          'number.positive': 'Entered by (user ID) must be positive',
          'any.required': 'Entered by (user ID) is required'
        }),
      marks_data: Joi.array().min(1).items(
        Joi.object({
          student_id: Joi.number().integer().positive().required(),
          marks_obtained: Joi.number().min(0).precision(2).required(),
          is_absent: Joi.boolean().default(false).optional(),
          remarks: Joi.string().max(1000).allow(null, '').optional()
        })
      ).required()
        .messages({
          'array.min': 'At least one student mark entry is required',
          'any.required': 'Marks data is required'
        })
    });
  }

  /**
   * Validation schema for updating marks
   */
  getUpdateMarksSchema() {
    return Joi.object({
      marks_obtained: Joi.number().min(0).precision(2).optional()
        .messages({
          'number.base': 'Marks obtained must be a number',
          'number.min': 'Marks obtained cannot be negative'
        }),
      is_absent: Joi.boolean().optional(),
      remarks: Joi.string().max(1000).allow(null, '').optional()
        .messages({
          'string.max': 'Remarks must not exceed 1000 characters'
        })
    });
  }

  /**
   * Enter marks for a single student
   * @param {Object} data - Marks data
   * @returns {Promise<Object>}
   */
  async enterMarks(data) {
    // Validate input
    const schema = this.getEnterMarksSchema();
    const { error, value } = schema.validate(data);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { assessment_component_id, student_id, marks_obtained, is_absent, remarks, entered_by } = value;

    // Check if assessment component exists
    const assessment = await AssessmentComponent.findById(assessment_component_id);
    if (!assessment) {
      throw new NotFoundError('Assessment component not found');
    }

    // Check if student exists
    const student = await Student.findById(student_id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Validate marks against assessment total
    if (!is_absent && marks_obtained > assessment.total_marks) {
      throw new ValidationError(
        `Marks obtained (${marks_obtained}) cannot exceed total marks (${assessment.total_marks})`
      );
    }

    // Check if marks already exist
    const existingMark = await StudentMark.findByStudentAndAssessment(student_id, assessment_component_id);
    if (existingMark) {
      throw new ValidationError(
        'Marks already exist for this student and assessment. Use update endpoint instead.'
      );
    }

    // If student is absent, set marks to 0
    const finalMarks = is_absent ? 0 : marks_obtained;

    // Insert marks
    const markData = {
      student_id,
      assessment_component_id,
      marks_obtained: finalMarks,
      marks_total: assessment.total_marks,
      is_absent: is_absent || false,
      remarks: remarks || null,
      entered_by,
      entered_at: new Date()
    };

    const markId = await StudentMark.create(markData);
    const createdMark = await StudentMark.findById(markId);

    return {
      success: true,
      message: 'Marks entered successfully',
      data: createdMark
    };
  }

  /**
   * Bulk enter marks for multiple students
   * @param {Object} data - Bulk marks data
   * @returns {Promise<Object>}
   */
  async bulkEnterMarks(data) {
    // Validate input
    const schema = this.getBulkEnterMarksSchema();
    const { error, value } = schema.validate(data);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { assessment_component_id, marks_data, entered_by } = value;

    // Check if assessment component exists
    const assessment = await AssessmentComponent.findById(assessment_component_id);
    if (!assessment) {
      throw new NotFoundError('Assessment component not found');
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const results = {
        success: [],
        failed: [],
        skipped: []
      };

      for (const markEntry of marks_data) {
        const { student_id, marks_obtained, is_absent, remarks } = markEntry;

        try {
          // Check if student exists
          const student = await Student.findById(student_id);
          if (!student) {
            results.failed.push({
              student_id,
              error: 'Student not found'
            });
            continue;
          }

          // Validate marks against assessment total
          if (!is_absent && marks_obtained > assessment.total_marks) {
            results.failed.push({
              student_id,
              error: `Marks (${marks_obtained}) exceed total marks (${assessment.total_marks})`
            });
            continue;
          }

          // Check if marks already exist
          const existingMark = await StudentMark.findByStudentAndAssessment(
            student_id,
            assessment_component_id
          );
          if (existingMark) {
            results.skipped.push({
              student_id,
              reason: 'Marks already exist'
            });
            continue;
          }

          // If student is absent, set marks to 0
          const finalMarks = is_absent ? 0 : marks_obtained;

          // Insert marks
          const markData = {
            student_id,
            assessment_component_id,
            marks_obtained: finalMarks,
            marks_total: assessment.total_marks,
            is_absent: is_absent || false,
            remarks: remarks || null,
            entered_by,
            entered_at: new Date()
          };

          const query = `
            INSERT INTO student_assessment_marks 
            (student_id, assessment_component_id, marks_obtained, marks_total, is_absent, remarks, entered_by, entered_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          const [result] = await connection.query(query, [
            markData.student_id,
            markData.assessment_component_id,
            markData.marks_obtained,
            markData.marks_total,
            markData.is_absent,
            markData.remarks,
            markData.entered_by,
            markData.entered_at
          ]);

          results.success.push({
            student_id,
            mark_id: result.insertId,
            marks_obtained: finalMarks
          });

        } catch (err) {
          results.failed.push({
            student_id,
            error: err.message
          });
        }
      }

      await connection.commit();
      connection.release();

      return {
        success: true,
        message: 'Bulk marks entry completed',
        data: {
          total: marks_data.length,
          successful: results.success.length,
          failed: results.failed.length,
          skipped: results.skipped.length,
          details: results
        }
      };

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw new AppError('Failed to enter marks in bulk: ' + error.message, 500);
    }
  }

  /**
   * Get all marks for an assessment component
   * @param {number} assessmentComponentId - Assessment component ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>}
   */
  async getMarksByAssessment(assessmentComponentId, options = {}) {
    // Check if assessment exists
    const assessment = await AssessmentComponent.findById(assessmentComponentId);
    if (!assessment) {
      throw new NotFoundError('Assessment component not found');
    }

    // Get all marks
    const marks = await StudentMark.getByAssessmentComponent(assessmentComponentId, options);

    // Get statistics
    const statistics = await StudentMark.getAssessmentStatistics(assessmentComponentId);
    const distribution = await StudentMark.getMarksDistribution(assessmentComponentId);

    return {
      success: true,
      data: {
        assessment: {
          id: assessment.id,
          name: assessment.name,
          total_marks: assessment.total_marks,
          weight_percentage: assessment.weight_percentage
        },
        marks,
        statistics,
        distribution
      }
    };
  }

  /**
   * Get all marks for a student in a course offering
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>}
   */
  async getMarksByStudent(studentId, courseOfferingId) {
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Get all marks for student in course offering
    const marks = await StudentMark.getByStudentAndCourseOffering(studentId, courseOfferingId);

    // Get summary
    const summary = await StudentMark.getStudentSummary(studentId, courseOfferingId);

    return {
      success: true,
      data: {
        student: {
          id: student.id,
          roll_number: student.roll_number,
          user_id: student.user_id
        },
        course_offering_id: courseOfferingId,
        marks,
        summary
      }
    };
  }

  /**
   * Update marks for a student
   * @param {number} markId - Mark ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  async updateMarks(markId, data) {
    // Validate input
    const schema = this.getUpdateMarksSchema();
    const { error, value } = schema.validate(data);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    // Check if mark exists
    const existingMark = await StudentMark.findById(markId);
    if (!existingMark) {
      throw new NotFoundError('Mark entry not found');
    }

    // If marks_obtained is being updated, validate against total
    if (value.marks_obtained !== undefined) {
      const assessment = await AssessmentComponent.findById(existingMark.assessment_component_id);
      if (value.marks_obtained > assessment.total_marks) {
        throw new ValidationError(
          `Marks obtained (${value.marks_obtained}) cannot exceed total marks (${assessment.total_marks})`
        );
      }

      // If marking as absent, set marks to 0
      if (value.is_absent) {
        value.marks_obtained = 0;
      }
    }

    // If marking as absent without updating marks, set marks to 0
    if (value.is_absent === true && value.marks_obtained === undefined) {
      value.marks_obtained = 0;
    }

    // Update marks
    await StudentMark.update(markId, value);
    const updatedMark = await StudentMark.findById(markId);

    return {
      success: true,
      message: 'Marks updated successfully',
      data: updatedMark
    };
  }

  /**
   * Delete marks entry (soft delete)
   * @param {number} markId - Mark ID
   * @returns {Promise<Object>}
   */
  async deleteMarks(markId) {
    // Check if mark exists
    const existingMark = await StudentMark.findById(markId);
    if (!existingMark) {
      throw new NotFoundError('Mark entry not found');
    }

    // Soft delete
    await StudentMark.delete(markId);

    return {
      success: true,
      message: 'Marks deleted successfully'
    };
  }

  /**
   * Validation schema for bulk question marks entry
   */
  getBulkQuestionMarksSchema() {
    return Joi.object({
      assessment_component_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Assessment component ID must be a number',
          'number.positive': 'Assessment component ID must be positive',
          'any.required': 'Assessment component ID is required'
        }),
      question_marks: Joi.array().min(1).items(
        Joi.object({
          student_id: Joi.number().integer().positive().required(),
          question_id: Joi.number().integer().positive().required(),
          marks_obtained: Joi.number().min(0).precision(2).required()
        })
      ).required()
        .messages({
          'array.min': 'At least one question mark entry is required',
          'any.required': 'Question marks data is required'
        })
    });
  }

  /**
   * Bulk enter question-level marks for students
   * Enables granular CLO attainment calculation at question level
   * @param {number} assessmentComponentId - Assessment component ID
   * @param {Array} questionMarks - Array of question marks {student_id, question_id, marks_obtained}
   * @returns {Promise<Object>}
   */
  async bulkEnterQuestionMarks(assessmentComponentId, questionMarks) {
    // Validate input
    const schema = this.getBulkQuestionMarksSchema();
    const { error, value } = schema.validate({ assessment_component_id: assessmentComponentId, question_marks: questionMarks });
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    // Check if assessment component exists
    const assessment = await AssessmentComponent.findById(assessmentComponentId);
    if (!assessment) {
      throw new NotFoundError('Assessment component not found');
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const results = {
        success: [],
        failed: [],
        skipped: []
      };

      for (const markEntry of value.question_marks) {
        const { student_id, question_id, marks_obtained } = markEntry;

        try {
          // Check if student exists
          const student = await Student.findById(student_id);
          if (!student) {
            results.failed.push({
              student_id,
              question_id,
              error: 'Student not found'
            });
            continue;
          }

          // Check if question exists and belongs to this assessment
          const question = await Question.findById(question_id);
          if (!question) {
            results.failed.push({
              student_id,
              question_id,
              error: 'Question not found'
            });
            continue;
          }

          if (question.assessment_component_id !== assessmentComponentId) {
            results.failed.push({
              student_id,
              question_id,
              error: 'Question does not belong to this assessment component'
            });
            continue;
          }

          // Validate marks against question total
          if (marks_obtained > question.marks) {
            results.failed.push({
              student_id,
              question_id,
              error: `Marks (${marks_obtained}) exceed question total marks (${question.marks})`
            });
            continue;
          }

          // Check if marks already exist
          const existingMark = await StudentQuestionMark.findByStudentAndQuestion(
            student_id,
            question_id
          );
          
          if (existingMark) {
            results.skipped.push({
              student_id,
              question_id,
              reason: 'Marks already exist'
            });
            continue;
          }

          // Insert question marks
          const markData = {
            student_id,
            question_id,
            marks_obtained,
            marks_total: question.marks
          };

          const query = `
            INSERT INTO student_question_marks 
            (student_id, question_id, marks_obtained, marks_total)
            VALUES (?, ?, ?, ?)
          `;
          
          const [result] = await connection.query(query, [
            markData.student_id,
            markData.question_id,
            markData.marks_obtained,
            markData.marks_total
          ]);

          results.success.push({
            student_id,
            question_id,
            mark_id: result.insertId,
            marks_obtained
          });

        } catch (err) {
          results.failed.push({
            student_id,
            question_id,
            error: err.message
          });
        }
      }

      await connection.commit();
      connection.release();

      return {
        success: true,
        message: 'Bulk question marks entry completed',
        data: {
          total: questionMarks.length,
          successful: results.success.length,
          failed: results.failed.length,
          skipped: results.skipped.length,
          details: results
        }
      };

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw new AppError('Failed to enter question marks in bulk: ' + error.message, 500);
    }
  }

  /**
   * Get all question-level marks for an assessment component
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<Object>}
   */
  async getQuestionMarksByAssessment(assessmentComponentId) {
    // Check if assessment exists
    const assessment = await AssessmentComponent.findById(assessmentComponentId);
    if (!assessment) {
      throw new NotFoundError('Assessment component not found');
    }

    // Get statistics for each question
    const statistics = await StudentQuestionMark.getAssessmentStatistics(assessmentComponentId);

    return {
      success: true,
      data: {
        assessment: {
          id: assessment.id,
          name: assessment.name,
          total_marks: assessment.total_marks
        },
        question_statistics: statistics
      }
    };
  }

  /**
   * Get question-level marks for a specific student
   * @param {number} studentId - Student ID
   * @param {number} assessmentComponentId - Assessment component ID (optional)
   * @returns {Promise<Object>}
   */
  async getQuestionMarksByStudent(studentId, assessmentComponentId = null) {
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Get question marks
    const questionMarks = await StudentQuestionMark.getByStudent(studentId, {
      assessmentComponentId
    });

    return {
      success: true,
      data: {
        student: {
          id: student.id,
          roll_number: student.roll_number,
          user_id: student.user_id
        },
        question_marks: questionMarks
      }
    };
  }

  /**
   * Get CLO attainment for a student based on question-level marks
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course Offering ID
   * @returns {Promise<Object>}
   */
  async getCLOAttainmentByStudent(studentId, courseOfferingId) {
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Get CLO attainment data
    const cloAttainment = await StudentQuestionMark.getCLOAttainmentByStudent(
      studentId, 
      courseOfferingId
    );

    return {
      success: true,
      data: {
        student: {
          id: student.id,
          roll_number: student.roll_number,
          user_id: student.user_id
        },
        course_offering_id: courseOfferingId,
        clo_attainment: cloAttainment
      }
    };
  }

  /**
   * Get CLO attainment for entire class based on question-level marks
   * @param {number} courseOfferingId - Course Offering ID
   * @returns {Promise<Object>}
   */
  async getCLOAttainmentByCourse(courseOfferingId) {
    // Get CLO attainment data for entire class
    const cloAttainment = await StudentQuestionMark.getCLOAttainmentByCourse(courseOfferingId);

    return {
      success: true,
      data: {
        course_offering_id: courseOfferingId,
        clo_attainment: cloAttainment
      }
    };
  }

  /**
   * Update question-level marks
   * @param {number} markId - Question mark ID
   * @param {number} marksObtained - New marks obtained
   * @returns {Promise<Object>}
   */
  async updateQuestionMarks(markId, marksObtained) {
    // Validate marks
    if (marksObtained < 0) {
      throw new ValidationError('Marks obtained cannot be negative');
    }

    // Check if mark exists
    const existingMark = await StudentQuestionMark.findById(markId);
    if (!existingMark) {
      throw new NotFoundError('Question mark entry not found');
    }

    // Get question to validate marks
    const question = await Question.findById(existingMark.question_id);
    if (marksObtained > question.marks) {
      throw new ValidationError(
        `Marks obtained (${marksObtained}) cannot exceed question total marks (${question.marks})`
      );
    }

    // Update marks
    await StudentQuestionMark.update(markId, { marks_obtained: marksObtained });
    const updatedMark = await StudentQuestionMark.findById(markId);

    return {
      success: true,
      message: 'Question marks updated successfully',
      data: updatedMark
    };
  }

  /**
   * Delete question marks entry (soft delete)
   * @param {number} markId - Question mark ID
   * @returns {Promise<Object>}
   */
  async deleteQuestionMarks(markId) {
    // Check if mark exists
    const existingMark = await StudentQuestionMark.findById(markId);
    if (!existingMark) {
      throw new NotFoundError('Question mark entry not found');
    }

    // Soft delete
    await StudentQuestionMark.delete(markId);

    return {
      success: true,
      message: 'Question marks deleted successfully'
    };
  }
}

module.exports = new MarksService();
