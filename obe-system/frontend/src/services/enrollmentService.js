import api from './api';

/**
 * Enrollment Service
 * API methods for course enrollment operations
 */
const enrollmentService = {
  /**
   * Get all enrollments with optional filters
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with enrollments data
   */
  getAll: async (params = {}) => {
    const response = await api.get('/enrollments', { params });
    return response;
  },

  /**
   * Get enrollments by course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise} API response with enrollments
   */
  getByCourseOffering: async (courseOfferingId) => {
    const response = await api.get(`/course-offerings/${courseOfferingId}/enrollments`);
    return response;
  },

  /**
   * Get enrollments by student
   * @param {number} studentId - Student ID
   * @returns {Promise} API response with enrollments
   */
  getByStudent: async (studentId) => {
    const response = await api.get(`/students/${studentId}/enrollments`);
    return response;
  },

  /**
   * Get a single enrollment by ID
   * @param {number} id - Enrollment ID
   * @returns {Promise} API response with enrollment data
   */
  getById: async (id) => {
    const response = await api.get(`/enrollments/${id}`);
    return response;
  },

  /**
   * Enroll a student in a course offering
   * @param {Object} data - Enrollment data
   * @param {number} data.course_offering_id - Course offering ID
   * @param {number} data.student_id - Student ID
   * @returns {Promise} API response with created enrollment
   */
  enroll: async (data) => {
    const response = await api.post('/enrollments', data);
    return response;
  },

  /**
   * Bulk enroll students in a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {Array<number>} studentIds - Array of student IDs
   * @returns {Promise} API response with enrollment results
   */
  bulkEnroll: async (courseOfferingId, studentIds) => {
    const response = await api.post('/enrollments/bulk', {
      course_offering_id: courseOfferingId,
      student_ids: studentIds
    });
    return response;
  },

  /**
   * Update an enrollment
   * @param {number} id - Enrollment ID
   * @param {Object} data - Updated enrollment data
   * @returns {Promise} API response with updated enrollment
   */
  update: async (id, data) => {
    const response = await api.put(`/enrollments/${id}`, data);
    return response;
  },

  /**
   * Drop a student from a course (delete enrollment)
   * @param {number} id - Enrollment ID
   * @returns {Promise} API response
   */
  drop: async (id) => {
    const response = await api.delete(`/enrollments/${id}`);
    return response;
  },

  /**
   * Get enrollment statistics for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise} API response with statistics
   */
  getStatistics: async (courseOfferingId) => {
    const response = await api.get(`/course-offerings/${courseOfferingId}/enrollment-stats`);
    return response;
  },
};

export default enrollmentService;
