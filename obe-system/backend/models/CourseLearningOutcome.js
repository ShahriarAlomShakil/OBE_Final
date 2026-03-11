const BaseModel = require('./BaseModel');
const db = require('../config/database');

/**
 * CourseLearningOutcome Model
 * Represents a Course Learning Outcome (CLO) in the OBE system
 * CLOs are specific statements of what students should be able to do after completing a course
 */
class CourseLearningOutcome extends BaseModel {
  constructor() {
    super('course_learning_outcomes');
  }

  /**
   * Get the course this CLO belongs to
   * @param {number} cloId - CLO ID
   * @returns {Promise<Object|null>}
   */
  async getCourse(cloId) {
    const query = `
      SELECT c.*, d.name as department_name, d.dept_code as department_short_name
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.id = (SELECT course_id FROM course_learning_outcomes WHERE id = ?)
    `;
    const [rows] = await db.query(query, [cloId]);
    return rows[0] || null;
  }

  /**
   * Get Bloom's Taxonomy level for this CLO
   * @param {number} cloId - CLO ID
   * @returns {Promise<Object|null>}
   */
  async getBloomLevel(cloId) {
    const query = `
      SELECT btl.*
      FROM bloom_taxonomy_levels btl
      WHERE btl.id = (SELECT bloom_level_id FROM course_learning_outcomes WHERE id = ?)
    `;
    const [rows] = await db.query(query, [cloId]);
    return rows[0] || null;
  }

  /**
   * Get all PLO mappings for this CLO with mapping strength
   * @param {number} cloId - CLO ID
   * @returns {Promise<Array>}
   */
  async getPLOMappings(cloId) {
    const query = `
      SELECT 
        plo.id, plo.plo_code, plo.description, plo.plo_domain,
        cpm.mapping_strength,
        CASE 
          WHEN cpm.mapping_strength = 1 THEN 'Low'
          WHEN cpm.mapping_strength = 2 THEN 'Medium'
          WHEN cpm.mapping_strength = 3 THEN 'High'
          ELSE 'None'
        END as strength_label
      FROM program_learning_outcomes plo
      INNER JOIN clo_plo_mapping cpm ON plo.id = cpm.plo_id
      WHERE cpm.clo_id = ?
      ORDER BY plo.plo_code
    `;
    const [rows] = await db.query(query, [cloId]);
    return rows;
  }

  /**
   * Get all assessments that measure this CLO
   * @param {number} cloId - CLO ID
   * @returns {Promise<Array>}
   */
  async getAssessments(cloId) {
    const query = `
      SELECT 
        ac.id, ac.name, ac.total_marks, ac.weightage, ac.assessment_date,
        at.name as assessment_type,
        acm.marks_allocated,
        co.section,
        s.name as semester_name
      FROM assessment_components ac
      INNER JOIN assessment_clo_mapping acm ON ac.id = acm.assessment_component_id
      INNER JOIN assessment_types at ON ac.assessment_type_id = at.id
      INNER JOIN course_offerings co ON ac.course_offering_id = co.id
      INNER JOIN semesters s ON co.semester_id = s.id
      WHERE acm.clo_id = ?
      ORDER BY ac.assessment_date DESC
    `;
    const [rows] = await db.query(query, [cloId]);
    return rows;
  }

  /**
   * Calculate CLO attainment for a specific course offering
   * @param {number} cloId - CLO ID
   * @param {number} courseOfferingId - Course Offering ID
   * @returns {Promise<Object>}
   */
  async calculateAttainment(cloId, courseOfferingId) {
    // Get all assessments for this course offering that measure this CLO
    const assessmentQuery = `
      SELECT 
        ac.id, ac.total_marks,
        acm.marks_allocated
      FROM assessment_components ac
      INNER JOIN assessment_clo_mapping acm ON ac.id = acm.assessment_component_id
      WHERE acm.clo_id = ? AND ac.course_offering_id = ?
    `;
    const [assessments] = await db.query(assessmentQuery, [cloId, courseOfferingId]);

    if (assessments.length === 0) {
      return {
        cloId,
        courseOfferingId,
        averageAttainment: 0,
        totalPossibleMarks: 0,
        studentsEvaluated: 0,
        studentsAttained: 0,
        attainmentRate: 0,
        assessmentCount: 0
      };
    }

    // Calculate total possible marks for this CLO across all assessments
    const totalPossibleMarks = assessments.reduce((sum, a) => sum + parseFloat(a.marks_allocated), 0);

    // Get all students' marks for these assessments
    const marksQuery = `
      SELECT 
        sam.student_id,
        SUM(sam.marks_obtained * (acm.marks_allocated / ac.total_marks)) as clo_marks_obtained
      FROM student_assessment_marks sam
      INNER JOIN assessment_components ac ON sam.assessment_component_id = ac.id
      INNER JOIN assessment_clo_mapping acm ON ac.id = acm.assessment_component_id
      WHERE acm.clo_id = ? AND ac.course_offering_id = ?
      GROUP BY sam.student_id
    `;
    const [studentMarks] = await db.query(marksQuery, [cloId, courseOfferingId]);

    if (studentMarks.length === 0) {
      return {
        cloId,
        courseOfferingId,
        averageAttainment: 0,
        totalPossibleMarks,
        studentsEvaluated: 0,
        studentsAttained: 0,
        attainmentRate: 0,
        assessmentCount: assessments.length
      };
    }

    // Calculate attainment percentage for each student
    const threshold = 60; // Default threshold, should come from settings
    let totalAttainment = 0;
    let studentsAttained = 0;

    studentMarks.forEach(student => {
      const attainmentPercentage = (parseFloat(student.clo_marks_obtained) / totalPossibleMarks) * 100;
      totalAttainment += attainmentPercentage;
      if (attainmentPercentage >= threshold) {
        studentsAttained++;
      }
    });

    const averageAttainment = totalAttainment / studentMarks.length;
    const attainmentRate = (studentsAttained / studentMarks.length) * 100;

    return {
      cloId,
      courseOfferingId,
      averageAttainment: parseFloat(averageAttainment.toFixed(2)),
      totalPossibleMarks: parseFloat(totalPossibleMarks.toFixed(2)),
      studentsEvaluated: studentMarks.length,
      studentsAttained,
      attainmentRate: parseFloat(attainmentRate.toFixed(2)),
      assessmentCount: assessments.length,
      threshold
    };
  }

  /**
   * Get CLO with course and bloom level information
   * @param {number} cloId - CLO ID
   * @returns {Promise<Object|null>}
   */
  async findByIdWithRelations(cloId) {
    const query = `
      SELECT 
        clo.*,
        c.course_code as course_code, c.course_title as course_title, c.credit as credit_hours,
        btl.level_number, btl.name as bloom_level_name, btl.description as bloom_level_description,
        d.name as department_name
      FROM course_learning_outcomes clo
      LEFT JOIN courses c ON clo.course_id = c.id
      LEFT JOIN bloom_taxonomy_levels btl ON clo.bloom_level_id = btl.id
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE clo.id = ? AND clo.deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [cloId]);
    return rows[0] || null;
  }

  /**
   * Get all CLOs for a course
   * @param {number} courseId - Course ID
   * @returns {Promise<Array>}
   */
  async getByCourseId(courseId) {
    const query = `
      SELECT 
        clo.*,
        btl.level_number, btl.name as bloom_level_name,
        (SELECT COUNT(*) FROM clo_plo_mapping WHERE clo_id = clo.id) as plo_mappings_count,
        (SELECT COUNT(*) FROM assessment_clo_mapping WHERE clo_id = clo.id) as assessment_mappings_count
      FROM course_learning_outcomes clo
      LEFT JOIN bloom_taxonomy_levels btl ON clo.bloom_level_id = btl.id
      WHERE clo.course_id = ? AND clo.deleted_at IS NULL
      ORDER BY clo.clo_code
    `;
    const [rows] = await db.query(query, [courseId]);
    return rows;
  }

  /**
   * Find CLO by code within a course
   * @param {number} courseId - Course ID
   * @param {string} cloCode - CLO code (e.g., "CLO1")
   * @returns {Promise<Object|null>}
   */
  async findByCourseAndCode(courseId, cloCode) {
    const query = `
      SELECT * FROM course_learning_outcomes 
      WHERE course_id = ? AND clo_code = ? AND deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [courseId, cloCode]);
    return rows[0] || null;
  }

  /**
   * Search CLOs by description
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>}
   */
  async search(searchTerm) {
    const query = `
      SELECT 
        clo.*,
        c.course_code as course_code, c.course_title as course_title,
        btl.name as bloom_level_name
      FROM course_learning_outcomes clo
      LEFT JOIN courses c ON clo.course_id = c.id
      LEFT JOIN bloom_taxonomy_levels btl ON clo.bloom_level_id = btl.id
      WHERE (clo.clo_code LIKE ? OR clo.description LIKE ? OR c.course_code LIKE ?)
        AND clo.deleted_at IS NULL
      ORDER BY c.course_code, clo.clo_code
      LIMIT 50
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await db.query(query, [searchPattern, searchPattern, searchPattern]);
    return rows;
  }

  /**
   * Get CLOs by Bloom's Taxonomy level
   * @param {number} bloomLevelId - Bloom level ID
   * @returns {Promise<Array>}
   */
  async getByBloomLevel(bloomLevelId) {
    const query = `
      SELECT 
        clo.*,
        c.course_code as course_code, c.course_title as course_title
      FROM course_learning_outcomes clo
      LEFT JOIN courses c ON clo.course_id = c.id
      WHERE clo.bloom_level_id = ? AND clo.deleted_at IS NULL
      ORDER BY c.course_code, clo.clo_code
    `;
    const [rows] = await db.query(query, [bloomLevelId]);
    return rows;
  }

  /**
   * Count PLO mappings for a CLO
   * @param {number} cloId - CLO ID
   * @returns {Promise<number>}
   */
  async countPLOMappings(cloId) {
    const query = 'SELECT COUNT(*) as count FROM clo_plo_mapping WHERE clo_id = ?';
    const [rows] = await db.query(query, [cloId]);
    return rows[0].count;
  }

  /**
   * Count assessment mappings for a CLO
   * @param {number} cloId - CLO ID
   * @returns {Promise<number>}
   */
  async countAssessmentMappings(cloId) {
    const query = 'SELECT COUNT(*) as count FROM assessment_clo_mapping WHERE clo_id = ?';
    const [rows] = await db.query(query, [cloId]);
    return rows[0].count;
  }

  /**
   * Validate course exists and is active
   * @param {number} courseId - Course ID
   * @returns {Promise<boolean>}
   */
  async validateCourseExists(courseId) {
    const query = 'SELECT id, is_active FROM courses WHERE id = ? AND deleted_at IS NULL';
    const [rows] = await db.query(query, [courseId]);
    if (rows.length === 0) {
      throw new Error('Course not found');
    }
    if (!rows[0].is_active) {
      throw new Error('Course is not active');
    }
    return true;
  }

  /**
   * Validate Bloom level exists
   * @param {number} bloomLevelId - Bloom level ID
   * @returns {Promise<boolean>}
   */
  async validateBloomLevelExists(bloomLevelId) {
    const query = 'SELECT id FROM bloom_taxonomy_levels WHERE id = ?';
    const [rows] = await db.query(query, [bloomLevelId]);
    if (rows.length === 0) {
      throw new Error('Bloom Taxonomy level not found');
    }
    return true;
  }

  /**
   * Get statistics for a CLO
   * @param {number} cloId - CLO ID
   * @returns {Promise<Object>}
   */
  async getStatistics(cloId) {
    const ploMappingsCount = await this.countPLOMappings(cloId);
    const assessmentMappingsCount = await this.countAssessmentMappings(cloId);

    const offeringsQuery = `
      SELECT COUNT(DISTINCT ac.course_offering_id) as offerings_count
      FROM assessment_components ac
      INNER JOIN assessment_clo_mapping acm ON ac.id = acm.assessment_component_id
      WHERE acm.clo_id = ?
    `;
    const [offeringsRows] = await db.query(offeringsQuery, [cloId]);

    return {
      ploMappingsCount,
      assessmentMappingsCount,
      courseOfferingsCount: offeringsRows[0].offerings_count
    };
  }

  /**
   * Get next available CLO code for a course
   * @param {number} courseId - Course ID
   * @returns {Promise<string>}
   */
  async getNextCLOCode(courseId) {
    const query = `
      SELECT clo_code FROM course_learning_outcomes 
      WHERE course_id = ? AND deleted_at IS NULL
      ORDER BY clo_code DESC
      LIMIT 1
    `;
    const [rows] = await db.query(query, [courseId]);
    
    if (rows.length === 0) {
      return 'CLO1';
    }

    // Extract number from CLO code (e.g., "CLO1" -> 1)
    const lastCode = rows[0].clo_code;
    const match = lastCode.match(/CLO(\d+)/);
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `CLO${nextNumber}`;
    }

    return 'CLO1';
  }
}

module.exports = new CourseLearningOutcome();
