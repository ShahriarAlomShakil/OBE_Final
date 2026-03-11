const BaseModel = require('./BaseModel');
const db = require('../config/database');

/**
 * ProgramLearningOutcome Model
 * Represents program-level learning outcomes that students should achieve by graduation
 * Maps to program_learning_outcomes table
 */
class ProgramLearningOutcome extends BaseModel {
  constructor() {
    super('program_learning_outcomes');
  }

  /**
   * Get degree program this PLO belongs to
   * @param {number} ploId - PLO ID
   * @returns {Promise<Object>} Degree with department and faculty info
   */
  async getDegree(ploId) {
    const query = `
      SELECT 
        d.*,
        dept.id as department_id,
        dept.name as department_name,
        dept.short_name as department_short_name,
        f.id as faculty_id,
        f.name as faculty_name,
        f.short_name as faculty_short_name
      FROM program_learning_outcomes plo
      INNER JOIN degrees d ON plo.degree_id = d.id
      INNER JOIN departments dept ON d.department_id = dept.id
      INNER JOIN faculties f ON dept.faculty_id = f.id
      WHERE plo.id = ? AND plo.deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [ploId]);
    return rows[0] || null;
  }

  /**
   * Get all CLOs mapped to this PLO with their mapping strengths
   * @param {number} ploId - PLO ID
   * @returns {Promise<Array>} Array of CLOs with mapping details
   */
  async getCLOMappings(ploId) {
    const query = `
      SELECT 
        clo.*,
        c.course_code as course_code,
        c.course_title as course_title,
        c.credit as credit_hours,
        mapping.mapping_strength,
        mapping.id as mapping_id,
        CASE mapping.mapping_strength
          WHEN 1 THEN 'Low'
          WHEN 2 THEN 'Medium'
          WHEN 3 THEN 'High'
        END as strength_label,
        bl.name as bloom_level_name,
        bl.level_number as bloom_level_number
      FROM clo_plo_mapping mapping
      INNER JOIN course_learning_outcomes clo ON mapping.clo_id = clo.id
      INNER JOIN courses c ON clo.course_id = c.id
      LEFT JOIN bloom_taxonomy_levels bl ON clo.bloom_level_id = bl.id
      WHERE mapping.plo_id = ? 
        AND clo.deleted_at IS NULL
        AND c.deleted_at IS NULL
      ORDER BY c.course_code, clo.clo_code
    `;
    const [rows] = await db.query(query, [ploId]);
    return rows;
  }

  /**
   * Get all PEOs mapped to this PLO
   * @param {number} ploId - PLO ID
   * @returns {Promise<Array>} Array of PEOs
   */
  async getPEOMappings(ploId) {
    const query = `
      SELECT 
        peo.*,
        mapping.id as mapping_id
      FROM peo_plo_mapping mapping
      INNER JOIN program_educational_objectives peo ON mapping.peo_id = peo.id
      WHERE mapping.plo_id = ? AND peo.deleted_at IS NULL
      ORDER BY peo.peo_code
    `;
    const [rows] = await db.query(query, [ploId]);
    return rows;
  }

  /**
   * Calculate program-level PLO attainment for a batch of students
   * @param {number} ploId - PLO ID
   * @param {string} batchYear - Batch year (e.g., '2023')
   * @returns {Promise<Object>} Attainment statistics
   */
  async calculateAttainment(ploId, batchYear) {
    const query = `
      SELECT 
        COUNT(DISTINCT spa.student_id) as total_students,
        AVG(spa.attainment_percentage) as average_attainment,
        COUNT(DISTINCT CASE WHEN spa.attainment_percentage >= 60 THEN spa.student_id END) as students_attained,
        MIN(spa.attainment_percentage) as min_attainment,
        MAX(spa.attainment_percentage) as max_attainment
      FROM student_plo_attainment spa
      INNER JOIN students s ON spa.student_id = s.id
      WHERE spa.plo_id = ? 
        AND s.batch = ?
        AND s.deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [ploId, batchYear]);
    const stats = rows[0];
    
    return {
      ploId,
      batchYear,
      totalStudents: stats.total_students || 0,
      averageAttainment: parseFloat(stats.average_attainment || 0).toFixed(2),
      studentsAttained: stats.students_attained || 0,
      attainmentRate: stats.total_students > 0 
        ? ((stats.students_attained / stats.total_students) * 100).toFixed(2)
        : 0,
      minAttainment: parseFloat(stats.min_attainment || 0).toFixed(2),
      maxAttainment: parseFloat(stats.max_attainment || 0).toFixed(2)
    };
  }

  /**
   * Get PLO with degree relationship
   * @param {number} ploId - PLO ID
   * @returns {Promise<Object>} PLO with degree info
   */
  async findByIdWithDegree(ploId) {
    const plo = await this.findById(ploId);
    if (!plo) return null;

    const degree = await this.getDegree(ploId);
    return {
      ...plo,
      degree
    };
  }

  /**
   * Get PLO with all relationships
   * @param {number} ploId - PLO ID
   * @returns {Promise<Object>} PLO with degree, CLO mappings, and PEO mappings
   */
  async findByIdWithRelations(ploId) {
    const plo = await this.findById(ploId);
    if (!plo) return null;

    const [degree, cloMappings, peoMappings] = await Promise.all([
      this.getDegree(ploId),
      this.getCLOMappings(ploId),
      this.getPEOMappings(ploId)
    ]);

    return {
      ...plo,
      degree,
      cloMappings,
      peoMappings,
      totalCLOMappings: cloMappings.length,
      totalPEOMappings: peoMappings.length
    };
  }

  /**
   * Get all PLOs for a specific degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Array>} Array of PLOs
   */
  async getByDegreeId(degreeId) {
    const query = `
      SELECT * FROM ${this.table}
      WHERE degree_id = ? AND deleted_at IS NULL
      ORDER BY plo_code
    `;
    const [rows] = await db.query(query, [degreeId]);
    return rows;
  }

  /**
   * Find PLO by degree and code
   * @param {number} degreeId - Degree ID
   * @param {string} ploCode - PLO code (e.g., 'PLO1')
   * @returns {Promise<Object>} PLO or null
   */
  async findByDegreeAndCode(degreeId, ploCode) {
    const query = `
      SELECT * FROM ${this.table}
      WHERE degree_id = ? AND UPPER(plo_code) = UPPER(?) AND deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [degreeId, ploCode]);
    return rows[0] || null;
  }

  /**
   * Search PLOs by description or code
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching PLOs
   */
  async search(searchTerm) {
    const query = `
      SELECT 
        plo.*,
        d.name as degree_name,
        d.short_name as degree_short_name,
        dept.name as department_name
      FROM ${this.table} plo
      INNER JOIN degrees d ON plo.degree_id = d.id
      INNER JOIN departments dept ON d.department_id = dept.id
      WHERE plo.deleted_at IS NULL
        AND (
          plo.plo_code LIKE ? OR
          plo.description LIKE ? OR
          plo.plo_domain LIKE ? OR
          d.name LIKE ? OR
          d.short_name LIKE ?
        )
      ORDER BY plo.plo_code
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await db.query(query, [
      searchPattern, searchPattern, searchPattern, searchPattern, searchPattern
    ]);
    return rows;
  }

  /**
   * Get PLOs by domain type
   * @param {string} domain - Domain type (cognitive, affective, psychomotor)
   * @returns {Promise<Array>} Array of PLOs
   */
  async getByDomain(domain) {
    const query = `
      SELECT 
        plo.*,
        d.name as degree_name,
        d.short_name as degree_short_name
      FROM ${this.table} plo
      INNER JOIN degrees d ON plo.degree_id = d.id
      WHERE plo.plo_domain = ? AND plo.deleted_at IS NULL
      ORDER BY d.name, plo.plo_code
    `;
    const [rows] = await db.query(query, [domain]);
    return rows;
  }

  /**
   * Count CLO mappings for this PLO
   * @param {number} ploId - PLO ID
   * @returns {Promise<number>} Count of CLO mappings
   */
  async countCLOMappings(ploId) {
    const query = `
      SELECT COUNT(*) as count
      FROM clo_plo_mapping mapping
      INNER JOIN course_learning_outcomes clo ON mapping.clo_id = clo.id
      WHERE mapping.plo_id = ? AND clo.deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [ploId]);
    return rows[0].count;
  }

  /**
   * Count PEO mappings for this PLO
   * @param {number} ploId - PLO ID
   * @returns {Promise<number>} Count of PEO mappings
   */
  async countPEOMappings(ploId) {
    const query = `
      SELECT COUNT(*) as count
      FROM peo_plo_mapping mapping
      INNER JOIN program_educational_objectives peo ON mapping.peo_id = peo.id
      WHERE mapping.plo_id = ? AND peo.deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [ploId]);
    return rows[0].count;
  }

  /**
   * Get statistics for a PLO
   * @param {number} ploId - PLO ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics(ploId) {
    const [cloCount, peoCount] = await Promise.all([
      this.countCLOMappings(ploId),
      this.countPEOMappings(ploId)
    ]);

    return {
      totalCLOMappings: cloCount,
      totalPEOMappings: peoCount
    };
  }

  /**
   * Get next available PLO code for a degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<string>} Next PLO code (e.g., 'PLO1', 'PLO2')
   */
  async getNextPLOCode(degreeId) {
    const query = `
      SELECT plo_code FROM ${this.table}
      WHERE degree_id = ? AND deleted_at IS NULL
      ORDER BY plo_code DESC
      LIMIT 1
    `;
    const [rows] = await db.query(query, [degreeId]);
    
    if (rows.length === 0) {
      return 'PLO1';
    }

    const lastCode = rows[0].plo_code;
    const match = lastCode.match(/PLO(\d+)/i);
    
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `PLO${nextNumber}`;
    }

    return 'PLO1';
  }

  /**
   * Validate that degree exists and is active
   * @param {number} degreeId - Degree ID
   * @returns {Promise<boolean>} True if valid
   * @throws {Error} If degree doesn't exist or is inactive
   */
  async validateDegreeExists(degreeId) {
    const query = `
      SELECT id, name, is_active FROM degrees
      WHERE id = ? AND deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [degreeId]);
    
    if (rows.length === 0) {
      throw new Error('Degree not found');
    }

    if (!rows[0].is_active) {
      throw new Error('Degree is not active');
    }

    return true;
  }

  /**
   * Validate PLO domain
   * @param {string} domain - Domain value
   * @returns {boolean} True if valid
   * @throws {Error} If domain is invalid
   */
  validateDomain(domain) {
    const validDomains = ['cognitive', 'affective', 'psychomotor'];
    
    if (!validDomains.includes(domain.toLowerCase())) {
      throw new Error(`Invalid PLO domain. Must be one of: ${validDomains.join(', ')}`);
    }

    return true;
  }
}

module.exports = new ProgramLearningOutcome();
