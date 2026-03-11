/**
 * Semester Model
 * Handles database operations for semesters table
 */

const BaseModel = require('./BaseModel');
const db = require('../config/database');

class Semester extends BaseModel {
  constructor() {
    super('semesters');
    this.fillable = [
      'academic_session_id',
      'name',
      'semester_type',
      'semester_number',
      'start_date',
      'end_date',
      'registration_start',
      'registration_end',
      'is_active'
    ];
    this.hidden = ['deleted_at'];
  }

  /**
   * Get all semesters with academic session information
   * @returns {Promise<Array>} List of semesters with session info
   */
  async getAllWithSession() {
    const query = `
      SELECT s.*, 
             acs.session_name as academic_session_name,
             acs.is_active as session_is_active
      FROM semesters s
      LEFT JOIN academic_sessions acs ON s.academic_session_id = acs.id
      WHERE s.deleted_at IS NULL
      ORDER BY acs.start_date DESC, s.semester_number ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  /**
   * Get active semesters
   * @returns {Promise<Array>} List of active semesters
   */
  async getActive() {
    const query = `
      SELECT s.*, 
             acs.session_name as academic_session_name
      FROM semesters s
      LEFT JOIN academic_sessions acs ON s.academic_session_id = acs.id
      WHERE s.is_active = TRUE 
        AND s.deleted_at IS NULL
        AND acs.deleted_at IS NULL
      ORDER BY acs.start_date DESC, s.semester_number ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  /**
   * Get current active semester (single most recent)
   * @returns {Promise<Object|null>} Current active semester or null
   */
  async getCurrentSemester() {
    const query = `
      SELECT s.*, 
             acs.session_name as academic_session_name
      FROM semesters s
      LEFT JOIN academic_sessions acs ON s.academic_session_id = acs.id
      WHERE s.is_active = TRUE 
        AND s.deleted_at IS NULL
        AND acs.deleted_at IS NULL
      ORDER BY s.start_date DESC
      LIMIT 1
    `;
    const [rows] = await db.execute(query);
    return rows[0] || null;
  }

  /**
   * Get semesters by academic session
   * @param {number} sessionId - Academic session ID
   * @returns {Promise<Array>} List of semesters for the session
   */
  async getByAcademicSession(sessionId) {
    const query = `
      SELECT s.*, 
             acs.session_name as academic_session_name
      FROM semesters s
      LEFT JOIN academic_sessions acs ON s.academic_session_id = acs.id
      WHERE s.academic_session_id = ? 
        AND s.deleted_at IS NULL
      ORDER BY s.semester_number ASC
    `;
    const [rows] = await db.execute(query, [sessionId]);
    return rows;
  }

  /**
   * Get semesters by type
   * @param {string} type - Semester type (fall, spring, summer)
   * @returns {Promise<Array>} List of semesters by type
   */
  async getByType(type) {
    const query = `
      SELECT s.*, 
             acs.session_name as academic_session_name
      FROM semesters s
      LEFT JOIN academic_sessions acs ON s.academic_session_id = acs.id
      WHERE s.semester_type = ? 
        AND s.deleted_at IS NULL
      ORDER BY acs.start_date DESC, s.semester_number ASC
    `;
    const [rows] = await db.execute(query, [type]);
    return rows;
  }

  /**
   * Find semester by ID with session details
   * @param {number} id - Semester ID
   * @returns {Promise<Object|null>} Semester with session info or null
   */
  async findByIdWithSession(id) {
    const query = `
      SELECT s.*, 
             acs.session_name as academic_session_name,
             acs.start_date as session_start_date,
             acs.end_date as session_end_date,
             acs.is_active as session_is_active
      FROM semesters s
      LEFT JOIN academic_sessions acs ON s.academic_session_id = acs.id
      WHERE s.id = ? AND s.deleted_at IS NULL
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }

  /**
   * Search semesters by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Matching semesters
   */
  async search(searchTerm) {
    const query = `
      SELECT s.*, 
             acs.session_name as academic_session_name
      FROM semesters s
      LEFT JOIN academic_sessions acs ON s.academic_session_id = acs.id
      WHERE (s.name LIKE ? OR acs.session_name LIKE ?)
        AND s.deleted_at IS NULL
      ORDER BY acs.start_date DESC, s.semester_number ASC
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await db.execute(query, [searchPattern, searchPattern]);
    return rows;
  }

  /**
   * Set active semester (deactivates others if needed)
   * @param {number} id - Semester ID to activate
   * @returns {Promise<boolean>} Success status
   */
  async setActive(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Deactivate all semesters
      await connection.execute(
        'UPDATE semesters SET is_active = FALSE WHERE deleted_at IS NULL'
      );

      // Activate the specified semester
      await connection.execute(
        'UPDATE semesters SET is_active = TRUE WHERE id = ? AND deleted_at IS NULL',
        [id]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new Semester();
