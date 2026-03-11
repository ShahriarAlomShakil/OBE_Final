const BaseModel = require('./BaseModel');
const db = require('../config/database');

/**
 * ProgramEducationalObjective Model
 * Represents program educational objectives that define what graduates should achieve
 * Maps to program_educational_objectives table
 */
class ProgramEducationalObjective extends BaseModel {
  constructor() {
    super('program_educational_objectives');
  }

  /**
   * Get degree program this PEO belongs to
   * @param {number} peoId - PEO ID
   * @returns {Promise<Object>} Degree with department and faculty info
   */
  async getDegree(peoId) {
    const query = `
      SELECT 
        d.*,
        dept.id as department_id,
        dept.name as department_name,
        dept.short_name as department_short_name,
        f.id as faculty_id,
        f.name as faculty_name,
        f.short_name as faculty_short_name
      FROM program_educational_objectives peo
      INNER JOIN degrees d ON peo.degree_id = d.id
      INNER JOIN departments dept ON d.department_id = dept.id
      INNER JOIN faculties f ON dept.faculty_id = f.id
      WHERE peo.id = ? AND peo.deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [peoId]);
    return rows[0] || null;
  }

  /**
   * Get all PLOs mapped to this PEO
   * @param {number} peoId - PEO ID
   * @returns {Promise<Array>} Array of PLOs with mapping details
   */
  async getPLOMappings(peoId) {
    const query = `
      SELECT 
        plo.*,
        d.name as degree_name,
        d.short_name as degree_short_name,
        mapping.id as mapping_id,
        mapping.correlation_level,
        mapping.created_at as mapped_at
      FROM peo_plo_mapping mapping
      INNER JOIN program_learning_outcomes plo ON mapping.plo_id = plo.id
      INNER JOIN degrees d ON plo.degree_id = d.id
      WHERE mapping.peo_id = ? 
        AND plo.deleted_at IS NULL
        AND d.deleted_at IS NULL
      ORDER BY plo.plo_no
    `;
    const [rows] = await db.query(query, [peoId]);
    return rows;
  }

  /**
   * Get all PEOs for a specific degree
   * @param {number} degreeId - Degree ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of PEOs
   */
  async getByDegree(degreeId, options = {}) {
    const { withTrashed = false } = options;
    
    const whereClause = withTrashed 
      ? 'WHERE peo.degree_id = ?'
      : 'WHERE peo.degree_id = ? AND peo.deleted_at IS NULL';
    
    const query = `
      SELECT 
        peo.*,
        d.name as degree_name,
        d.short_name as degree_short_name,
        (SELECT COUNT(*) FROM peo_plo_mapping 
         WHERE peo_id = peo.id) as plo_count
      FROM program_educational_objectives peo
      INNER JOIN degrees d ON peo.degree_id = d.id
      ${whereClause}
      ORDER BY peo.display_order, peo.peo_no
    `;
    const [rows] = await db.query(query, [degreeId]);
    return rows;
  }

  /**
   * Find PEO by degree and code
   * @param {number} degreeId - Degree ID
   * @param {string} peoNo - PEO number (e.g., PEO1)
   * @returns {Promise<Object>} PEO or null
   */
  async findByDegreeAndCode(degreeId, peoNo) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE degree_id = ? AND peo_no = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const [rows] = await db.query(query, [degreeId, peoNo]);
    return rows[0] || null;
  }

  /**
   * Get next available PEO code for a degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<string>} Next PEO code (e.g., PEO1, PEO2, etc.)
   */
  async getNextCode(degreeId) {
    const query = `
      SELECT peo_no 
      FROM ${this.tableName}
      WHERE degree_id = ? AND deleted_at IS NULL
      ORDER BY CAST(SUBSTRING(peo_no, 4) AS UNSIGNED) DESC
      LIMIT 1
    `;
    const [rows] = await db.query(query, [degreeId]);
    
    if (rows.length === 0) {
      return 'PEO1';
    }
    
    const lastCode = rows[0].peo_no;
    const number = parseInt(lastCode.replace('PEO', '')) + 1;
    return `PEO${number}`;
  }

  /**
   * Validate degree exists and is active
   * @param {number} degreeId - Degree ID
   * @returns {Promise<boolean>}
   * @throws {NotFoundError} If degree not found
   */
  async validateDegreeExists(degreeId) {
    const query = `
      SELECT id FROM degrees 
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const [rows] = await db.query(query, [degreeId]);
    
    if (rows.length === 0) {
      throw new Error('Degree not found or has been deleted');
    }
    
    return true;
  }

  /**
   * Map PEO to PLO
   * @param {number} peoId - PEO ID
   * @param {number} ploId - PLO ID
   * @param {string} correlationLevel - Correlation strength: 'high', 'medium', or 'low'
   * @returns {Promise<Object>} Mapping record
   */
  async mapToPLO(peoId, ploId, correlationLevel = 'medium') {
    // Check if mapping already exists
    const checkQuery = `
      SELECT id FROM peo_plo_mapping 
      WHERE peo_id = ? AND plo_id = ?
      LIMIT 1
    `;
    const [existing] = await db.query(checkQuery, [peoId, ploId]);
    
    if (existing.length > 0) {
      throw new Error('This PEO is already mapped to the specified PLO');
    }
    
    // Validate PLO exists
    const ploQuery = `
      SELECT id FROM program_learning_outcomes 
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const [ploRows] = await db.query(ploQuery, [ploId]);
    
    if (ploRows.length === 0) {
      throw new Error('PLO not found or has been deleted');
    }
    
    // Validate correlation level
    if (!['high', 'medium', 'low'].includes(correlationLevel)) {
      throw new Error('Correlation level must be high, medium, or low');
    }
    
    // Create mapping
    const insertQuery = `
      INSERT INTO peo_plo_mapping (peo_id, plo_id, correlation_level, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(insertQuery, [peoId, ploId, correlationLevel]);
    
    return {
      id: result.insertId,
      peo_id: peoId,
      plo_id: ploId,
      correlation_level: correlationLevel
    };
  }

  /**
   * Unmap PEO from PLO
   * @param {number} peoId - PEO ID
   * @param {number} ploId - PLO ID
   * @returns {Promise<boolean>}
   */
  async unmapFromPLO(peoId, ploId) {
    const query = `
      DELETE FROM peo_plo_mapping 
      WHERE peo_id = ? AND plo_id = ?
    `;
    const [result] = await db.query(query, [peoId, ploId]);
    return result.affectedRows > 0;
  }

  /**
   * Get PEO with all relationships
   * @param {number} peoId - PEO ID
   * @returns {Promise<Object>} PEO with degree and PLO mappings
   */
  async getWithRelations(peoId) {
    const peo = await this.findById(peoId);
    if (!peo) {
      return null;
    }
    
    const [degree, ploMappings] = await Promise.all([
      this.getDegree(peoId),
      this.getPLOMappings(peoId)
    ]);
    
    return {
      ...peo,
      degree,
      plo_mappings: ploMappings
    };
  }

  /**
   * Bulk create PEOs for a degree
   * @param {number} degreeId - Degree ID
   * @param {Array} peos - Array of PEO objects {peo_no, peo_description, display_order}
   * @returns {Promise<Array>} Created PEOs
   */
  async bulkCreate(degreeId, peos) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const createdPeos = [];
      
      for (let i = 0; i < peos.length; i++) {
        const peo = peos[i];
        const displayOrder = peo.display_order || (i + 1);
        const isActive = peo.is_active !== undefined ? peo.is_active : true;
        
        const query = `
          INSERT INTO ${this.tableName} 
          (degree_id, peo_no, peo_description, display_order, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `;
        const [result] = await connection.query(query, [
          degreeId,
          peo.peo_no,
          peo.peo_description,
          displayOrder,
          isActive
        ]);
        
        createdPeos.push({
          id: result.insertId,
          degree_id: degreeId,
          peo_no: peo.peo_no,
          peo_description: peo.peo_description,
          display_order: displayOrder,
          is_active: isActive
        });
      }
      
      await connection.commit();
      return createdPeos;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Search PEOs by code or description
   * @param {string} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Matching PEOs
   */
  async search(searchTerm, options = {}) {
    const { degreeId = null, limit = 50 } = options;
    
    let whereClause = 'WHERE peo.deleted_at IS NULL AND peo.is_active = TRUE';
    const params = [];
    
    if (degreeId) {
      whereClause += ' AND peo.degree_id = ?';
      params.push(degreeId);
    }
    
    if (searchTerm) {
      whereClause += ` AND (peo.peo_no LIKE ? OR peo.peo_description LIKE ?)`;
      const likeTerm = `%${searchTerm}%`;
      params.push(likeTerm, likeTerm);
    }
    
    const query = `
      SELECT 
        peo.*,
        d.name as degree_name,
        d.short_name as degree_short_name
      FROM ${this.tableName} peo
      INNER JOIN degrees d ON peo.degree_id = d.id
      ${whereClause}
      ORDER BY peo.display_order, peo.peo_no
      LIMIT ?
    `;
    params.push(limit);
    
    const [rows] = await db.query(query, params);
    return rows;
  }
}

module.exports = new ProgramEducationalObjective();
