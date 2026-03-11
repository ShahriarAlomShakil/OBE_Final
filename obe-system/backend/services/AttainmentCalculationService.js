const db = require('../config/database');
const CourseOffering = require('../models/CourseOffering');
const AssessmentComponent = require('../models/AssessmentComponent');
const CourseLearningOutcome = require('../models/CourseLearningOutcome');
const ProgramLearningOutcome = require('../models/ProgramLearningOutcome');
const CourseEnrollment = require('../models/CourseEnrollment');
const StudentMark = require('../models/StudentMark');

class AttainmentCalculationService {
  /**
   * Default attainment thresholds
   */
  static THRESHOLDS = {
    CLO_MINIMUM: 60,
    CLO_TARGET: 75,
    PLO_MINIMUM: 60,
    PLO_TARGET: 70
  };

  /**
   * Calculate CLO attainment for a single student in a course offering
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course Offering ID
   * @returns {Promise<Array>} Array of CLO attainment results
   */
  static async calculateStudentCLOAttainment(studentId, courseOfferingId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. Verify student is enrolled in the course
      const enrollment = await CourseEnrollment.isEnrolled(studentId, courseOfferingId);
      if (!enrollment) {
        throw new Error('Student is not enrolled in this course offering');
      }

      // 2. Get course offering details
      const courseOffering = await CourseOffering.findByIdWithRelations(courseOfferingId);
      if (!courseOffering) {
        throw new Error('Course offering not found');
      }

      // 3. Get all CLOs for the course
      const [clos] = await connection.query(
        `SELECT id, clo_code, clo_description 
         FROM course_learning_outcomes 
         WHERE course_id = ? AND deleted_at IS NULL 
         ORDER BY clo_code`,
        [courseOffering.course_id]
      );

      if (clos.length === 0) {
        throw new Error('No CLOs defined for this course');
      }

      // 4. Get all assessments for this course offering
      const [assessments] = await connection.query(
        `SELECT id, name, total_marks 
         FROM assessment_components 
         WHERE course_offering_id = ? AND deleted_at IS NULL`,
        [courseOfferingId]
      );

      if (assessments.length === 0) {
        throw new Error('No assessments defined for this course offering');
      }

      // 5. Calculate attainment for each CLO
      const cloAttainments = [];

      for (const clo of clos) {
        let totalObtained = 0;
        let totalPossible = 0;

        // Get all assessment-CLO mappings for this CLO
        const [mappings] = await connection.query(
          `SELECT acm.assessment_component_id, acm.marks_allocated, ac.total_marks
           FROM assessment_clo_mapping acm
           JOIN assessment_components ac ON acm.assessment_component_id = ac.id
           WHERE acm.clo_id = ? AND ac.course_offering_id = ? AND ac.deleted_at IS NULL`,
          [clo.id, courseOfferingId]
        );

        for (const mapping of mappings) {
          // Get student's marks for this assessment
          const [marks] = await connection.query(
            `SELECT marks_obtained, marks_total, is_absent
             FROM student_assessment_marks
             WHERE student_id = ? AND assessment_component_id = ? AND deleted_at IS NULL`,
            [studentId, mapping.assessment_component_id]
          );

          if (marks.length > 0 && !marks[0].is_absent) {
            const studentMark = marks[0];
            // Calculate CLO contribution from this assessment
            const cloRatio = mapping.marks_allocated / mapping.total_marks;
            totalObtained += studentMark.marks_obtained * cloRatio;
            totalPossible += studentMark.marks_total * cloRatio;
          }
        }

        // Calculate attainment percentage
        const attainmentPercentage = totalPossible > 0 
          ? (totalObtained / totalPossible) * 100 
          : 0;

        const isAttained = attainmentPercentage >= this.THRESHOLDS.CLO_MINIMUM;

        // Save to student_clo_attainment table
        await connection.query(
          `INSERT INTO student_clo_attainment 
           (student_id, course_offering_id, clo_id, attainment_percentage, is_attained, calculated_at)
           VALUES (?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE 
           attainment_percentage = VALUES(attainment_percentage),
           is_attained = VALUES(is_attained),
           calculated_at = VALUES(calculated_at)`,
          [studentId, courseOfferingId, clo.id, attainmentPercentage, isAttained]
        );

        cloAttainments.push({
          cloId: clo.id,
          cloCode: clo.clo_code,
          cloDescription: clo.clo_description,
          attainmentPercentage: parseFloat(attainmentPercentage.toFixed(2)),
          isAttained,
          totalObtained: parseFloat(totalObtained.toFixed(2)),
          totalPossible: parseFloat(totalPossible.toFixed(2))
        });
      }

      await connection.commit();
      return cloAttainments;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Calculate CLO attainment summary for an entire course offering
   * @param {number} courseOfferingId - Course Offering ID
   * @returns {Promise<Array>} Array of course CLO attainment summary
   */
  static async calculateCourseCLOAttainment(courseOfferingId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. Get course offering details
      const courseOffering = await CourseOffering.findByIdWithRelations(courseOfferingId);
      if (!courseOffering) {
        throw new Error('Course offering not found');
      }

      // 2. Get all enrolled students
      const [enrolledStudents] = await connection.query(
        `SELECT student_id 
         FROM course_enrollments 
         WHERE course_offering_id = ? AND status = 'enrolled' AND deleted_at IS NULL`,
        [courseOfferingId]
      );

      if (enrolledStudents.length === 0) {
        throw new Error('No students enrolled in this course offering');
      }

      const totalStudents = enrolledStudents.length;

      // 3. Calculate attainment for each student
      for (const student of enrolledStudents) {
        await this.calculateStudentCLOAttainment(student.student_id, courseOfferingId);
      }

      // 4. Get all CLOs for the course
      const [clos] = await connection.query(
        `SELECT id, clo_code, clo_description 
         FROM course_learning_outcomes 
         WHERE course_id = ? AND deleted_at IS NULL 
         ORDER BY clo_code`,
        [courseOffering.course_id]
      );

      // 5. Calculate summary for each CLO
      const cloSummaries = [];

      for (const clo of clos) {
        // Get all student attainments for this CLO
        const [attainments] = await connection.query(
          `SELECT attainment_percentage, is_attained
           FROM student_clo_attainment
           WHERE course_offering_id = ? AND clo_id = ?`,
          [courseOfferingId, clo.id]
        );

        if (attainments.length === 0) {
          continue;
        }

        // Calculate statistics
        const totalAttainment = attainments.reduce((sum, a) => sum + a.attainment_percentage, 0);
        const averageAttainment = totalAttainment / attainments.length;
        const studentsAttained = attainments.filter(a => a.is_attained).length;
        const attainmentRate = (studentsAttained / totalStudents) * 100;

        // Find min and max attainment
        const attainmentValues = attainments.map(a => a.attainment_percentage);
        const minAttainment = Math.min(...attainmentValues);
        const maxAttainment = Math.max(...attainmentValues);

        // Save to course_clo_attainment_summary table
        await connection.query(
          `INSERT INTO course_clo_attainment_summary 
           (course_offering_id, clo_id, average_attainment, attainment_rate, 
            students_attained, total_students, min_attainment, max_attainment, calculated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE 
           average_attainment = VALUES(average_attainment),
           attainment_rate = VALUES(attainment_rate),
           students_attained = VALUES(students_attained),
           total_students = VALUES(total_students),
           min_attainment = VALUES(min_attainment),
           max_attainment = VALUES(max_attainment),
           calculated_at = VALUES(calculated_at)`,
          [
            courseOfferingId, 
            clo.id, 
            averageAttainment, 
            attainmentRate,
            studentsAttained,
            totalStudents,
            minAttainment,
            maxAttainment
          ]
        );

        cloSummaries.push({
          cloId: clo.id,
          cloCode: clo.clo_code,
          cloDescription: clo.clo_description,
          averageAttainment: parseFloat(averageAttainment.toFixed(2)),
          attainmentRate: parseFloat(attainmentRate.toFixed(2)),
          studentsAttained,
          totalStudents,
          minAttainment: parseFloat(minAttainment.toFixed(2)),
          maxAttainment: parseFloat(maxAttainment.toFixed(2)),
          isAttained: attainmentRate >= this.THRESHOLDS.CLO_MINIMUM
        });
      }

      await connection.commit();
      return cloSummaries;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Calculate PLO attainment for a single student across their degree program
   * @param {number} studentId - Student ID
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Array>} Array of PLO attainment results
   */
  static async calculateStudentPLOAttainment(studentId, degreeId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. Get all PLOs for the degree
      const [plos] = await connection.query(
        `SELECT id, plo_code, plo_description 
         FROM program_learning_outcomes 
         WHERE degree_id = ? AND deleted_at IS NULL 
         ORDER BY plo_code`,
        [degreeId]
      );

      if (plos.length === 0) {
        throw new Error('No PLOs defined for this degree');
      }

      // 2. Get all course enrollments for the student
      const [enrollments] = await connection.query(
        `SELECT ce.course_offering_id, c.credit_hours
         FROM course_enrollments ce
         JOIN course_offerings co ON ce.course_offering_id = co.id
         JOIN courses c ON co.course_id = c.id
         WHERE ce.student_id = ? AND ce.status = 'enrolled' AND ce.deleted_at IS NULL`,
        [studentId]
      );

      if (enrollments.length === 0) {
        throw new Error('Student has no course enrollments');
      }

      // 3. Calculate attainment for each PLO
      const ploAttainments = [];

      for (const plo of plos) {
        let weightedSum = 0;
        let totalWeight = 0;

        // Get all CLO-PLO mappings for this PLO
        const [cloMappings] = await connection.query(
          `SELECT cpm.clo_id, cpm.mapping_strength, clo.course_id
           FROM clo_plo_mapping cpm
           JOIN course_learning_outcomes clo ON cpm.clo_id = clo.id
           WHERE cpm.plo_id = ? AND clo.deleted_at IS NULL`,
          [plo.id]
        );

        for (const mapping of cloMappings) {
          // Find relevant course enrollments for this CLO's course
          for (const enrollment of enrollments) {
            // Get CLO attainment for this student in this course offering
            const [cloAttainment] = await connection.query(
              `SELECT sca.attainment_percentage
               FROM student_clo_attainment sca
               JOIN course_offerings co ON sca.course_offering_id = co.id
               WHERE sca.student_id = ? 
               AND sca.clo_id = ? 
               AND sca.course_offering_id = ?`,
              [studentId, mapping.clo_id, enrollment.course_offering_id]
            );

            if (cloAttainment.length > 0) {
              const attainment = cloAttainment[0].attainment_percentage;
              const mappingStrength = mapping.mapping_strength; // 1=Low, 2=Medium, 3=High
              const credits = enrollment.credit_hours;

              // Weighted contribution to PLO
              weightedSum += attainment * mappingStrength * credits;
              totalWeight += mappingStrength * credits;
            }
          }
        }

        // Calculate PLO attainment percentage
        const attainmentPercentage = totalWeight > 0 
          ? weightedSum / totalWeight 
          : 0;

        const isAttained = attainmentPercentage >= this.THRESHOLDS.PLO_MINIMUM;

        // Save to student_plo_attainment table
        await connection.query(
          `INSERT INTO student_plo_attainment 
           (student_id, degree_id, plo_id, attainment_percentage, is_attained, calculated_at)
           VALUES (?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE 
           attainment_percentage = VALUES(attainment_percentage),
           is_attained = VALUES(is_attained),
           calculated_at = VALUES(calculated_at)`,
          [studentId, degreeId, plo.id, attainmentPercentage, isAttained]
        );

        ploAttainments.push({
          ploId: plo.id,
          ploCode: plo.plo_code,
          ploDescription: plo.plo_description,
          attainmentPercentage: parseFloat(attainmentPercentage.toFixed(2)),
          isAttained,
          contributingCLOs: cloMappings.length
        });
      }

      await connection.commit();
      return ploAttainments;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Calculate PLO attainment summary for an entire degree program batch
   * @param {number} degreeId - Degree ID
   * @param {number} batchYear - Batch year (e.g., 2023)
   * @returns {Promise<Array>} Array of program PLO attainment summary
   */
  static async calculateProgramPLOAttainment(degreeId, batchYear) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. Get all students in the batch for this degree
      const [students] = await connection.query(
        `SELECT id 
         FROM students 
         WHERE degree_id = ? AND batch = ? AND is_active = 1 AND deleted_at IS NULL`,
        [degreeId, batchYear]
      );

      if (students.length === 0) {
        throw new Error('No students found in this degree batch');
      }

      const totalStudents = students.length;

      // 2. Calculate PLO attainment for each student
      for (const student of students) {
        await this.calculateStudentPLOAttainment(student.id, degreeId);
      }

      // 3. Get all PLOs for the degree
      const [plos] = await connection.query(
        `SELECT id, plo_code, plo_description 
         FROM program_learning_outcomes 
         WHERE degree_id = ? AND deleted_at IS NULL 
         ORDER BY plo_code`,
        [degreeId]
      );

      // 4. Calculate summary for each PLO
      const ploSummaries = [];

      for (const plo of plos) {
        // Get all student attainments for this PLO
        const [attainments] = await connection.query(
          `SELECT attainment_percentage, is_attained
           FROM student_plo_attainment
           WHERE degree_id = ? AND plo_id = ? 
           AND student_id IN (SELECT id FROM students WHERE batch = ?)`,
          [degreeId, plo.id, batchYear]
        );

        if (attainments.length === 0) {
          continue;
        }

        // Calculate statistics
        const totalAttainment = attainments.reduce((sum, a) => sum + a.attainment_percentage, 0);
        const averageAttainment = totalAttainment / attainments.length;
        const studentsAttained = attainments.filter(a => a.is_attained).length;
        const attainmentRate = (studentsAttained / totalStudents) * 100;

        // Find min and max attainment
        const attainmentValues = attainments.map(a => a.attainment_percentage);
        const minAttainment = Math.min(...attainmentValues);
        const maxAttainment = Math.max(...attainmentValues);

        // Save to program_plo_attainment_summary table
        await connection.query(
          `INSERT INTO program_plo_attainment_summary 
           (degree_id, batch_year, plo_id, average_attainment, attainment_rate, 
            students_attained, total_students, min_attainment, max_attainment, calculated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE 
           average_attainment = VALUES(average_attainment),
           attainment_rate = VALUES(attainment_rate),
           students_attained = VALUES(students_attained),
           total_students = VALUES(total_students),
           min_attainment = VALUES(min_attainment),
           max_attainment = VALUES(max_attainment),
           calculated_at = VALUES(calculated_at)`,
          [
            degreeId,
            batchYear,
            plo.id,
            averageAttainment,
            attainmentRate,
            studentsAttained,
            totalStudents,
            minAttainment,
            maxAttainment
          ]
        );

        ploSummaries.push({
          ploId: plo.id,
          ploCode: plo.plo_code,
          ploDescription: plo.plo_description,
          averageAttainment: parseFloat(averageAttainment.toFixed(2)),
          attainmentRate: parseFloat(attainmentRate.toFixed(2)),
          studentsAttained,
          totalStudents,
          minAttainment: parseFloat(minAttainment.toFixed(2)),
          maxAttainment: parseFloat(maxAttainment.toFixed(2)),
          isAttained: attainmentRate >= this.THRESHOLDS.PLO_MINIMUM
        });
      }

      await connection.commit();
      return ploSummaries;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get student CLO attainment data (read from saved results)
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course Offering ID
   * @returns {Promise<Array>} Saved CLO attainment data
   */
  static async getStudentCLOAttainment(studentId, courseOfferingId) {
    const [results] = await db.query(
      `SELECT sca.*, clo.clo_code, clo.clo_description
       FROM student_clo_attainment sca
       JOIN course_learning_outcomes clo ON sca.clo_id = clo.id
       WHERE sca.student_id = ? AND sca.course_offering_id = ?
       ORDER BY clo.clo_code`,
      [studentId, courseOfferingId]
    );

    return results;
  }

  /**
   * Get course CLO attainment summary (read from saved results)
   * @param {number} courseOfferingId - Course Offering ID
   * @returns {Promise<Array>} Saved course CLO attainment summary
   */
  static async getCourseCLOAttainmentSummary(courseOfferingId) {
    const [results] = await db.query(
      `SELECT ccas.*, clo.clo_code, clo.clo_description
       FROM course_clo_attainment_summary ccas
       JOIN course_learning_outcomes clo ON ccas.clo_id = clo.id
       WHERE ccas.course_offering_id = ?
       ORDER BY clo.clo_code`,
      [courseOfferingId]
    );

    return results;
  }

  /**
   * Get student PLO attainment data (read from saved results)
   * @param {number} studentId - Student ID
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Array>} Saved PLO attainment data
   */
  static async getStudentPLOAttainment(studentId, degreeId) {
    const [results] = await db.query(
      `SELECT spa.*, plo.plo_code, plo.plo_description
       FROM student_plo_attainment spa
       JOIN program_learning_outcomes plo ON spa.plo_id = plo.id
       WHERE spa.student_id = ? AND spa.degree_id = ?
       ORDER BY plo.plo_code`,
      [studentId, degreeId]
    );

    return results;
  }

  /**
   * Get program PLO attainment summary (read from saved results)
   * @param {number} degreeId - Degree ID
   * @param {number} batchYear - Batch year
   * @returns {Promise<Array>} Saved program PLO attainment summary
   */
  static async getProgramPLOAttainmentSummary(degreeId, batchYear) {
    const [results] = await db.query(
      `SELECT ppas.*, plo.plo_code, plo.plo_description
       FROM program_plo_attainment_summary ppas
       JOIN program_learning_outcomes plo ON ppas.plo_id = plo.id
       WHERE ppas.degree_id = ? AND ppas.batch_year = ?
       ORDER BY plo.plo_code`,
      [degreeId, batchYear]
    );

    return results;
  }

  /**
   * Get or set custom attainment threshold
   * @param {string} type - Threshold type (CLO_MINIMUM, CLO_TARGET, PLO_MINIMUM, PLO_TARGET)
   * @param {number} value - New value (optional, if setting)
   * @returns {number} Current threshold value
   */
  static getThreshold(type, value = null) {
    if (value !== null) {
      this.THRESHOLDS[type] = value;
    }
    return this.THRESHOLDS[type] || 60;
  }

  /**
   * Bulk recalculate attainment for multiple students in a course
   * @param {number} courseOfferingId - Course Offering ID
   * @param {Array<number>} studentIds - Array of student IDs (optional, all if not provided)
   * @returns {Promise<Object>} Calculation results summary
   */
  static async bulkRecalculateCLOAttainment(courseOfferingId, studentIds = null) {
    try {
      // Get enrolled students
      let students;
      if (studentIds && studentIds.length > 0) {
        const [results] = await db.query(
          `SELECT student_id FROM course_enrollments 
           WHERE course_offering_id = ? AND student_id IN (?) AND status = 'enrolled'`,
          [courseOfferingId, studentIds]
        );
        students = results;
      } else {
        const [results] = await db.query(
          `SELECT student_id FROM course_enrollments 
           WHERE course_offering_id = ? AND status = 'enrolled'`,
          [courseOfferingId]
        );
        students = results;
      }

      const results = {
        total: students.length,
        successful: 0,
        failed: 0,
        errors: []
      };

      // Calculate for each student
      for (const student of students) {
        try {
          await this.calculateStudentCLOAttainment(student.student_id, courseOfferingId);
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            studentId: student.student_id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AttainmentCalculationService;
