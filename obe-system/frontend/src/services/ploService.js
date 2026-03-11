import api from './api';

/**
 * PLO (Program Learning Outcome) Service
 * API methods for PLO-related operations
 */
const ploService = {
  /**
   * Get all PLOs with optional filters
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with PLOs data
   */
  getAll: async (params = {}) => {
    const response = await api.get('/plos', { params });
    return response;
  },

  /**
   * Get PLOs by degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise} API response with PLOs data
   */
  getByDegree: async (degreeId) => {
    const response = await api.get('/plos', { 
      params: { degree_id: degreeId } 
    });
    return response;
  },

  /**
   * Get a single PLO by ID
   * @param {number} id - PLO ID
   * @returns {Promise} API response with PLO data
   */
  getById: async (id) => {
    const response = await api.get(`/plos/${id}`);
    return response;
  },

  /**
   * Create a new PLO
   * @param {Object} data - PLO data
   * @param {number} data.degree_id - Degree ID
   * @param {string} data.plo_code - PLO code (e.g., PLO1, PLO2)
   * @param {string} data.description - PLO description
   * @param {string} data.domain - Domain (Cognitive/Affective/Psychomotor)
   * @returns {Promise} API response with created PLO
   */
  create: async (data) => {
    const response = await api.post('/plos', data);
    return response;
  },

  /**
   * Update an existing PLO
   * @param {number} id - PLO ID
   * @param {Object} data - Updated PLO data
   * @returns {Promise} API response with updated PLO
   */
  update: async (id, data) => {
    const response = await api.put(`/plos/${id}`, data);
    return response;
  },

  /**
   * Delete a PLO
   * @param {number} id - PLO ID
   * @returns {Promise} API response confirming deletion
   */
  delete: async (id) => {
    const response = await api.delete(`/plos/${id}`);
    return response;
  },

  /**
   * Get CLO mappings for a PLO
   * @param {number} id - PLO ID
   * @returns {Promise} API response with CLO mappings
   */
  getCLOMappings: async (id) => {
    const response = await api.get(`/plos/${id}/clo-mappings`);
    return response;
  },

  /**
   * Get PEO mappings for a PLO
   * @param {number} id - PLO ID
   * @returns {Promise} API response with PEO mappings
   */
  getPEOMappings: async (id) => {
    const response = await api.get(`/plos/${id}/peo-mappings`);
    return response;
  },

  /**
   * Get next PLO code for a degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise} API response with next PLO code
   */
  getNextCode: async (degreeId) => {
    const response = await api.get('/plos/next-code', {
      params: { degree_id: degreeId }
    });
    return response;
  },
};

export default ploService;
