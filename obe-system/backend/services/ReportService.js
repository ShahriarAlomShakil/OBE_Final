/**
 * Report Generation Service
 * 
 * Generates various OBE reports including:
 * - CLO Attainment Reports
 * - PLO Attainment Reports
 * - CLO-PLO Mapping Reports
 * - Student Transcripts
 * - Gap Analysis Reports
 */

const pool = require('../config/database');
const CourseOffering = require('../models/CourseOffering');
const Course = require('../models/Course');
const Degree = require('../models/Degree');
const Student = require('../models/Student');
const CourseLearningOutcome = require('../models/CourseLearningOutcome');
const ProgramLearningOutcome = require('../models/ProgramLearningOutcome');
const AttainmentThreshold = require('../models/AttainmentThreshold');

class ReportService {
  /**
   * Generate CLO Attainment Report for a course offering
   * 
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Report data with course details, CLOs, students, attainment matrix, and summary
   */
  static async generateCLOAttainmentReport(courseOfferingId) {
    try {
      const connection = await pool.getConnection();
      
      try {
        // 1. Fetch course offering details with course and semester
        const offering = await CourseOffering.findByIdWithRelations(courseOfferingId);
        
        if (!offering) {
          throw new Error('Course offering not found');
        }

        const course = await offering.getCourse();
        const semester = await offering.getSemester();
        const teacher = await offering.getTeacher();

        // 2. Fetch all CLOs for this course
        const clos = await CourseLearningOutcome.getByCourseId(course.id);

        // 3. Fetch all enrolled students
        const [enrollments] = await connection.query(`
          SELECT 
            ce.student_id,
            s.student_id as student_number,
            u.first_name,
            u.last_name,
            u.email,
            s.batch_year,
            ce.enrollment_status
          FROM course_enrollments ce
          JOIN students s ON ce.student_id = s.id
          JOIN users u ON s.user_id = u.id
          WHERE ce.course_offering_id = ?
            AND ce.enrollment_status = 'enrolled'
            AND ce.deleted_at IS NULL
          ORDER BY s.student_id
        `, [courseOfferingId]);

        // 4. Fetch CLO attainment data for all students
        const [attainmentData] = await connection.query(`
          SELECT 
            sca.student_id,
            sca.clo_id,
            sca.attainment_percentage,
            sca.is_attained,
            sca.total_marks_obtained,
            sca.total_marks_possible,
            sca.calculated_at
          FROM student_clo_attainment sca
          WHERE sca.course_offering_id = ?
            AND sca.student_id IN (${enrollments.map(() => '?').join(',')})
          ORDER BY sca.student_id, sca.clo_id
        `, [courseOfferingId, ...enrollments.map(e => e.student_id)]);

        // 5. Build attainment matrix [studentIndex][cloIndex]
        const attainmentMatrix = [];
        const studentAttainmentMap = new Map();

        enrollments.forEach((student, studentIndex) => {
          const studentRow = [];
          clos.forEach((clo, cloIndex) => {
            const attainment = attainmentData.find(
              a => a.student_id === student.student_id && a.clo_id === clo.id
            );
            
            studentRow.push({
              attainmentPercentage: attainment ? attainment.attainment_percentage : null,
              isAttained: attainment ? attainment.is_attained : false,
              marksObtained: attainment ? attainment.total_marks_obtained : null,
              marksPossible: attainment ? attainment.total_marks_possible : null
            });
          });
          attainmentMatrix.push(studentRow);
          
          // Track students who attained each CLO
          studentRow.forEach((cell, cloIndex) => {
            if (!studentAttainmentMap.has(cloIndex)) {
              studentAttainmentMap.set(cloIndex, { attained: 0, total: 0, sum: 0 });
            }
            const cloStats = studentAttainmentMap.get(cloIndex);
            cloStats.total++;
            if (cell.isAttained) {
              cloStats.attained++;
            }
            if (cell.attainmentPercentage !== null) {
              cloStats.sum += cell.attainmentPercentage;
            }
          });
        });

        // 6. Calculate summary statistics
        const summary = {
          totalStudents: enrollments.length,
          totalCLOs: clos.length,
          cloSummary: [],
          overallAttainmentRate: 0,
          averageAttainment: 0
        };

        let totalAttainmentSum = 0;
        let totalAttainmentCount = 0;

        clos.forEach((clo, index) => {
          const stats = studentAttainmentMap.get(index) || { attained: 0, total: 0, sum: 0 };
          const averageAttainment = stats.total > 0 ? stats.sum / stats.total : 0;
          const attainmentRate = stats.total > 0 ? (stats.attained / stats.total) * 100 : 0;

          summary.cloSummary.push({
            cloId: clo.id,
            cloCode: clo.clo_code,
            cloDescription: clo.clo_description,
            bloomLevel: clo.bloom_level_name,
            studentsAttained: stats.attained,
            totalStudents: stats.total,
            attainmentRate: parseFloat(attainmentRate.toFixed(2)),
            averageAttainment: parseFloat(averageAttainment.toFixed(2)),
            isAttained: attainmentRate >= 60 // Course-level CLO is attained if 60%+ students attained it
          });

          totalAttainmentSum += averageAttainment;
          totalAttainmentCount++;
        });

        summary.averageAttainment = totalAttainmentCount > 0 
          ? parseFloat((totalAttainmentSum / totalAttainmentCount).toFixed(2))
          : 0;

        summary.overallAttainmentRate = summary.cloSummary.filter(c => c.isAttained).length / summary.totalCLOs * 100;

        // 7. Get threshold information
        const [thresholds] = await connection.query(`
          SELECT clo_minimum_threshold, clo_target_threshold, clo_excellence_threshold
          FROM attainment_thresholds
          WHERE degree_id = ? AND is_active = 1
          LIMIT 1
        `, [course.degree_id || 1]);

        const threshold = thresholds.length > 0 ? thresholds[0] : {
          clo_minimum_threshold: 60,
          clo_target_threshold: 75,
          clo_excellence_threshold: 85
        };

        return {
          course: {
            id: course.id,
            code: course.course_code,
            title: course.course_title,
            credits: course.credit_hours,
            department: course.department_name,
            faculty: course.faculty_name
          },
          offering: {
            id: offering.id,
            semester: semester.semester_name,
            academicSession: semester.academic_session_name,
            section: offering.section,
            teacher: teacher ? `${teacher.first_name} ${teacher.last_name}` : 'N/A',
            enrolledCount: enrollments.length
          },
          clos: clos.map(clo => ({
            id: clo.id,
            code: clo.clo_code,
            description: clo.clo_description,
            bloomLevel: clo.bloom_level_name,
            bloomLevelNumber: clo.bloom_level_number
          })),
          students: enrollments.map(e => ({
            id: e.student_id,
            studentNumber: e.student_number,
            name: `${e.first_name} ${e.last_name}`,
            email: e.email,
            batch: e.batch_year
          })),
          attainmentMatrix,
          summary,
          threshold,
          generatedAt: new Date()
        };

      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error generating CLO attainment report:', error);
      throw error;
    }
  }

  /**
   * Generate PLO Attainment Report for a degree/program
   * 
   * @param {number} degreeId - Degree ID
   * @param {number|null} batchYear - Optional batch year filter
   * @returns {Promise<Object>} Report data with degree, PLOs, students, attainment matrix, and summary
   */
  static async generatePLOAttainmentReport(degreeId, batchYear = null) {
    try {
      const connection = await pool.getConnection();
      
      try {
        // 1. Fetch degree details
        const degree = await Degree.findByIdWithRelations(degreeId);
        
        if (!degree) {
          throw new Error('Degree not found');
        }

        // 2. Fetch all PLOs for this degree
        const plos = await ProgramLearningOutcome.getByDegreeId(degreeId);

        // 3. Fetch all students for this degree (optionally filtered by batch)
        let studentQuery = `
          SELECT 
            s.id as student_id,
            s.student_id as student_number,
            u.first_name,
            u.last_name,
            u.email,
            s.batch_year,
            s.current_semester
          FROM students s
          JOIN users u ON s.user_id = u.id
          WHERE s.degree_id = ?
            AND s.is_active = 1
            AND s.deleted_at IS NULL
        `;
        
        const queryParams = [degreeId];
        
        if (batchYear) {
          studentQuery += ' AND s.batch_year = ?';
          queryParams.push(batchYear);
        }
        
        studentQuery += ' ORDER BY s.batch_year DESC, s.student_id';

        const [students] = await connection.query(studentQuery, queryParams);

        // 4. Fetch PLO attainment data for all students
        const [attainmentData] = await connection.query(`
          SELECT 
            spa.student_id,
            spa.plo_id,
            spa.attainment_percentage,
            spa.is_attained,
            spa.calculated_at
          FROM student_plo_attainment spa
          WHERE spa.degree_id = ?
            AND spa.student_id IN (${students.map(() => '?').join(',')})
          ORDER BY spa.student_id, spa.plo_id
        `, [degreeId, ...students.map(s => s.student_id)]);

        // 5. Build attainment matrix [studentIndex][ploIndex]
        const attainmentMatrix = [];
        const ploAttainmentMap = new Map();

        students.forEach((student) => {
          const studentRow = [];
          plos.forEach((plo, ploIndex) => {
            const attainment = attainmentData.find(
              a => a.student_id === student.student_id && a.plo_id === plo.id
            );
            
            studentRow.push({
              attainmentPercentage: attainment ? attainment.attainment_percentage : null,
              isAttained: attainment ? attainment.is_attained : false
            });
          });
          attainmentMatrix.push(studentRow);
          
          // Track students who attained each PLO
          studentRow.forEach((cell, ploIndex) => {
            if (!ploAttainmentMap.has(ploIndex)) {
              ploAttainmentMap.set(ploIndex, { attained: 0, total: 0, sum: 0 });
            }
            const ploStats = ploAttainmentMap.get(ploIndex);
            ploStats.total++;
            if (cell.isAttained) {
              ploStats.attained++;
            }
            if (cell.attainmentPercentage !== null) {
              ploStats.sum += cell.attainmentPercentage;
            }
          });
        });

        // 6. Calculate summary statistics
        const summary = {
          totalStudents: students.length,
          totalPLOs: plos.length,
          batchYear: batchYear,
          ploSummary: [],
          overallAttainmentRate: 0,
          averageAttainment: 0
        };

        let totalAttainmentSum = 0;
        let totalAttainmentCount = 0;

        plos.forEach((plo, index) => {
          const stats = ploAttainmentMap.get(index) || { attained: 0, total: 0, sum: 0 };
          const averageAttainment = stats.total > 0 ? stats.sum / stats.total : 0;
          const attainmentRate = stats.total > 0 ? (stats.attained / stats.total) * 100 : 0;

          summary.ploSummary.push({
            ploId: plo.id,
            ploCode: plo.plo_code,
            ploDescription: plo.plo_description,
            domain: plo.domain,
            studentsAttained: stats.attained,
            totalStudents: stats.total,
            attainmentRate: parseFloat(attainmentRate.toFixed(2)),
            averageAttainment: parseFloat(averageAttainment.toFixed(2)),
            isAttained: attainmentRate >= 60
          });

          totalAttainmentSum += averageAttainment;
          totalAttainmentCount++;
        });

        summary.averageAttainment = totalAttainmentCount > 0 
          ? parseFloat((totalAttainmentSum / totalAttainmentCount).toFixed(2))
          : 0;

        summary.overallAttainmentRate = summary.ploSummary.filter(p => p.isAttained).length / summary.totalPLOs * 100;

        // 7. Get threshold information
        const [thresholds] = await connection.query(`
          SELECT plo_minimum_threshold, plo_target_threshold, plo_excellence_threshold
          FROM attainment_thresholds
          WHERE degree_id = ? AND is_active = 1
          LIMIT 1
        `, [degreeId]);

        const threshold = thresholds.length > 0 ? thresholds[0] : {
          plo_minimum_threshold: 60,
          plo_target_threshold: 70,
          plo_excellence_threshold: 85
        };

        return {
          degree: {
            id: degree.id,
            name: degree.degree_name,
            shortName: degree.degree_short_name,
            level: degree.degree_level,
            department: degree.department_name,
            faculty: degree.faculty_name
          },
          plos: plos.map(plo => ({
            id: plo.id,
            code: plo.plo_code,
            description: plo.plo_description,
            domain: plo.domain
          })),
          students: students.map(s => ({
            id: s.student_id,
            studentNumber: s.student_number,
            name: `${s.first_name} ${s.last_name}`,
            email: s.email,
            batch: s.batch_year,
            currentSemester: s.current_semester
          })),
          attainmentMatrix,
          summary,
          threshold,
          generatedAt: new Date()
        };

      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error generating PLO attainment report:', error);
      throw error;
    }
  }

  /**
   * Generate CLO-PLO Mapping Report for a course
   * 
   * @param {number} courseId - Course ID
   * @returns {Promise<Object>} Matrix showing CLO vs PLO with mapping strengths
   */
  static async generateCLOPLOMappingReport(courseId) {
    try {
      const connection = await pool.getConnection();
      
      try {
        // 1. Fetch course details
        const course = await Course.findByIdWithRelations(courseId);
        
        if (!course) {
          throw new Error('Course not found');
        }

        // 2. Fetch all CLOs for this course
        const clos = await CourseLearningOutcome.getByCourseId(courseId);

        // 3. Fetch degree PLOs
        const plos = await ProgramLearningOutcome.getByDegreeId(course.degree_id);

        // 4. Fetch all CLO-PLO mappings
        const [mappings] = await connection.query(`
          SELECT 
            cpm.clo_id,
            cpm.plo_id,
            cpm.mapping_strength
          FROM clo_plo_mapping cpm
          WHERE cpm.clo_id IN (${clos.map(() => '?').join(',')})
        `, clos.map(c => c.id));

        // 5. Build mapping matrix [cloIndex][ploIndex]
        const mappingMatrix = [];
        
        clos.forEach((clo) => {
          const cloRow = [];
          plos.forEach((plo) => {
            const mapping = mappings.find(
              m => m.clo_id === clo.id && m.plo_id === plo.id
            );
            
            cloRow.push({
              mappingStrength: mapping ? mapping.mapping_strength : 0,
              strengthLabel: this.getMappingStrengthLabel(mapping ? mapping.mapping_strength : 0)
            });
          });
          mappingMatrix.push(cloRow);
        });

        // 6. Calculate summary statistics
        const summary = {
          totalCLOs: clos.length,
          totalPLOs: plos.length,
          totalMappings: mappings.length,
          cloMappingStats: [],
          ploMappingStats: []
        };

        // CLO mapping stats (how many PLOs each CLO maps to)
        clos.forEach((clo, index) => {
          const cloMappings = mappingMatrix[index].filter(m => m.mappingStrength > 0);
          const avgStrength = cloMappings.length > 0
            ? cloMappings.reduce((sum, m) => sum + m.mappingStrength, 0) / cloMappings.length
            : 0;

          summary.cloMappingStats.push({
            cloCode: clo.clo_code,
            mappedPLOs: cloMappings.length,
            averageStrength: parseFloat(avgStrength.toFixed(2))
          });
        });

        // PLO mapping stats (how many CLOs map to each PLO)
        plos.forEach((plo, ploIndex) => {
          const ploMappings = mappingMatrix.map(row => row[ploIndex]).filter(m => m.mappingStrength > 0);
          const avgStrength = ploMappings.length > 0
            ? ploMappings.reduce((sum, m) => sum + m.mappingStrength, 0) / ploMappings.length
            : 0;

          summary.ploMappingStats.push({
            ploCode: plo.plo_code,
            mappedCLOs: ploMappings.length,
            averageStrength: parseFloat(avgStrength.toFixed(2))
          });
        });

        return {
          course: {
            id: course.id,
            code: course.course_code,
            title: course.course_title,
            credits: course.credit_hours,
            department: course.department_name,
            degree: course.degree_name
          },
          clos: clos.map(clo => ({
            id: clo.id,
            code: clo.clo_code,
            description: clo.clo_description,
            bloomLevel: clo.bloom_level_name
          })),
          plos: plos.map(plo => ({
            id: plo.id,
            code: plo.plo_code,
            description: plo.plo_description,
            domain: plo.domain
          })),
          mappingMatrix,
          summary,
          generatedAt: new Date()
        };

      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error generating CLO-PLO mapping report:', error);
      throw error;
    }
  }

  /**
   * Generate Student OBE Transcript
   * 
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} Comprehensive student OBE transcript
   */
  static async generateStudentTranscript(studentId) {
    try {
      const connection = await pool.getConnection();
      
      try {
        // 1. Fetch student details
        const student = await Student.findByIdWithRelations(studentId);
        
        if (!student) {
          throw new Error('Student not found');
        }

        // 2. Fetch all course enrollments with marks
        const [courseData] = await connection.query(`
          SELECT 
            c.id as course_id,
            c.course_code,
            c.course_title,
            c.credit_hours,
            co.id as course_offering_id,
            sem.semester_name,
            asess.academic_session_name,
            ce.final_grade,
            ce.grade_point,
            ce.enrollment_status,
            ce.credits_earned
          FROM course_enrollments ce
          JOIN course_offerings co ON ce.course_offering_id = co.id
          JOIN courses c ON co.course_id = c.id
          JOIN semesters sem ON co.semester_id = sem.id
          JOIN academic_sessions asess ON sem.academic_session_id = asess.id
          WHERE ce.student_id = ?
            AND ce.deleted_at IS NULL
          ORDER BY asess.start_year, sem.semester_number, c.course_code
        `, [studentId]);

        // 3. Fetch CLO attainments for each course
        const courseOfferingIds = courseData.map(c => c.course_offering_id);
        
        let cloAttainments = [];
        if (courseOfferingIds.length > 0) {
          const [cloData] = await connection.query(`
            SELECT 
              sca.course_offering_id,
              sca.clo_id,
              clo.clo_code,
              clo.clo_description,
              sca.attainment_percentage,
              sca.is_attained
            FROM student_clo_attainment sca
            JOIN course_learning_outcomes clo ON sca.clo_id = clo.id
            WHERE sca.student_id = ?
              AND sca.course_offering_id IN (${courseOfferingIds.map(() => '?').join(',')})
            ORDER BY sca.course_offering_id, clo.clo_code
          `, [studentId, ...courseOfferingIds]);
          
          cloAttainments = cloData;
        }

        // 4. Fetch PLO attainments
        const [ploData] = await connection.query(`
          SELECT 
            spa.plo_id,
            plo.plo_code,
            plo.plo_description,
            plo.domain,
            spa.attainment_percentage,
            spa.is_attained
          FROM student_plo_attainment spa
          JOIN program_learning_outcomes plo ON spa.plo_id = plo.id
          WHERE spa.student_id = ?
            AND spa.degree_id = ?
          ORDER BY plo.plo_code
        `, [studentId, student.degree_id]);

        // 5. Organize course-wise data
        const courses = courseData.map(course => {
          const courseCLOs = cloAttainments
            .filter(clo => clo.course_offering_id === course.course_offering_id)
            .map(clo => ({
              cloCode: clo.clo_code,
              cloDescription: clo.clo_description,
              attainmentPercentage: clo.attainment_percentage,
              isAttained: clo.is_attained
            }));

          const cloAttainmentRate = courseCLOs.length > 0
            ? (courseCLOs.filter(c => c.isAttained).length / courseCLOs.length) * 100
            : 0;

          return {
            courseCode: course.course_code,
            courseTitle: course.course_title,
            credits: course.credit_hours,
            semester: course.semester_name,
            academicSession: course.academic_session_name,
            grade: course.final_grade,
            gradePoint: course.grade_point,
            creditsEarned: course.credits_earned,
            clos: courseCLOs,
            cloAttainmentRate: parseFloat(cloAttainmentRate.toFixed(2))
          };
        });

        // 6. Calculate overall statistics
        const totalCredits = courseData.reduce((sum, c) => sum + parseFloat(c.credit_hours || 0), 0);
        const earnedCredits = courseData.reduce((sum, c) => sum + parseFloat(c.credits_earned || 0), 0);
        const totalGradePoints = courseData.reduce((sum, c) => {
          return sum + (parseFloat(c.grade_point || 0) * parseFloat(c.credit_hours || 0));
        }, 0);
        const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

        const totalCLOsAttained = cloAttainments.filter(c => c.is_attained).length;
        const totalCLOs = cloAttainments.length;
        const cloAttainmentRate = totalCLOs > 0 ? (totalCLOsAttained / totalCLOs) * 100 : 0;

        const totalPLOsAttained = ploData.filter(p => p.is_attained).length;
        const totalPLOs = ploData.length;
        const ploAttainmentRate = totalPLOs > 0 ? (totalPLOsAttained / totalPLOs) * 100 : 0;

        return {
          student: {
            id: student.id,
            studentNumber: student.student_id,
            name: `${student.first_name} ${student.last_name}`,
            email: student.email,
            batch: student.batch_year,
            currentSemester: student.current_semester,
            degree: student.degree_name,
            department: student.department_name,
            faculty: student.faculty_name
          },
          academic: {
            totalCredits,
            earnedCredits,
            cgpa: parseFloat(cgpa.toFixed(2)),
            totalCoursesCompleted: courseData.filter(c => c.enrollment_status === 'completed').length
          },
          courses,
          plos: ploData.map(plo => ({
            ploCode: plo.plo_code,
            ploDescription: plo.plo_description,
            domain: plo.domain,
            attainmentPercentage: plo.attainment_percentage,
            isAttained: plo.is_attained
          })),
          summary: {
            totalCLOs,
            closAttained: totalCLOsAttained,
            cloAttainmentRate: parseFloat(cloAttainmentRate.toFixed(2)),
            totalPLOs,
            plosAttained: totalPLOsAttained,
            ploAttainmentRate: parseFloat(ploAttainmentRate.toFixed(2)),
            overallOBEStatus: ploAttainmentRate >= 60 ? 'ATTAINED' : 'NOT ATTAINED'
          },
          generatedAt: new Date()
        };

      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error generating student transcript:', error);
      throw error;
    }
  }

  /**
   * Generate Gap Analysis Report
   * Identifies underperforming CLOs and provides recommendations
   * 
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Gap analysis with underperforming CLOs and recommendations
   */
  static async generateGapAnalysisReport(courseOfferingId) {
    try {
      const connection = await pool.getConnection();
      
      try {
        // 1. Fetch course offering details
        const offering = await CourseOffering.findByIdWithRelations(courseOfferingId);
        
        if (!offering) {
          throw new Error('Course offering not found');
        }

        const course = await offering.getCourse();

        // 2. Fetch CLO attainment summary
        const [cloSummary] = await connection.query(`
          SELECT 
            ccas.clo_id,
            clo.clo_code,
            clo.clo_description,
            clo.bloom_level_number,
            bt.level_name as bloom_level_name,
            ccas.average_attainment,
            ccas.attainment_rate,
            ccas.students_attained,
            ccas.total_students,
            ccas.min_attainment,
            ccas.max_attainment
          FROM course_clo_attainment_summary ccas
          JOIN course_learning_outcomes clo ON ccas.clo_id = clo.id
          LEFT JOIN bloom_taxonomy_levels bt ON clo.bloom_taxonomy_level_id = bt.id
          WHERE ccas.course_offering_id = ?
          ORDER BY clo.clo_code
        `, [courseOfferingId]);

        // 3. Get threshold
        const [thresholds] = await connection.query(`
          SELECT clo_minimum_threshold, clo_target_threshold
          FROM attainment_thresholds
          WHERE degree_id = ? AND is_active = 1
          LIMIT 1
        `, [course.degree_id || 1]);

        const minimumThreshold = thresholds.length > 0 ? thresholds[0].clo_minimum_threshold : 60;
        const targetThreshold = thresholds.length > 0 ? thresholds[0].clo_target_threshold : 75;

        // 4. Identify underperforming CLOs
        const underperformingCLOs = [];
        const criticalCLOs = []; // Below minimum
        const improvementNeeded = []; // Between minimum and target

        for (const clo of cloSummary) {
          if (clo.average_attainment < minimumThreshold) {
            criticalCLOs.push(clo);
          } else if (clo.average_attainment < targetThreshold) {
            improvementNeeded.push(clo);
          }
          
          if (clo.average_attainment < targetThreshold) {
            underperformingCLOs.push(clo);
          }
        }

        // 5. Fetch assessment contributions for underperforming CLOs
        const recommendations = [];

        for (const clo of underperformingCLOs) {
          // Fetch assessments that tested this CLO
          const [assessmentData] = await connection.query(`
            SELECT 
              ac.id as assessment_id,
              ac.component_name,
              at.type_name as assessment_type,
              ac.total_marks,
              ac.weightage_percentage,
              acm.marks_allocated,
              AVG(sam.marks_obtained / sam.marks_total * 100) as average_performance
            FROM assessment_clo_mapping acm
            JOIN assessment_components ac ON acm.assessment_component_id = ac.id
            JOIN assessment_types at ON ac.assessment_type_id = at.id
            LEFT JOIN student_assessment_marks sam ON ac.id = sam.assessment_component_id
            WHERE acm.clo_id = ?
              AND ac.course_offering_id = ?
            GROUP BY ac.id, ac.component_name, at.type_name, ac.total_marks, ac.weightage_percentage, acm.marks_allocated
            ORDER BY average_performance ASC
          `, [clo.clo_id, courseOfferingId]);

          // Generate recommendations
          const cloRecommendations = [];

          // Recommendation 1: Based on average attainment
          if (clo.average_attainment < minimumThreshold) {
            cloRecommendations.push({
              priority: 'CRITICAL',
              type: 'Overall Performance',
              issue: `Average attainment (${clo.average_attainment.toFixed(2)}%) is below minimum threshold (${minimumThreshold}%)`,
              recommendation: 'Immediate intervention required. Consider:\n' +
                '- Reviewing teaching methodology for this topic\n' +
                '- Providing additional learning resources\n' +
                '- Conducting remedial sessions\n' +
                '- Re-evaluating assessment difficulty level'
            });
          } else {
            cloRecommendations.push({
              priority: 'MEDIUM',
              type: 'Performance Gap',
              issue: `Average attainment (${clo.average_attainment.toFixed(2)}%) is below target (${targetThreshold}%)`,
              recommendation: 'Moderate improvements needed. Consider:\n' +
                '- Enhancing teaching materials\n' +
                '- Providing more practice problems\n' +
                '- Improving assessment feedback mechanisms'
            });
          }

          // Recommendation 2: Based on Bloom's level
          if (clo.bloom_level_number >= 4) {
            cloRecommendations.push({
              priority: 'INFO',
              type: 'Higher Order Thinking',
              issue: `This CLO requires higher-order thinking (${clo.bloom_level_name})`,
              recommendation: 'Focus on developing analytical and evaluative skills:\n' +
                '- Use case studies and real-world examples\n' +
                '- Encourage critical thinking exercises\n' +
                '- Provide scaffolded learning activities'
            });
          }

          // Recommendation 3: Based on assessment performance
          if (assessmentData.length > 0) {
            const worstAssessment = assessmentData[0];
            if (worstAssessment.average_performance < 50) {
              cloRecommendations.push({
                priority: 'HIGH',
                type: 'Assessment Issue',
                issue: `${worstAssessment.component_name} showed poor performance (${worstAssessment.average_performance.toFixed(2)}%)`,
                recommendation: `Review ${worstAssessment.assessment_type} design:\n` +
                  '- Check if questions align with CLO and Bloom level\n' +
                  '- Verify if marks allocation is appropriate\n' +
                  '- Consider if assessment timing was suitable\n' +
                  '- Ensure students had adequate preparation time'
              });
            }
          }

          // Recommendation 4: Based on variance (min vs max)
          const variance = clo.max_attainment - clo.min_attainment;
          if (variance > 50) {
            cloRecommendations.push({
              priority: 'MEDIUM',
              type: 'High Variance',
              issue: `Large performance gap between students (${variance.toFixed(2)}% variance)`,
              recommendation: 'Address learning disparities:\n' +
                '- Identify struggling students early\n' +
                '- Provide differentiated instruction\n' +
                '- Implement peer learning/tutoring programs\n' +
                '- Offer additional support sessions'
            });
          }

          recommendations.push({
            cloId: clo.clo_id,
            cloCode: clo.clo_code,
            cloDescription: clo.clo_description,
            currentAttainment: clo.average_attainment,
            gap: targetThreshold - clo.average_attainment,
            assessments: assessmentData,
            recommendations: cloRecommendations
          });
        }

        // 6. Generate overall recommendations
        const overallRecommendations = [];

        if (criticalCLOs.length > 0) {
          overallRecommendations.push({
            priority: 'CRITICAL',
            type: 'Course-Level Action',
            issue: `${criticalCLOs.length} CLO(s) are below minimum threshold`,
            recommendation: 'Urgent course-level interventions required:\n' +
              '- Schedule department meeting to discuss teaching strategies\n' +
              '- Consider curriculum revision if multiple offerings show same pattern\n' +
              '- Implement continuous assessment and feedback\n' +
              '- Provide faculty development on effective teaching methods'
          });
        }

        if (improvementNeeded.length > 0) {
          overallRecommendations.push({
            priority: 'MEDIUM',
            type: 'Course Enhancement',
            issue: `${improvementNeeded.length} CLO(s) need improvement to reach target`,
            recommendation: 'Enhance course delivery:\n' +
              '- Update course materials and resources\n' +
              '- Increase formative assessments\n' +
              '- Strengthen student engagement activities\n' +
              '- Collect and act on student feedback'
          });
        }

        return {
          course: {
            id: course.id,
            code: course.course_code,
            title: course.course_title,
            department: course.department_name
          },
          offering: {
            id: offering.id,
            semester: offering.semester_name,
            section: offering.section
          },
          thresholds: {
            minimum: minimumThreshold,
            target: targetThreshold
          },
          statistics: {
            totalCLOs: cloSummary.length,
            criticalCLOs: criticalCLOs.length,
            improvementNeeded: improvementNeeded.length,
            attainedCLOs: cloSummary.length - underperformingCLOs.length,
            overallHealthScore: ((cloSummary.length - underperformingCLOs.length) / cloSummary.length * 100).toFixed(2)
          },
          underperformingCLOs: underperformingCLOs.map(clo => ({
            cloId: clo.clo_id,
            cloCode: clo.clo_code,
            cloDescription: clo.clo_description,
            bloomLevel: clo.bloom_level_name,
            currentAttainment: clo.average_attainment,
            attainmentRate: clo.attainment_rate,
            gap: targetThreshold - clo.average_attainment,
            status: clo.average_attainment < minimumThreshold ? 'CRITICAL' : 'NEEDS IMPROVEMENT'
          })),
          recommendations,
          overallRecommendations,
          generatedAt: new Date()
        };

      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error generating gap analysis report:', error);
      throw error;
    }
  }

  /**
   * Helper: Get mapping strength label
   */
  static getMappingStrengthLabel(strength) {
    switch (strength) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'None';
    }
  }
}

module.exports = ReportService;
