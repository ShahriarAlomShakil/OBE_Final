import api from './api';

/**
 * Department Service
 * API methods for department-related operations
 */
const departmentService = {
  /**
   * Get all departments with optional pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise} API response with departments data
   */
  getAll: async (params = {}) => {
    const response = await api.get('/departments', { params });
    return response;
  },

  /**
   * Get active departments only
   * @returns {Promise} API response with active departments
   */
  getActive: async () => {
    const response = await api.get('/departments/active');
    return response;
  },

  /**
   * Search departments by name, short name, or code
   * @param {string} query - Search query
   * @returns {Promise} API response with matching departments
   */
  search: async (query) => {
    const response = await api.get('/departments/search', { params: { q: query } });
    return response;
  },

  /**
   * Get a single department by ID
   * @param {number} id - Department ID
   * @returns {Promise} API response with department data
   */
  getById: async (id) => {
    const response = await api.get(`/departments/${id}`);
    return response;
  },

  /**
   * Get department with faculty details
   * @param {number} id - Department ID
   * @returns {Promise} API response with department and faculty
   */
  getWithFaculty: async (id) => {
    const response = await api.get(`/departments/${id}/faculty`);
    return response;
  },

  /**
   * Get department with all relations
   * @param {number} id - Department ID
   * @returns {Promise} API response with department and relations
   */
  getWithRelations: async (id) => {
    const response = await api.get(`/departments/${id}/relations`);
    return response;
  },

  /**
   * Get department statistics
   * @param {number} id - Department ID
   * @returns {Promise} API response with statistics
   */
  getStatistics: async (id) => {
    const response = await api.get(`/departments/${id}/statistics`);
    return response;
  },

  /**
   * Get department courses
   * @param {number} id - Department ID
   * @returns {Promise} API response with courses
   */
  getCourses: async (id) => {
    const response = await api.get(`/departments/${id}/courses`);
    return response;
  },

  /**
   * Get department teachers
   * @param {number} id - Department ID
   * @returns {Promise} API response with teachers
   */
  getTeachers: async (id) => {
    const response = await api.get(`/departments/${id}/teachers`);
    return response;
  },

  /**
   * Create a new department
   * @param {Object} data - Department data
   * @returns {Promise} API response with created department
   */
  create: async (data) => {
    const response = await api.post('/departments', data);
    return response;
  },

  /**
   * Update an existing department
   * @param {number} id - Department ID
   * @param {Object} data - Updated department data
   * @returns {Promise} API response with updated department
   */
  update: async (id, data) => {
    const response = await api.put(`/departments/${id}`, data);
    return response;
  },

  /**
   * Toggle department status (active/inactive)
   * @param {number} id - Department ID
   * @returns {Promise} API response with updated department
   */
  toggleStatus: async (id) => {
    const response = await api.patch(`/departments/${id}/toggle-status`);
    return response;
  },

  /**
   * Delete a department
   * @param {number} id - Department ID
   * @returns {Promise} API response confirming deletion
   */
  delete: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response;
  },
};

export default departmentService;
