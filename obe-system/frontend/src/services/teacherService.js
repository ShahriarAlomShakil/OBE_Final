import api from './api';

/**
 * Teacher Service
 * API methods for teacher operations
 */
const teacherService = {
  /**
   * Get all teachers with optional pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {number} params.department_id - Filter by department
   * @returns {Promise} API response with teachers data
   */
  getAll: async (params = {}) => {
    const response = await api.get('/teachers', { params });
    return response;
  },

  /**
   * Get active teachers only
   * @returns {Promise} API response with active teachers
   */
  getActive: async () => {
    const response = await api.get('/teachers/active');
    return response;
  },

  /**
   * Get a single teacher by ID
   * @param {number} id - Teacher ID
   * @returns {Promise} API response with teacher data
   */
  getById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response;
  },

  /**
   * Get teachers by department
   * @param {number} departmentId - Department ID
   * @returns {Promise} API response with teachers
   */
  getByDepartment: async (departmentId) => {
    const response = await api.get(`/departments/${departmentId}/teachers`);
    return response;
  },

  /**
   * Create a new teacher
   * @param {Object} data - Teacher data
   * @returns {Promise} API response with created teacher
   */
  create: async (data) => {
    const response = await api.post('/teachers', data);
    return response;
  },

  /**
   * Update an existing teacher
   * @param {number} id - Teacher ID
   * @param {Object} data - Updated teacher data
   * @returns {Promise} API response with updated teacher
   */
  update: async (id, data) => {
    const response = await api.put(`/teachers/${id}`, data);
    return response;
  },

  /**
   * Delete a teacher
   * @param {number} id - Teacher ID
   * @returns {Promise} API response
   */
  delete: async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response;
  },

  /**
   * Get course offerings for a teacher
   * @param {number} teacherId - Teacher ID
   * @returns {Promise} API response with course offerings
   */
  getCourseOfferings: async (teacherId) => {
    const response = await api.get(`/teachers/${teacherId}/course-offerings`);
    return response;
  },
};

export default teacherService;
