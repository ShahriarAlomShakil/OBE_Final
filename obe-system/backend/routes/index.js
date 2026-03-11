const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const facultyRoutes = require('./faculties');
const departmentRoutes = require('./departments');
const degreeRoutes = require('./degrees');
const courseRoutes = require('./courses');
const courseOfferingRoutes = require('./course-offerings');
const semesterRoutes = require('./semesters');
const studentRoutes = require('./students');
const teacherRoutes = require('./teachers');
const enrollmentRoutes = require('./enrollments');
const cloRoutes = require('./clos');
const ploRoutes = require('./plos');
const peoRoutes = require('./peos');
const cloPloMappingRoutes = require('./clo-plo-mappings');
const bloomTaxonomyRoutes = require('./bloom-taxonomy');
const assessmentRoutes = require('./assessments');
const questionRoutes = require('./questions');
const marksRoutes = require('./marks');
const attainmentRoutes = require('./attainment');
const settingsRoutes = require('./settings');
const reportRoutes = require('./reports');

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/faculties', facultyRoutes);
router.use('/departments', departmentRoutes);
router.use('/degrees', degreeRoutes);
router.use('/courses', courseRoutes);
router.use('/course-offerings', courseOfferingRoutes);
router.use('/semesters', semesterRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/clos', cloRoutes);
router.use('/plos', ploRoutes);
router.use('/peos', peoRoutes);
router.use('/clo-plo-mappings', cloPloMappingRoutes);
router.use('/bloom-taxonomy', bloomTaxonomyRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/questions', questionRoutes);
router.use('/marks', marksRoutes);
router.use('/attainment', attainmentRoutes);
router.use('/settings', settingsRoutes);
router.use('/reports', reportRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'OBE System API is running',
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to OBE System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      faculties: '/api/v1/faculties',
      departments: '/api/v1/departments',
      degrees: '/api/v1/degrees',
      courses: '/api/v1/courses',
      courseOfferings: '/api/v1/course-offerings',
      semesters: '/api/v1/semesters',
      students: '/api/v1/students',
      teachers: '/api/v1/teachers',
      enrollments: '/api/v1/enrollments',
      clos: '/api/v1/clos',
      plos: '/api/v1/plos',
      peos: '/api/v1/peos',
      cloPloMappings: '/api/v1/clo-plo-mappings',
      bloomTaxonomy: '/api/v1/bloom-taxonomy',
      assessments: '/api/v1/assessments',
      questions: '/api/v1/questions',
      marks: '/api/v1/marks',
      attainment: '/api/v1/attainment',
      settings: '/api/v1/settings',
      reports: '/api/v1/reports',
      health: '/api/v1/health'
    }
  });
});

module.exports = router;
