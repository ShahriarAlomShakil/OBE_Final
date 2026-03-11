import api from './api';

/**
 * Student Service
 * Handles all student-related API calls
 */

const studentService = {
  /**
   * Get student statistics
   * @returns {Promise} Response with student stats
   */
  getStats: async () => {
    try {
      const response = await api.get('/students/stats');
      return response;
    } catch (error) {
      console.error('Error fetching student stats:', error);
      throw error;
    }
  },

  /**
   * Get all active students
   * @returns {Promise} Response with active students
   */
  getActive: async () => {
    try {
      const response = await api.get('/students/active');
      return response;
    } catch (error) {
      console.error('Error fetching active students:', error);
      throw error;
    }
  },

  /**
   * Get all students
   * @param {Object} params - Query parameters (page, limit, etc.)
   * @returns {Promise} Response with students list
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/students', { params });
      return response;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  /**
   * Get student by ID
   * @param {number} id - Student ID
   * @returns {Promise} Response with student data
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/students/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search students
   * @param {string} query - Search query
   * @returns {Promise} Response with search results
   */
  search: async (query) => {
    try {
      const response = await api.get('/students/search', { params: { q: query } });
      return response;
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  },

  /**
   * Get students by department
   * @param {number} departmentId - Department ID
   * @returns {Promise} Response with students
   */
  getByDepartment: async (departmentId) => {
    try {
      const response = await api.get('/students/by-department', { params: { departmentId } });
      return response;
    } catch (error) {
      console.error('Error fetching students by department:', error);
      throw error;
    }
  },

  /**
   * Create a new student
   * @param {Object} studentData - Student data
   * @returns {Promise} Response with created student
   */
  create: async (studentData) => {
    try {
      const response = await api.post('/students', studentData);
      return response;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  /**
   * Update a student
   * @param {number} id - Student ID
   * @param {Object} studentData - Updated student data
   * @returns {Promise} Response with updated student
   */
  update: async (id, studentData) => {
    try {
      const response = await api.put(`/students/${id}`, studentData);
      return response;
    } catch (error) {
      console.error(`Error updating student ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a student
   * @param {number} id - Student ID
   * @returns {Promise} Response
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/students/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting student ${id}:`, error);
      throw error;
    }
  },
};

export default studentService;
