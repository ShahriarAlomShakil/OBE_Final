const BaseModel = require('./BaseModel');
const db = require('../config/database');

class AttainmentThreshold extends BaseModel {
  constructor() {
    super('attainment_thresholds');
    this.fillable = [
      'degree_id',
      'threshold_type',
      'minimum_percentage',
      'target_percentage',
      'excellence_percentage',
      'effective_from_session_id',
      'effective_to_session_id'
    ];
  }

  /**
   * Get all thresholds for a specific degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Array>} Array of thresholds
   */
  async getThresholds(degreeId) {
    const query = `
      SELECT 
        at.*,
        d.name as degree_name,
        d.short_name as degree_short_name,
        sess_from.session_code as from_session_code,
        sess_to.session_code as to_session_code
      FROM attainment_thresholds at
      INNER JOIN degrees d ON at.degree_id = d.id
      INNER JOIN academic_sessions sess_from ON at.effective_from_session_id = sess_from.id
      LEFT JOIN academic_sessions sess_to ON at.effective_to_session_id = sess_to.id
      WHERE at.degree_id = ?
        AND (at.effective_to_session_id IS NULL OR at.effective_to_session_id >= 
             (SELECT id FROM academic_sessions WHERE is_current = true LIMIT 1))
      ORDER BY at.threshold_type, at.effective_from_session_id DESC
    `;
    const [rows] = await db.execute(query, [degreeId]);
    return rows;
  }

  /**
   * Get current active thresholds for a degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Object>} Object with CLO and PLO thresholds
   */
  async getCurrentThresholds(degreeId) {
    const query = `
      SELECT 
        at.*,
        sess_from.session_code as from_session_code
      FROM attainment_thresholds at
      INNER JOIN academic_sessions sess_from ON at.effective_from_session_id = sess_from.id
      WHERE at.degree_id = ?
        AND (
          at.effective_to_session_id IS NULL 
          OR at.effective_to_session_id >= (
            SELECT id FROM academic_sessions WHERE is_current = true LIMIT 1
          )
        )
        AND at.effective_from_session_id <= (
          SELECT id FROM academic_sessions WHERE is_current = true LIMIT 1
        )
      ORDER BY at.effective_from_session_id DESC
    `;
    const [rows] = await db.execute(query, [degreeId]);
    
    // Organize by threshold type
    const result = {
      clo: null,
      plo: null
    };
    
    rows.forEach(row => {
      if (!result[row.threshold_type]) {
        result[row.threshold_type] = row;
      }
    });
    
    return result;
  }

  /**
   * Get thresholds by threshold type (CLO or PLO)
   * @param {number} degreeId - Degree ID
   * @param {string} thresholdType - 'clo' or 'plo'
   * @returns {Promise<Object|null>} Threshold object or null
   */
  async getThresholdByType(degreeId, thresholdType) {
    const query = `
      SELECT 
        at.*,
        d.name as degree_name,
        sess_from.session_code as from_session_code,
        sess_to.session_code as to_session_code
      FROM attainment_thresholds at
      INNER JOIN degrees d ON at.degree_id = d.id
      INNER JOIN academic_sessions sess_from ON at.effective_from_session_id = sess_from.id
      LEFT JOIN academic_sessions sess_to ON at.effective_to_session_id = sess_to.id
      WHERE at.degree_id = ? 
        AND at.threshold_type = ?
        AND (
          at.effective_to_session_id IS NULL 
          OR at.effective_to_session_id >= (
            SELECT id FROM academic_sessions WHERE is_current = true LIMIT 1
          )
        )
        AND at.effective_from_session_id <= (
          SELECT id FROM academic_sessions WHERE is_current = true LIMIT 1
        )
      ORDER BY at.effective_from_session_id DESC
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [degreeId, thresholdType]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Update threshold values
   * @param {number} id - Threshold ID
   * @param {Object} data - Threshold data to update
   * @returns {Promise<Object>} Updated threshold
   */
  async updateThreshold(id, data) {
    const allowedFields = [
      'minimum_percentage',
      'target_percentage',
      'excellence_percentage',
      'effective_from_session_id',
      'effective_to_session_id'
    ];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }
    
    return await this.update(id, updates);
  }

  /**
   * Create new threshold for a degree
   * @param {Object} data - Threshold data
   * @returns {Promise<Object>} Created threshold
   */
  async createThreshold(data) {
    // Validate required fields
    const required = ['degree_id', 'threshold_type', 'effective_from_session_id'];
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validate threshold type
    if (!['clo', 'plo'].includes(data.threshold_type)) {
      throw new Error('threshold_type must be either "clo" or "plo"');
    }
    
    // Validate percentages
    const minPercentage = data.minimum_percentage || 60.00;
    const targetPercentage = data.target_percentage || (data.threshold_type === 'clo' ? 75.00 : 70.00);
    const excellencePercentage = data.excellence_percentage || 85.00;
    
    if (minPercentage > targetPercentage || targetPercentage > excellencePercentage) {
      throw new Error('Invalid percentages: minimum <= target <= excellence');
    }
    
    const thresholdData = {
      degree_id: data.degree_id,
      threshold_type: data.threshold_type,
      minimum_percentage: minPercentage,
      target_percentage: targetPercentage,
      excellence_percentage: excellencePercentage,
      effective_from_session_id: data.effective_from_session_id,
      effective_to_session_id: data.effective_to_session_id || null
    };
    
    return await this.create(thresholdData);
  }

  /**
   * Check if a degree meets the threshold for a specific percentage
   * @param {number} degreeId - Degree ID
   * @param {string} thresholdType - 'clo' or 'plo'
   * @param {number} achievedPercentage - Achieved percentage
   * @returns {Promise<Object>} Attainment status
   */
  async checkAttainment(degreeId, thresholdType, achievedPercentage) {
    const threshold = await this.getThresholdByType(degreeId, thresholdType);
    
    if (!threshold) {
      throw new Error(`No threshold found for degree ${degreeId} and type ${thresholdType}`);
    }
    
    let status = 'below_minimum';
    let level = 'Not Attained';
    
    if (achievedPercentage >= threshold.excellence_percentage) {
      status = 'excellence';
      level = 'Excellence';
    } else if (achievedPercentage >= threshold.target_percentage) {
      status = 'target';
      level = 'Target Attained';
    } else if (achievedPercentage >= threshold.minimum_percentage) {
      status = 'minimum';
      level = 'Minimum Attained';
    }
    
    return {
      threshold_type: thresholdType,
      achieved_percentage: achievedPercentage,
      minimum_percentage: threshold.minimum_percentage,
      target_percentage: threshold.target_percentage,
      excellence_percentage: threshold.excellence_percentage,
      status,
      level,
      is_attained: achievedPercentage >= threshold.minimum_percentage
    };
  }

  /**
   * Get historical thresholds for a degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Array>} Array of historical thresholds
   */
  async getHistoricalThresholds(degreeId) {
    const query = `
      SELECT 
        at.*,
        sess_from.session_code as from_session_code,
        sess_to.session_code as to_session_code
      FROM attainment_thresholds at
      INNER JOIN academic_sessions sess_from ON at.effective_from_session_id = sess_from.id
      LEFT JOIN academic_sessions sess_to ON at.effective_to_session_id = sess_to.id
      WHERE at.degree_id = ?
      ORDER BY at.effective_from_session_id DESC, at.threshold_type
    `;
    const [rows] = await db.execute(query, [degreeId]);
    return rows;
  }

  /**
   * Validate threshold percentages
   * @param {Object} data - Threshold data
   * @returns {Object} Validation result
   */
  validatePercentages(data) {
    const errors = [];
    
    const min = parseFloat(data.minimum_percentage || 0);
    const target = parseFloat(data.target_percentage || 0);
    const excellence = parseFloat(data.excellence_percentage || 0);
    
    if (min < 0 || min > 100) {
      errors.push('minimum_percentage must be between 0 and 100');
    }
    
    if (target < 0 || target > 100) {
      errors.push('target_percentage must be between 0 and 100');
    }
    
    if (excellence < 0 || excellence > 100) {
      errors.push('excellence_percentage must be between 0 and 100');
    }
    
    if (min > target) {
      errors.push('minimum_percentage cannot be greater than target_percentage');
    }
    
    if (target > excellence) {
      errors.push('target_percentage cannot be greater than excellence_percentage');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new AttainmentThreshold();
