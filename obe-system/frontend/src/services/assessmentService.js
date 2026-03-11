import api from './api';

/**
 * Assessment Service
 * API methods for assessment and assessment component operations
 */
const assessmentService = {
  /**
   * Get all assessments for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise} API response with assessments data
   */
  getByCourseOffering: async (courseOfferingId) => {
    const response = await api.get(`/course-offerings/${courseOfferingId}/assessments`);
    return response;
  },

  /**
   * Get a single assessment by ID
   * @param {number} id - Assessment ID
   * @returns {Promise} API response with assessment data
   */
  getById: async (id) => {
    const response = await api.get(`/assessments/${id}`);
    return response;
  },

  /**
   * Create a new assessment component
   * @param {Object} data - Assessment data
   * @param {number} data.course_offering_id - Course offering ID
   * @param {number} data.assessment_type_id - Assessment type ID
   * @param {string} data.name - Assessment name (e.g., "Quiz 1", "Midterm")
   * @param {number} data.total_marks - Total marks for this assessment
   * @param {number} data.weightage - Weightage percentage
   * @param {string} data.date - Assessment date (YYYY-MM-DD)
   * @param {string} data.description - Assessment description (optional)
   * @returns {Promise} API response with created assessment
   */
  create: async (data) => {
    const response = await api.post('/assessments', data);
    return response;
  },

  /**
   * Update an existing assessment
   * @param {number} id - Assessment ID
   * @param {Object} data - Updated assessment data
   * @returns {Promise} API response with updated assessment
   */
  update: async (id, data) => {
    const response = await api.put(`/assessments/${id}`, data);
    return response;
  },

  /**
   * Delete an assessment
   * @param {number} id - Assessment ID
   * @returns {Promise} API response
   */
  delete: async (id) => {
    const response = await api.delete(`/assessments/${id}`);
    return response;
  },

  /**
   * Get all assessment types
   * @returns {Promise} API response with assessment types
   */
  getTypes: async () => {
    const response = await api.get('/assessment-types');
    return response;
  },

  /**
   * Map CLOs to an assessment with marks allocation
   * @param {number} assessmentId - Assessment ID
   * @param {Array} mappings - Array of CLO mappings
   * @param {number} mappings[].clo_id - CLO ID
   * @param {number} mappings[].marks_allocated - Marks allocated to this CLO
   * @returns {Promise} API response
   */
  mapCLOs: async (assessmentId, mappings) => {
    const response = await api.post(`/assessments/${assessmentId}/map-clos`, { mappings });
    return response;
  },

  /**
   * Get CLO mappings for an assessment
   * @param {number} assessmentId - Assessment ID
   * @returns {Promise} API response with CLO mappings
   */
  getCLOMappings: async (assessmentId) => {
    const response = await api.get(`/assessments/${assessmentId}/clos`);
    return response;
  },

  /**
   * Update CLO mapping for an assessment
   * @param {number} mappingId - Mapping ID
   * @param {Object} data - Updated mapping data
   * @param {number} data.marks_allocated - Updated marks allocated
   * @returns {Promise} API response
   */
  updateCLOMapping: async (mappingId, data) => {
    const response = await api.put(`/assessment-clo-mappings/${mappingId}`, data);
    return response;
  },

  /**
   * Bulk update CLO mappings for an assessment
   * @param {number} assessmentId - Assessment ID
   * @param {Array} mappings - Array of CLO mappings with IDs
   * @returns {Promise} API response
   */
  bulkUpdateCLOMappings: async (assessmentId, mappings) => {
    const response = await api.put(`/assessments/${assessmentId}/map-clos`, { mappings });
    return response;
  },

  /**
   * Get assessment summary for a course offering
   * Including total weightage validation
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise} API response with summary
   */
  getSummary: async (courseOfferingId) => {
    const response = await api.get(`/course-offerings/${courseOfferingId}/assessment-summary`);
    return response;
  },

  /**
   * Validate assessment weightage totals to 100%
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise} API response with validation result
   */
  validateWeightage: async (courseOfferingId) => {
    const response = await api.get(`/course-offerings/${courseOfferingId}/validate-weightage`);
    return response;
  },

  /**
   * Get marks for an assessment
   * @param {number} assessmentId - Assessment ID
   * @returns {Promise} API response with student marks
   */
  getMarks: async (assessmentId) => {
    const response = await api.get(`/assessments/${assessmentId}/marks`);
    return response;
  },
};

export default assessmentService;
