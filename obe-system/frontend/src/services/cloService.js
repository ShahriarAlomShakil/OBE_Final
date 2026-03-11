import api from './api';

/**
 * CLO (Course Learning Outcome) Service
 * API methods for CLO-related operations
 */
const cloService = {
  /**
   * Get all CLOs for a course
   * @param {number} courseId - Course ID
   * @returns {Promise} API response with CLOs data
   */
  getByCourse: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/clos`);
    return response;
  },

  /**
   * Get a single CLO by ID
   * @param {number} id - CLO ID
   * @returns {Promise} API response with CLO data
   */
  getById: async (id) => {
    const response = await api.get(`/clos/${id}`);
    return response;
  },

  /**
   * Create a new CLO
   * @param {number} courseId - Course ID
   * @param {Object} data - CLO data
   * @param {string} data.code - CLO code (e.g., CLO1, CLO2)
   * @param {string} data.description - CLO description
   * @param {number} data.bloom_level_id - Bloom taxonomy level (1-6)
   * @param {number} data.order - Display order (optional)
   * @returns {Promise} API response with created CLO
   */
  create: async (courseId, data) => {
    const response = await api.post(`/courses/${courseId}/clos`, data);
    return response;
  },

  /**
   * Update an existing CLO
   * @param {number} id - CLO ID
   * @param {Object} data - Updated CLO data
   * @returns {Promise} API response with updated CLO
   */
  update: async (id, data) => {
    const response = await api.put(`/clos/${id}`, data);
    return response;
  },

  /**
   * Delete a CLO
   * @param {number} id - CLO ID
   * @returns {Promise} API response confirming deletion
   */
  delete: async (id) => {
    const response = await api.delete(`/clos/${id}`);
    return response;
  },

  /**
   * Reorder CLOs
   * @param {number} courseId - Course ID
   * @param {Array} cloOrders - Array of {id, order} objects
   * @returns {Promise} API response confirming reorder
   */
  reorder: async (courseId, cloOrders) => {
    const response = await api.post(`/courses/${courseId}/clos/reorder`, { orders: cloOrders });
    return response;
  },

  /**
   * Get CLO with PLO mappings
   * @param {number} id - CLO ID
   * @returns {Promise} API response with CLO and PLO mappings
   */
  getWithPLOMappings: async (id) => {
    const response = await api.get(`/clos/${id}/plo-mappings`);
    return response;
  },

  /**
   * Get CLO attainment for a course offering
   * @param {number} id - CLO ID
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise} API response with attainment data
   */
  getAttainment: async (id, courseOfferingId) => {
    const response = await api.get(`/clos/${id}/attainment`, {
      params: { course_offering_id: courseOfferingId }
    });
    return response;
  },

  /**
   * Get assessments measuring this CLO
   * @param {number} id - CLO ID
   * @returns {Promise} API response with assessments
   */
  getAssessments: async (id) => {
    const response = await api.get(`/clos/${id}/assessments`);
    return response;
  },

  /**
   * Map CLO to PLO
   * @param {number} cloId - CLO ID
   * @param {number} ploId - PLO ID
   * @param {number} strength - Mapping strength (1=Low, 2=Medium, 3=High)
   * @returns {Promise} API response confirming mapping
   */
  mapToPLO: async (cloId, ploId, strength) => {
    const response = await api.post(`/clos/${cloId}/map-plo`, {
      plo_id: ploId,
      mapping_strength: strength
    });
    return response;
  },

  /**
   * Get Bloom taxonomy levels
   * @returns {Promise} API response with Bloom levels
   */
  getBloomLevels: async () => {
    const response = await api.get('/bloom-taxonomy');
    return response;
  },
};

export default cloService;
