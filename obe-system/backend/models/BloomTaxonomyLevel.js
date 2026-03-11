const BaseModel = require('./BaseModel');

/**
 * BloomTaxonomyLevel Model
 * Represents the six levels of Bloom's Taxonomy for educational objectives
 * Used for mapping questions and assessments to cognitive levels
 * 
 * @extends BaseModel
 */
class BloomTaxonomyLevel extends BaseModel {
  constructor() {
    super('bloom_taxonomy_levels', 'id');
    
    // Disable soft deletes for this reference table
    this.softDelete = false;
    
    // Define fillable fields
    this.fillable = [
      'level_number',
      'name',
      'description',
      'keywords'
    ];
    
    // Hidden fields in JSON responses
    this.hidden = [];
  }

  /**
   * Get all Bloom's Taxonomy levels ordered by level_number
   * 
   * @returns {Promise<Array>} Array of all taxonomy levels
   */
  async getAllLevels() {
    try {
      const query = `
        SELECT id, level_number, name, description, keywords
        FROM ${this.tableName}
        ORDER BY level_number ASC
      `;
      
      const rows = await this.raw(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Bloom's Taxonomy level by level number
   * 
   * @param {number} levelNumber - Level number (1-6)
   * @returns {Promise<Object|null>} Taxonomy level or null
   */
  async findByLevelNumber(levelNumber) {
    try {
      const query = `
        SELECT id, level_number, name, description, keywords
        FROM ${this.tableName}
        WHERE level_number = ?
        LIMIT 1
      `;
      
      const rows = await this.raw(query, [levelNumber]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Bloom's Taxonomy level by name
   * 
   * @param {string} name - Level name (e.g., "Remember", "Understand", etc.)
   * @returns {Promise<Object|null>} Taxonomy level or null
   */
  async findByLevelName(name) {
    try {
      const query = `
        SELECT id, level_number, name, description, keywords
        FROM ${this.tableName}
        WHERE LOWER(name) = LOWER(?)
        LIMIT 1
      `;
      
      const rows = await this.raw(query, [name]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get levels within a range
   * 
   * @param {number} minLevel - Minimum level number
   * @param {number} maxLevel - Maximum level number
   * @returns {Promise<Array>} Array of taxonomy levels within range
   */
  async getLevelsInRange(minLevel, maxLevel) {
    try {
      const query = `
        SELECT id, level_number, name, description, keywords
        FROM ${this.tableName}
        WHERE level_number BETWEEN ? AND ?
        ORDER BY level_number ASC
      `;
      
      const rows = await this.raw(query, [minLevel, maxLevel]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Parse keywords from JSON string to array
   * 
   * @param {Object} level - Level object with keywords field
   * @returns {Object} Level object with parsed keywords array
   */
  parseKeywords(level) {
    if (!level) return null;
    
    try {
      if (typeof level.keywords === 'string') {
        level.keywords = JSON.parse(level.keywords);
      }
    } catch (error) {
      // If parsing fails, split by comma as fallback
      if (typeof level.keywords === 'string') {
        level.keywords = level.keywords.split(',').map(v => v.trim());
      }
    }
    
    return level;
  }

  /**
   * Get all levels with parsed keywords
   * 
   * @returns {Promise<Array>} Array of levels with parsed keywords
   */
  async getAllLevelsParsed() {
    try {
      const levels = await this.getAllLevels();
      return levels.map(level => this.parseKeywords(level));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BloomTaxonomyLevel();
