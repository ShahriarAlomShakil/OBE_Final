import api from './api';

/**
 * CLO-PLO Mapping Service
 * API methods for CLO-PLO mapping operations
 */
const cloPloMappingService = {
  /**
   * Get all CLO-PLO mappings with optional filters
   * @param {Object} params - Query parameters (course_id, clo_id, plo_id, degree_id)
   * @returns {Promise} API response with mappings data
   */
  getAll: async (params = {}) => {
    const response = await api.get('/clo-plo-mappings', { params });
    return response;
  },

  /**
   * Get CLO-PLO mapping matrix for a course
   * @param {number} courseId - Course ID
   * @returns {Promise} API response with matrix data (course, clos, plos, matrix)
   */
  getMatrix: async (courseId) => {
    const response = await api.get(`/clo-plo-mappings/matrix/${courseId}`);
    return response;
  },

  /**
   * Get a single CLO-PLO mapping by ID
   * @param {number} id - Mapping ID
   * @returns {Promise} API response with mapping data
   */
  getById: async (id) => {
    const response = await api.get(`/clo-plo-mappings/${id}`);
    return response;
  },

  /**
   * Create a new CLO-PLO mapping
   * @param {Object} data - Mapping data
   * @param {number} data.clo_id - CLO ID
   * @param {number} data.plo_id - PLO ID
   * @param {number} data.mapping_strength - Strength (1=Low, 2=Medium, 3=High)
   * @returns {Promise} API response with created mapping
   */
  create: async (data) => {
    const response = await api.post('/clo-plo-mappings', data);
    return response;
  },

  /**
   * Update an existing CLO-PLO mapping strength
   * @param {number} id - Mapping ID
   * @param {number} strength - New mapping strength (1-3)
   * @returns {Promise} API response with updated mapping
   */
  update: async (id, strength) => {
    const response = await api.put(`/clo-plo-mappings/${id}`, {
      mapping_strength: strength
    });
    return response;
  },

  /**
   * Delete a CLO-PLO mapping
   * @param {number} id - Mapping ID
   * @returns {Promise} API response confirming deletion
   */
  delete: async (id) => {
    const response = await api.delete(`/clo-plo-mappings/${id}`);
    return response;
  },

  /**
   * Bulk update CLO-PLO mappings (create/update)
   * @param {Array} mappings - Array of mapping objects
   * @param {number} mappings[].clo_id - CLO ID
   * @param {number} mappings[].plo_id - PLO ID
   * @param {number} mappings[].mapping_strength - Strength (1-3)
   * @returns {Promise} API response with processed mappings
   */
  bulkUpdate: async (mappings) => {
    const response = await api.post('/clo-plo-mappings/bulk', { mappings });
    return response;
  },

  /**
   * Update entire matrix for a course
   * @param {number} courseId - Course ID
   * @param {Object} matrix - Matrix object with CLO IDs as keys, PLO IDs as nested keys, strength as values
   * @returns {Promise} API response confirming update
   */
  updateMatrix: async (courseId, matrix) => {
    // Convert matrix object to array of mappings
    const mappings = [];
    
    Object.keys(matrix).forEach(cloId => {
      Object.keys(matrix[cloId]).forEach(ploId => {
        const strength = matrix[cloId][ploId];
        if (strength && strength >= 1 && strength <= 3) {
          mappings.push({
            clo_id: parseInt(cloId),
            plo_id: parseInt(ploId),
            mapping_strength: strength
          });
        }
      });
    });

    return this.bulkUpdate(mappings);
  },

  /**
   * Delete mapping by CLO and PLO IDs
   * @param {number} cloId - CLO ID
   * @param {number} ploId - PLO ID
   * @returns {Promise} API response confirming deletion
   */
  deleteByCLOAndPLO: async (cloId, ploId) => {
    const response = await api.delete('/clo-plo-mappings', {
      params: { clo_id: cloId, plo_id: ploId }
    });
    return response;
  },
};

export default cloPloMappingService;
