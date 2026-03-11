const { param, query, validationResult } = require('express-validator');
const responseHelper = require('../utils/responseHelper');
const ReportService = require('../services/ReportService');
const PDFDocument = require('pdfkit');

/**
 * Report Controller
 * Handles HTTP requests for OBE report generation
 */
class ReportController {
  /**
   * Generate CLO Attainment Report for a course offering
   * GET /api/v1/reports/clo-attainment/:courseOfferingId
   */
  async getCLOAttainmentReport(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { courseOfferingId } = req.params;

      // Generate report
      const report = await ReportService.generateCLOAttainmentReport(parseInt(courseOfferingId));

      return responseHelper.success(
        res,
        report,
        'CLO attainment report generated successfully'
      );
    } catch (error) {
      console.error('CLO Attainment Report Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to generate CLO attainment report'
      );
    }
  }

  /**
   * Generate CLO Attainment Report as PDF
   * GET /api/v1/reports/clo-attainment/:courseOfferingId/pdf
   */
  async getCLOAttainmentReportPDF(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { courseOfferingId } = req.params;

      // Generate report data
      const report = await ReportService.generateCLOAttainmentReport(parseInt(courseOfferingId));

      // Create PDF document
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=CLO_Attainment_Report_${courseOfferingId}.pdf`
      );

      // Pipe PDF to response
      doc.pipe(res);

      // Add content to PDF
      this._generateCLOAttainmentPDF(doc, report);

      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error('CLO Attainment PDF Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to generate CLO attainment PDF'
      );
    }
  }

  /**
   * Generate PLO Attainment Report for a degree/program
   * GET /api/v1/reports/plo-attainment/:degreeId?batch=2023
   */
  async getPLOAttainmentReport(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { degreeId } = req.params;
      const { batch } = req.query;

      // Generate report
      const report = await ReportService.generatePLOAttainmentReport(
        parseInt(degreeId),
        batch ? parseInt(batch) : null
      );

      return responseHelper.success(
        res,
        report,
        'PLO attainment report generated successfully'
      );
    } catch (error) {
      console.error('PLO Attainment Report Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to generate PLO attainment report'
      );
    }
  }

  /**
   * Generate PLO Attainment Report as PDF
   * GET /api/v1/reports/plo-attainment/:degreeId/pdf?batch=2023
   */
  async getPLOAttainmentReportPDF(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { degreeId } = req.params;
      const { batch } = req.query;

      // Generate report data
      const report = await ReportService.generatePLOAttainmentReport(
        parseInt(degreeId),
        batch ? parseInt(batch) : null
      );

      // Create PDF document
      const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=PLO_Attainment_Report_${degreeId}${batch ? '_' + batch : ''}.pdf`
      );

      // Pipe PDF to response
      doc.pipe(res);

      // Add content to PDF
      this._generatePLOAttainmentPDF(doc, report);

      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error('PLO Attainment PDF Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to generate PLO attainment PDF'
      );
    }
  }

  /**
   * Generate CLO-PLO Mapping Report for a course
   * GET /api/v1/reports/clo-plo-mapping/:courseId
   */
  async getCLOPLOMappingReport(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { courseId } = req.params;

      // Generate report
      const report = await ReportService.generateCLOPLOMappingReport(parseInt(courseId));

      return responseHelper.success(
        res,
        report,
        'CLO-PLO mapping report generated successfully'
      );
    } catch (error) {
      console.error('CLO-PLO Mapping Report Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to generate CLO-PLO mapping report'
      );
    }
  }

  /**
   * Generate CLO-PLO Mapping Report as PDF
   * GET /api/v1/reports/clo-plo-mapping/:courseId/pdf
   */
  async getCLOPLOMappingReportPDF(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { courseId } = req.params;

      // Generate report data
      const report = await ReportService.generateCLOPLOMappingReport(parseInt(courseId));

      // Create PDF document
      const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=CLO_PLO_Mapping_Report_${courseId}.pdf`
      );

      // Pipe PDF to response
      doc.pipe(res);

      // Add content to PDF
      this._generateCLOPLOMappingPDF(doc, report);

      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error('CLO-PLO Mapping PDF Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to generate CLO-PLO mapping PDF'
      );
    }
  }

  /**
   * Generate Student OBE Transcript
   * GET /api/v1/reports/student-transcript/:studentId
   */
  async getStudentTranscript(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { studentId } = req.params;

      // Generate report
      const report = await ReportService.generateStudentTranscript(parseInt(studentId));

      return responseHelper.success(
        res,
        report,
        'Student OBE transcript generated successfully'
      );
    } catch (error) {
      console.error('Student Transcript Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to generate student transcript'
      );
    }
  }

  /**
   * Generate Student OBE Transcript as PDF
   * GET /api/v1/reports/student-transcript/:studentId/pdf
   */
  async getStudentTranscriptPDF(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { studentId } = req.params;

      // Generate report data
      const report = await ReportService.generateStudentTranscript(parseInt(studentId));

      // Create PDF document
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=OBE_Transcript_${studentId}.pdf`
      );

      // Pipe PDF to response
      doc.pipe(res);

      // Add content to PDF
      this._generateStudentTranscriptPDF(doc, report);

      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error('Student Transcript PDF Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to generate student transcript PDF'
      );
    }
  }

  /**
   * Generate Gap Analysis Report for a course offering
   * GET /api/v1/reports/gap-analysis/:courseOfferingId
   */
  async getGapAnalysisReport(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { courseOfferingId } = req.params;

      // Generate report
      const report = await ReportService.generateGapAnalysisReport(parseInt(courseOfferingId));

      return responseHelper.success(
        res,
        report,
        'Gap analysis report generated successfully'
      );
    } catch (error) {
      console.error('Gap Analysis Report Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to generate gap analysis report'
      );
    }
  }

  /**
   * Generate Gap Analysis Report as PDF
   * GET /api/v1/reports/gap-analysis/:courseOfferingId/pdf
   */
  async getGapAnalysisReportPDF(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { courseOfferingId } = req.params;

      // Generate report data
      const report = await ReportService.generateGapAnalysisReport(parseInt(courseOfferingId));

      // Create PDF document
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Gap_Analysis_Report_${courseOfferingId}.pdf`
      );

      // Pipe PDF to response
      doc.pipe(res);

      // Add content to PDF
      this._generateGapAnalysisPDF(doc, report);

      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error('Gap Analysis PDF Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to generate gap analysis PDF'
      );
    }
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validation rules for getCLOAttainmentReport
   */
  validateGetCLOAttainmentReport() {
    return [
      param('courseOfferingId')
        .isInt({ min: 1 })
        .withMessage('Course offering ID must be a positive integer')
    ];
  }

  /**
   * Validation rules for getPLOAttainmentReport
   */
  validateGetPLOAttainmentReport() {
    return [
      param('degreeId')
        .isInt({ min: 1 })
        .withMessage('Degree ID must be a positive integer'),
      query('batch')
        .optional()
        .isInt({ min: 1900, max: 2100 })
        .withMessage('Batch year must be a valid year between 1900 and 2100')
    ];
  }

  /**
   * Validation rules for getCLOPLOMappingReport
   */
  validateGetCLOPLOMappingReport() {
    return [
      param('courseId')
        .isInt({ min: 1 })
        .withMessage('Course ID must be a positive integer')
    ];
  }

  /**
   * Validation rules for getStudentTranscript
   */
  validateGetStudentTranscript() {
    return [
      param('studentId')
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer')
    ];
  }

  /**
   * Validation rules for getGapAnalysisReport
   */
  validateGetGapAnalysisReport() {
    return [
      param('courseOfferingId')
        .isInt({ min: 1 })
        .withMessage('Course offering ID must be a positive integer')
    ];
  }

  // ==================== PDF GENERATION HELPERS ====================

  /**
   * Generate CLO Attainment PDF content
   * @private
   */
  _generateCLOAttainmentPDF(doc, report) {
    const { course, clos, students, attainmentMatrix, summary, thresholds } = report;

    // Header
    doc.fontSize(20).text('CLO Attainment Report', { align: 'center' });
    doc.moveDown();

    // Course Information
    doc.fontSize(12).text(`Course: ${course.code} - ${course.title}`);
    doc.text(`Semester: ${course.semester}`);
    doc.text(`Section: ${course.section || 'N/A'}`);
    doc.text(`Instructor: ${course.instructor || 'N/A'}`);
    doc.text(`Total Students: ${students.length}`);
    doc.moveDown();

    // Thresholds
    doc.fontSize(10).text(`Thresholds: Minimum: ${thresholds.minimum}%, Target: ${thresholds.target}%, Excellence: ${thresholds.excellence}%`);
    doc.moveDown();

    // Summary Statistics
    doc.fontSize(14).text('Summary Statistics', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Overall Average Attainment: ${summary.overallAverageAttainment.toFixed(2)}%`);
    doc.text(`Overall Attainment Rate: ${summary.overallAttainmentRate.toFixed(2)}%`);
    doc.moveDown();

    // CLO-wise Summary Table
    doc.fontSize(12).text('CLO-wise Attainment Summary', { underline: true });
    doc.moveDown(0.5);
    
    const tableTop = doc.y;
    const colWidths = [60, 250, 80, 80];
    let y = tableTop;

    // Table headers
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('CLO', 50, y, { width: colWidths[0] });
    doc.text('Description', 110, y, { width: colWidths[1] });
    doc.text('Avg %', 360, y, { width: colWidths[2] });
    doc.text('Attain Rate', 440, y, { width: colWidths[3] });
    
    y += 20;
    doc.moveTo(50, y).lineTo(540, y).stroke();
    y += 5;

    // Table rows
    doc.font('Helvetica');
    summary.cloSummaries.forEach((clo) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(clo.cloCode, 50, y, { width: colWidths[0] });
      doc.text(clo.cloDescription.substring(0, 50) + '...', 110, y, { width: colWidths[1] });
      doc.text(`${clo.averageAttainment.toFixed(1)}%`, 360, y, { width: colWidths[2] });
      doc.text(`${clo.attainmentRate.toFixed(1)}%`, 440, y, { width: colWidths[3] });
      
      y += 30;
    });

    // Footer
    doc.fontSize(8).text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      50,
      750,
      { align: 'center' }
    );
  }

  /**
   * Generate PLO Attainment PDF content
   * @private
   */
  _generatePLOAttainmentPDF(doc, report) {
    const { degree, plos, students, attainmentMatrix, summary, thresholds } = report;

    // Header
    doc.fontSize(20).text('PLO Attainment Report', { align: 'center' });
    doc.moveDown();

    // Program Information
    doc.fontSize(12).text(`Program: ${degree.name}`);
    doc.text(`Department: ${degree.department || 'N/A'}`);
    doc.text(`Faculty: ${degree.faculty || 'N/A'}`);
    doc.text(`Total Students: ${students.length}`);
    if (report.batchYear) {
      doc.text(`Batch Year: ${report.batchYear}`);
    }
    doc.moveDown();

    // Thresholds
    doc.fontSize(10).text(`Thresholds: Minimum: ${thresholds.minimum}%, Target: ${thresholds.target}%, Excellence: ${thresholds.excellence}%`);
    doc.moveDown();

    // Summary Statistics
    doc.fontSize(14).text('Summary Statistics', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Overall Average Attainment: ${summary.overallAverageAttainment.toFixed(2)}%`);
    doc.text(`Overall Attainment Rate: ${summary.overallAttainmentRate.toFixed(2)}%`);
    doc.moveDown();

    // PLO-wise Summary Table
    doc.fontSize(12).text('PLO-wise Attainment Summary', { underline: true });
    doc.moveDown(0.5);
    
    const tableTop = doc.y;
    let y = tableTop;

    // Table headers
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('PLO', 50, y, { width: 60 });
    doc.text('Domain', 110, y, { width: 80 });
    doc.text('Description', 190, y, { width: 280 });
    doc.text('Avg %', 470, y, { width: 80 });
    doc.text('Attain Rate', 550, y, { width: 80 });
    
    y += 20;
    doc.moveTo(50, y).lineTo(750, y).stroke();
    y += 5;

    // Table rows
    doc.font('Helvetica');
    summary.ploSummaries.forEach((plo) => {
      if (y > 500) {
        doc.addPage();
        y = 50;
      }

      doc.text(plo.ploCode, 50, y, { width: 60 });
      doc.text(plo.domain || 'N/A', 110, y, { width: 80 });
      doc.text(plo.ploDescription.substring(0, 60) + '...', 190, y, { width: 280 });
      doc.text(`${plo.averageAttainment.toFixed(1)}%`, 470, y, { width: 80 });
      doc.text(`${plo.attainmentRate.toFixed(1)}%`, 550, y, { width: 80 });
      
      y += 30;
    });

    // Footer
    doc.fontSize(8).text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      50,
      550,
      { align: 'center' }
    );
  }

  /**
   * Generate CLO-PLO Mapping PDF content
   * @private
   */
  _generateCLOPLOMappingPDF(doc, report) {
    const { course, clos, plos, mappingMatrix, summary } = report;

    // Header
    doc.fontSize(20).text('CLO-PLO Mapping Report', { align: 'center' });
    doc.moveDown();

    // Course Information
    doc.fontSize(12).text(`Course: ${course.code} - ${course.title}`);
    doc.text(`Program: ${course.program || 'N/A'}`);
    doc.moveDown();

    // Summary
    doc.fontSize(10);
    doc.text(`Total CLOs: ${clos.length}`);
    doc.text(`Total PLOs: ${plos.length}`);
    doc.text(`Total Mappings: ${summary.totalMappings}`);
    doc.moveDown();

    // Mapping Legend
    doc.text('Mapping Strength: 1 = Low, 2 = Medium, 3 = High');
    doc.moveDown();

    // Note about matrix
    doc.fontSize(9).text('Note: Due to space constraints, detailed matrix is available in JSON format or web view.');
    
    // Footer
    doc.fontSize(8).text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      50,
      750,
      { align: 'center' }
    );
  }

  /**
   * Generate Student Transcript PDF content
   * @private
   */
  _generateStudentTranscriptPDF(doc, report) {
    const { student, courses, cloAttainment, ploAttainment, summary } = report;

    // Header
    doc.fontSize(20).text('OBE Student Transcript', { align: 'center' });
    doc.moveDown();

    // Student Information
    doc.fontSize(12).text(`Student: ${student.name}`);
    doc.text(`ID: ${student.studentId}`);
    doc.text(`Program: ${student.program || 'N/A'}`);
    doc.text(`Batch: ${student.batch || 'N/A'}`);
    doc.moveDown();

    // Academic Summary
    doc.fontSize(14).text('Academic Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Total Credits: ${summary.totalCredits}`);
    doc.text(`Credits Earned: ${summary.creditsEarned}`);
    doc.text(`CGPA: ${summary.cgpa ? summary.cgpa.toFixed(2) : 'N/A'}`);
    doc.text(`Courses Completed: ${summary.coursesCompleted}`);
    doc.moveDown();

    // OBE Summary
    doc.fontSize(14).text('OBE Performance Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Total CLOs: ${summary.totalCLOs}`);
    doc.text(`CLO Attainment Rate: ${summary.cloAttainmentRate.toFixed(2)}%`);
    doc.text(`Total PLOs: ${summary.totalPLOs}`);
    doc.text(`PLO Attainment Rate: ${summary.ploAttainmentRate.toFixed(2)}%`);
    doc.text(`Overall OBE Status: ${summary.overallStatus}`);
    doc.moveDown();

    // Course-wise CLO Attainment
    doc.fontSize(12).text('Course-wise CLO Attainment', { underline: true });
    doc.moveDown(0.5);
    
    let y = doc.y;
    courses.slice(0, 5).forEach((course) => {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`${course.courseCode} - ${course.courseTitle}`, 50, y);
      y += 15;
      
      doc.fontSize(9).font('Helvetica');
      doc.text(`Grade: ${course.grade || 'N/A'} | Credits: ${course.credits}`, 50, y);
      y += 15;
      doc.text(`CLO Attainment: ${course.cloAttainment.toFixed(1)}%`, 50, y);
      y += 20;
    });

    if (courses.length > 5) {
      doc.fontSize(9).text(`... and ${courses.length - 5} more courses`, 50, y);
    }

    // Footer
    doc.fontSize(8).text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      50,
      750,
      { align: 'center' }
    );
  }

  /**
   * Generate Gap Analysis PDF content
   * @private
   */
  _generateGapAnalysisPDF(doc, report) {
    const { course, underperformingCLOs, recommendations, overallRecommendations, summary } = report;

    // Header
    doc.fontSize(20).text('Gap Analysis Report', { align: 'center' });
    doc.moveDown();

    // Course Information
    doc.fontSize(12).text(`Course: ${course.code} - ${course.title}`);
    doc.text(`Semester: ${course.semester}`);
    doc.text(`Section: ${course.section || 'N/A'}`);
    doc.moveDown();

    // Overall Health Score
    doc.fontSize(14).text('Overall Course Health', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Health Score: ${summary.healthScore}/100`);
    doc.text(`Critical CLOs: ${summary.criticalCLOs}`);
    doc.text(`CLOs Needing Improvement: ${summary.needsImprovementCLOs}`);
    doc.moveDown();

    // Underperforming CLOs
    doc.fontSize(12).text('Underperforming CLOs', { underline: true });
    doc.moveDown(0.5);
    
    let y = doc.y;
    underperformingCLOs.forEach((clo, index) => {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`${index + 1}. ${clo.cloCode}: ${clo.status.toUpperCase()}`, 50, y);
      y += 15;
      
      doc.fontSize(9).font('Helvetica');
      doc.text(`Attainment: ${clo.attainment.toFixed(1)}% | Gap: ${clo.gap.toFixed(1)}%`, 50, y);
      y += 15;
      doc.text(clo.cloDescription.substring(0, 80) + '...', 50, y);
      y += 25;
    });

    // Overall Recommendations
    doc.fontSize(12).text('Recommendations', { underline: true });
    doc.moveDown(0.5);
    
    y = doc.y;
    overallRecommendations.slice(0, 5).forEach((rec, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.fontSize(9);
      doc.text(`${index + 1}. ${rec}`, 50, y, { width: 500 });
      y += 20;
    });

    // Footer
    doc.fontSize(8).text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      50,
      750,
      { align: 'center' }
    );
  }
}

module.exports = new ReportController();
