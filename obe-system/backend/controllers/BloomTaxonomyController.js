/**
 * BloomTaxonomyController
 * Handles HTTP requests for Bloom's Taxonomy levels
 * Primarily read-only endpoints for frontend dropdown population
 */

const BaseController = require('./BaseController');
const BloomTaxonomyLevel = require('../models/BloomTaxonomyLevel');

class BloomTaxonomyController extends BaseController {
  constructor() {
    // Pass a mock service since this is mostly read-only
    const service = {
      findAll: () => BloomTaxonomyLevel.getAllLevelsParsed()
    };
    super(service);
    this.model = BloomTaxonomyLevel;
  }

  /**
   * Get all Bloom's Taxonomy levels
   * GET /api/v1/bloom-taxonomy
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} JSON response with all levels
   */
  async getAllLevels(req, res) {
    try {
      const levels = await this.model.getAllLevelsParsed();
      
      return this.successResponse(
        res,
        levels,
        'Bloom\'s Taxonomy levels retrieved successfully',
        { count: levels.length },
        200
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Bloom's Taxonomy level by ID
   * GET /api/v1/bloom-taxonomy/:id
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} JSON response with level details
   */
  async getLevelById(req, res) {
    try {
      const { id } = req.params;
      
      // Basic validation
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid level ID provided'
        });
      }

      const query = `
        SELECT id, level_number, name, description, keywords
        FROM bloom_taxonomy_levels
        WHERE id = ?
        LIMIT 1
      `;
      
      const db = require('../config/database');
      const [rows] = await db.execute(query, [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bloom\'s Taxonomy level not found'
        });
      }

      const level = this.model.parseKeywords(rows[0]);
      
      return this.successResponse(
        res,
        level,
        'Bloom\'s Taxonomy level retrieved successfully',
        {},
        200
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Bloom's Taxonomy level by level number
   * GET /api/v1/bloom-taxonomy/level/:levelNumber
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} JSON response with level details
   */
  async getLevelByNumber(req, res) {
    try {
      const { levelNumber } = req.params;
      
      // Validate level number (must be 1-6)
      const levelNum = parseInt(levelNumber);
      if (!levelNumber || isNaN(levelNum) || levelNum < 1 || levelNum > 6) {
        return res.status(400).json({
          success: false,
          message: 'Invalid level number. Must be between 1 and 6.'
        });
      }

      const level = await this.model.findByLevelNumber(levelNum);
      
      if (!level) {
        return res.status(404).json({
          success: false,
          message: `Bloom\'s Taxonomy level ${levelNum} not found`
        });
      }

      const parsedLevel = this.model.parseKeywords(level);
      
      return this.successResponse(
        res,
        parsedLevel,
        'Bloom\'s Taxonomy level retrieved successfully',
        {},
        200
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Bloom's Taxonomy levels in a range
   * GET /api/v1/bloom-taxonomy/range?min=1&max=3
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} JSON response with levels in range
   */
  async getLevelsInRange(req, res) {
    try {
      const { min = 1, max = 6 } = req.query;
      
      const minLevel = parseInt(min);
      const maxLevel = parseInt(max);
      
      // Validate range
      if (isNaN(minLevel) || isNaN(maxLevel) || 
          minLevel < 1 || minLevel > 6 || 
          maxLevel < 1 || maxLevel > 6 || 
          minLevel > maxLevel) {
        return res.status(400).json({
          success: false,
          message: 'Invalid range. Both min and max must be between 1 and 6, and min must be <= max.'
        });
      }

      const levels = await this.model.getLevelsInRange(minLevel, maxLevel);
      const parsedLevels = levels.map(level => this.model.parseKeywords(level));
      
      return this.successResponse(
        res,
        parsedLevels,
        `Bloom\'s Taxonomy levels ${minLevel}-${maxLevel} retrieved successfully`,
        { count: parsedLevels.length, range: { min: minLevel, max: maxLevel } },
        200
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BloomTaxonomyController;
