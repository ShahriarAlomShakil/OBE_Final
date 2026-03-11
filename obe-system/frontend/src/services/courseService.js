import api from './api';

/**
 * Course Service
 * API methods for course-related operations
 */
const courseService = {
  /**
   * Get all courses with optional pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.search - Search by code or title
   * @param {number} params.department_id - Filter by department ID
   * @param {string} params.status - Filter by status (active/inactive)
   * @returns {Promise} API response with courses data
   */
  getAll: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response;
  },

  /**
   * Get active courses only
   * @returns {Promise} API response with active courses
   */
  getActive: async () => {
    const response = await api.get('/courses/active');
    return response;
  },

  /**
   * Get total count of courses
   * @param {Object} filters - Optional filters (e.g., department_id, is_active)
   * @returns {Promise} API response with course count
   */
  getCount: async (filters = {}) => {
    const response = await api.get('/courses/count', { params: filters });
    return response;
  },

  /**
   * Search courses by query
   * @param {string} query - Search query
   * @returns {Promise} API response with matching courses
   */
  search: async (query) => {
    const response = await api.get('/courses/search', { params: { q: query } });
    return response;
  },

  /**
   * Get a single course by ID
   * @param {number} id - Course ID
   * @returns {Promise} API response with course data
   */
  getById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response;
  },

  /**
   * Get course with department details
   * @param {number} id - Course ID
   * @returns {Promise} API response with course and department
   */
  getWithDepartment: async (id) => {
    const response = await api.get(`/courses/${id}/department`);
    return response;
  },

  /**
   * Get course with all relations (CLOs, objectives, etc.)
   * @param {number} id - Course ID
   * @returns {Promise} API response with course and relations
   */
  getWithRelations: async (id) => {
    const response = await api.get(`/courses/${id}/relations`);
    return response;
  },

  /**
   * Get course statistics
   * @param {number} id - Course ID
   * @returns {Promise} API response with statistics
   */
  getStatistics: async (id) => {
    const response = await api.get(`/courses/${id}/statistics`);
    return response;
  },

  /**
   * Get course CLOs
   * @param {number} id - Course ID
   * @returns {Promise} API response with CLOs
   */
  getCLOs: async (id) => {
    const response = await api.get(`/courses/${id}/clos`);
    return response;
  },

  /**
   * Get course objectives
   * @param {number} id - Course ID
   * @returns {Promise} API response with objectives
   */
  getObjectives: async (id) => {
    const response = await api.get(`/courses/${id}/objectives`);
    return response;
  },

  /**
   * Get course offerings
   * @param {number} id - Course ID
   * @returns {Promise} API response with offerings
   */
  getOfferings: async (id) => {
    const response = await api.get(`/courses/${id}/offerings`);
    return response;
  },

  /**
   * Get course prerequisites
   * @param {number} id - Course ID
   * @returns {Promise} API response with prerequisites
   */
  getPrerequisites: async (id) => {
    const response = await api.get(`/courses/${id}/prerequisites`);
    return response;
  },

  /**
   * Get courses that depend on this course
   * @param {number} id - Course ID
   * @returns {Promise} API response with dependent courses
   */
  getDependentCourses: async (id) => {
    const response = await api.get(`/courses/${id}/dependent-courses`);
    return response;
  },

  /**
   * Create a new course
   * @param {Object} data - Course data
   * @param {string} data.code - Course code (e.g., CS101)
   * @param {string} data.title - Course title
   * @param {number} data.department_id - Department ID
   * @param {number} data.credit_hours - Credit hours
   * @param {number} data.theory_hours - Theory hours per week
   * @param {number} data.lab_hours - Lab hours per week
   * @param {string} data.description - Course description
   * @param {Array} data.prerequisites - Array of prerequisite course IDs
   * @returns {Promise} API response with created course
   */
  create: async (data) => {
    const response = await api.post('/courses', data);
    return response;
  },

  /**
   * Update an existing course
   * @param {number} id - Course ID
   * @param {Object} data - Updated course data
   * @returns {Promise} API response with updated course
   */
  update: async (id, data) => {
    const response = await api.put(`/courses/${id}`, data);
    return response;
  },

  /**
   * Toggle course status (active/inactive)
   * @param {number} id - Course ID
   * @returns {Promise} API response with updated course
   */
  toggleStatus: async (id) => {
    const response = await api.patch(`/courses/${id}/toggle-status`);
    return response;
  },

  /**
   * Delete a course
   * @param {number} id - Course ID
   * @returns {Promise} API response confirming deletion
   */
  delete: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response;
  },
};

export default courseService;
