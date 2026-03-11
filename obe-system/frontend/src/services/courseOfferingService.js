import api from './api';

/**
 * Course Offering Service
 * API methods for course offering operations
 */
const courseOfferingService = {
  /**
   * Get all course offerings with optional pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {number} params.semester_id - Filter by semester
   * @param {number} params.teacher_id - Filter by teacher
   * @param {number} params.course_id - Filter by course
   * @param {boolean} params.is_active - Filter by active status
   * @returns {Promise} API response with course offerings data
   */
  getAll: async (params = {}) => {
    const response = await api.get('/course-offerings', { params });
    return response;
  },

  /**
   * Get active course offerings only
   * @returns {Promise} API response with active course offerings
   */
  getActive: async () => {
    const response = await api.get('/course-offerings/active');
    return response;
  },

  /**
   * Get a single course offering by ID
   * @param {number} id - Course offering ID
   * @returns {Promise} API response with course offering data
   */
  getById: async (id) => {
    const response = await api.get(`/course-offerings/${id}`);
    return response;
  },

  /**
   * Create a new course offering
   * @param {Object} data - Course offering data
   * @param {number} data.course_id - Course ID
   * @param {number} data.semester_id - Semester ID
   * @param {number} data.teacher_id - Teacher ID
   * @param {string} data.section - Section (e.g., "A", "B", "C")
   * @param {number} data.max_students - Maximum number of students
   * @param {boolean} data.is_active - Active status (default: true)
   * @returns {Promise} API response with created course offering
   */
  create: async (data) => {
    const response = await api.post('/course-offerings', data);
    return response;
  },

  /**
   * Update an existing course offering
   * @param {number} id - Course offering ID
   * @param {Object} data - Updated course offering data
   * @returns {Promise} API response with updated course offering
   */
  update: async (id, data) => {
    const response = await api.put(`/course-offerings/${id}`, data);
    return response;
  },

  /**
   * Delete a course offering
   * @param {number} id - Course offering ID
   * @returns {Promise} API response
   */
  delete: async (id) => {
    const response = await api.delete(`/course-offerings/${id}`);
    return response;
  },

  /**
   * Get all students enrolled in a course offering
   * @param {number} id - Course offering ID
   * @returns {Promise} API response with enrolled students
   */
  getEnrolledStudents: async (id) => {
    const response = await api.get(`/course-offerings/${id}/students`);
    return response;
  },

  /**
   * Get all assessments for a course offering
   * @param {number} id - Course offering ID
   * @returns {Promise} API response with assessments
   */
  getAssessments: async (id) => {
    const response = await api.get(`/course-offerings/${id}/assessments`);
    return response;
  },

  /**
   * Get CLO attainment summary for a course offering
   * @param {number} id - Course offering ID
   * @returns {Promise} API response with CLO attainment data
   */
  getCLOAttainment: async (id) => {
    const response = await api.get(`/course-offerings/${id}/clo-attainment`);
    return response;
  },

  /**
   * Get statistics for a course offering
   * @param {number} id - Course offering ID
   * @returns {Promise} API response with statistics
   */
  getStatistics: async (id) => {
    const response = await api.get(`/course-offerings/${id}/statistics`);
    return response;
  },

  /**
   * Enroll a student in a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {number} studentId - Student ID
   * @returns {Promise} API response
   */
  enrollStudent: async (courseOfferingId, studentId) => {
    const response = await api.post(`/course-offerings/${courseOfferingId}/enroll`, {
      student_id: studentId
    });
    return response;
  },

  /**
   * Bulk enroll students in a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {Array<number>} studentIds - Array of student IDs
   * @returns {Promise} API response
   */
  bulkEnroll: async (courseOfferingId, studentIds) => {
    const response = await api.post(`/course-offerings/${courseOfferingId}/bulk-enroll`, {
      student_ids: studentIds
    });
    return response;
  },

  /**
   * Drop a student from a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {number} studentId - Student ID
   * @returns {Promise} API response
   */
  dropStudent: async (courseOfferingId, studentId) => {
    const response = await api.post(`/course-offerings/${courseOfferingId}/drop`, {
      student_id: studentId
    });
    return response;
  },

  /**
   * Get course offerings by semester
   * @param {number} semesterId - Semester ID
   * @returns {Promise} API response with course offerings
   */
  getBySemester: async (semesterId) => {
    const response = await api.get(`/semesters/${semesterId}/course-offerings`);
    return response;
  },

  /**
   * Get course offerings by teacher
   * @param {number} teacherId - Teacher ID
   * @returns {Promise} API response with course offerings
   */
  getByTeacher: async (teacherId) => {
    const response = await api.get(`/teachers/${teacherId}/course-offerings`);
    return response;
  },

  /**
   * Get course offerings by course
   * @param {number} courseId - Course ID
   * @returns {Promise} API response with course offerings
   */
  getByCourse: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/offerings`);
    return response;
  },
};

export default courseOfferingService;
