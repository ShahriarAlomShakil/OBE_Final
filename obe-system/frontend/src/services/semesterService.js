import api from './api';

/**
 * Semester Service
 * API methods for semester operations
 */
const semesterService = {
  /**
   * Get all semesters
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with semesters data
   */
  getAll: async (params = {}) => {
    const response = await api.get('/semesters', { params });
    return response;
  },

  /**
   * Get active semesters only
   * @returns {Promise} API response with active semesters
   */
  getActive: async () => {
    const response = await api.get('/semesters/active');
    return response;
  },

  /**
   * Get a single semester by ID
   * @param {number} id - Semester ID
   * @returns {Promise} API response with semester data
   */
  getById: async (id) => {
    const response = await api.get(`/semesters/${id}`);
    return response;
  },

  /**
   * Get current semester
   * @returns {Promise} API response with current semester
   */
  getCurrent: async () => {
    const response = await api.get('/semesters/current');
    return response;
  },

  /**
   * Create a new semester
   * @param {Object} data - Semester data
   * @returns {Promise} API response with created semester
   */
  create: async (data) => {
    const response = await api.post('/semesters', data);
    return response;
  },

  /**
   * Update an existing semester
   * @param {number} id - Semester ID
   * @param {Object} data - Updated semester data
   * @returns {Promise} API response with updated semester
   */
  update: async (id, data) => {
    const response = await api.put(`/semesters/${id}`, data);
    return response;
  },

  /**
   * Delete a semester
   * @param {number} id - Semester ID
   * @returns {Promise} API response
   */
  delete: async (id) => {
    const response = await api.delete(`/semesters/${id}`);
    return response;
  },
};

export default semesterService;
