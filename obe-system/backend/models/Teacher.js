const BaseModel = require('./BaseModel');
const db = require('../config/database');

class Teacher extends BaseModel {
    constructor() {
        super('teachers');
    }

    /**
     * Get user account associated with this teacher
     * @param {number} teacherId - Teacher ID
     * @returns {Promise<Object|null>} User object with profile data
     */
    async getUser(teacherId) {
        const query = `
            SELECT u.*, t.*
            FROM users u
            INNER JOIN teachers t ON u.id = t.user_id
            WHERE t.id = ?
        `;
        const [rows] = await db.execute(query, [teacherId]);
        return rows[0] || null;
    }

    /**
     * Get department this teacher belongs to with faculty info
     * @param {number} teacherId - Teacher ID
     * @returns {Promise<Object|null>} Department object with faculty
     */
    async getDepartment(teacherId) {
        const query = `
            SELECT d.*, f.id as faculty_id, f.name as faculty_name, f.short_name as faculty_short_name
            FROM departments d
            INNER JOIN faculties f ON d.faculty_id = f.id
            INNER JOIN teachers t ON d.id = t.department_id
            WHERE t.id = ?
        `;
        const [rows] = await db.execute(query, [teacherId]);
        return rows[0] || null;
    }

    /**
     * Get all course offerings taught by this teacher
     * @param {number} teacherId - Teacher ID
     * @returns {Promise<Array>} Array of course offerings with course and semester info
     */
    async getCourseOfferings(teacherId) {
        const query = `
            SELECT 
                co.*,
                c.course_code as course_code,
                c.course_title as course_title,
                c.credit as credit_hours,
                s.name as semester_name,
                s.start_date,
                s.end_date,
                (SELECT COUNT(*) FROM course_enrollments WHERE course_offering_id = co.id) as enrollment_count
            FROM course_offerings co
            INNER JOIN courses c ON co.course_id = c.id
            INNER JOIN semesters s ON co.semester_id = s.id
            WHERE co.teacher_id = ?
            ORDER BY s.start_date DESC, c.course_code
        `;
        const [rows] = await db.execute(query, [teacherId]);
        return rows;
    }

    /**
     * Get teacher with user, department, and faculty relationships
     * @param {number} id - Teacher ID
     * @returns {Promise<Object|null>} Teacher with all relationships
     */
    async findByIdWithRelations(id) {
        const query = `
            SELECT 
                t.*,
                u.id as user_id, u.name as user_name, u.email, u.username, u.phone, u.role,
                d.id as department_id, d.name as department_name, d.dept_code as department_short_name,
                f.id as faculty_id, f.name as faculty_name, f.short_name as faculty_short_name,
                des.id as designation_id, des.name as designation_name, des.level as designation_level
            FROM teachers t
            INNER JOIN users u ON t.user_id = u.id
            INNER JOIN departments d ON t.department_id = d.id
            INNER JOIN faculties f ON d.faculty_id = f.id
            LEFT JOIN designations des ON t.designation_id = des.id
            WHERE t.id = ? AND t.deleted_at IS NULL
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0] || null;
    }

    /**
     * Find teacher by employee ID
     * @param {string} employeeId - Employee ID
     * @returns {Promise<Object|null>} Teacher object
     */
    async findByEmployeeId(employeeId) {
        const query = `SELECT * FROM ${this.table} WHERE employee_id = ? AND deleted_at IS NULL`;
        const [rows] = await db.execute(query, [employeeId]);
        return rows[0] || null;
    }

    /**
     * Find teacher by user ID
     * @param {number} userId - User ID
     * @returns {Promise<Object|null>} Teacher object
     */
    async findByUserId(userId) {
        const query = `SELECT * FROM ${this.table} WHERE user_id = ? AND deleted_at IS NULL`;
        const [rows] = await db.execute(query, [userId]);
        return rows[0] || null;
    }

    /**
     * Get all active teachers
     * @returns {Promise<Array>} Array of active teachers
     */
    async getActive() {
        const query = `
            SELECT t.*, u.name as user_name, u.email, d.name as department_name
            FROM ${this.table} t
            INNER JOIN users u ON t.user_id = u.id
            INNER JOIN departments d ON t.department_id = d.id
            WHERE t.is_active = true AND t.deleted_at IS NULL
            ORDER BY u.name
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    /**
     * Search teachers by name, employee ID, or email
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} Array of matching teachers
     */
    async search(searchTerm) {
        const query = `
            SELECT t.*, u.name as user_name, u.email, d.name as department_name
            FROM ${this.table} t
            INNER JOIN users u ON t.user_id = u.id
            INNER JOIN departments d ON t.department_id = d.id
            WHERE (u.name LIKE ? OR t.employee_id LIKE ? OR u.email LIKE ?)
            AND t.deleted_at IS NULL
            ORDER BY u.name
        `;
        const searchPattern = `%${searchTerm}%`;
        const [rows] = await db.execute(query, [searchPattern, searchPattern, searchPattern]);
        return rows;
    }

    /**
     * Get teachers by department ID
     * @param {number} departmentId - Department ID
     * @returns {Promise<Array>} Array of teachers
     */
    async getByDepartmentId(departmentId) {
        const query = `
            SELECT t.*, u.name as user_name, u.email, des.name as designation_name
            FROM ${this.table} t
            INNER JOIN users u ON t.user_id = u.id
            LEFT JOIN designations des ON t.designation_id = des.id
            WHERE t.department_id = ? AND t.deleted_at IS NULL
            ORDER BY u.name
        `;
        const [rows] = await db.execute(query, [departmentId]);
        return rows;
    }

    /**
     * Get teachers by designation ID
     * @param {number} designationId - Designation ID
     * @returns {Promise<Array>} Array of teachers
     */
    async getByDesignationId(designationId) {
        const query = `
            SELECT t.*, u.name as user_name, u.email, d.name as department_name
            FROM ${this.table} t
            INNER JOIN users u ON t.user_id = u.id
            INNER JOIN departments d ON t.department_id = d.id
            WHERE t.designation_id = ? AND t.deleted_at IS NULL
            ORDER BY u.name
        `;
        const [rows] = await db.execute(query, [designationId]);
        return rows;
    }

    /**
     * Count course offerings for a teacher
     * @param {number} teacherId - Teacher ID
     * @returns {Promise<number>} Count of course offerings
     */
    async countCourseOfferings(teacherId) {
        const query = `SELECT COUNT(*) as count FROM course_offerings WHERE teacher_id = ?`;
        const [rows] = await db.execute(query, [teacherId]);
        return rows[0].count;
    }

    /**
     * Count active course offerings for a teacher
     * @param {number} teacherId - Teacher ID
     * @returns {Promise<number>} Count of active course offerings
     */
    async countActiveCourseOfferings(teacherId) {
        const query = `SELECT COUNT(*) as count FROM course_offerings WHERE teacher_id = ? AND is_active = true`;
        const [rows] = await db.execute(query, [teacherId]);
        return rows[0].count;
    }

    /**
     * Get statistics for a teacher
     * @param {number} teacherId - Teacher ID
     * @returns {Promise<Object>} Teacher statistics
     */
    async getStatistics(teacherId) {
        const totalOfferingsQuery = `SELECT COUNT(*) as count FROM course_offerings WHERE teacher_id = ?`;
        const activeOfferingsQuery = `SELECT COUNT(*) as count FROM course_offerings WHERE teacher_id = ? AND is_active = true`;
        const totalStudentsQuery = `
            SELECT COUNT(DISTINCT ce.student_id) as count 
            FROM course_enrollments ce
            INNER JOIN course_offerings co ON ce.course_offering_id = co.id
            WHERE co.teacher_id = ?
        `;
        const uniqueCoursesQuery = `
            SELECT COUNT(DISTINCT course_id) as count 
            FROM course_offerings 
            WHERE teacher_id = ?
        `;

        const [totalOfferings] = await db.execute(totalOfferingsQuery, [teacherId]);
        const [activeOfferings] = await db.execute(activeOfferingsQuery, [teacherId]);
        const [totalStudents] = await db.execute(totalStudentsQuery, [teacherId]);
        const [uniqueCourses] = await db.execute(uniqueCoursesQuery, [teacherId]);

        return {
            total_course_offerings: totalOfferings[0].count,
            active_course_offerings: activeOfferings[0].count,
            total_students_taught: totalStudents[0].count,
            unique_courses_taught: uniqueCourses[0].count
        };
    }

    /**
     * Check if teacher is active
     * @param {number} teacherId - Teacher ID
     * @returns {Promise<boolean>} True if active
     */
    async isActive(teacherId) {
        const query = `SELECT is_active FROM ${this.table} WHERE id = ? AND deleted_at IS NULL`;
        const [rows] = await db.execute(query, [teacherId]);
        return rows.length > 0 && rows[0].is_active === 1;
    }

    /**
     * Validate user exists and has teacher role
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} True if valid
     */
    async validateUserExists(userId) {
        const query = `SELECT id, role FROM users WHERE id = ? AND deleted_at IS NULL`;
        const [rows] = await db.execute(query, [userId]);
        
        if (rows.length === 0) {
            throw new Error('User not found');
        }
        
        if (rows[0].role !== 'teacher' && rows[0].role !== 'admin' && rows[0].role !== 'hod') {
            throw new Error('User role must be teacher, hod, or admin');
        }
        
        return true;
    }

    /**
     * Validate department exists and is active
     * @param {number} departmentId - Department ID
     * @returns {Promise<boolean>} True if valid
     */
    async validateDepartmentExists(departmentId) {
        const query = `SELECT id, is_active FROM departments WHERE id = ? AND deleted_at IS NULL`;
        const [rows] = await db.execute(query, [departmentId]);
        
        if (rows.length === 0) {
            throw new Error('Department not found');
        }
        
        if (rows[0].is_active === 0) {
            throw new Error('Department is not active');
        }
        
        return true;
    }

    /**
     * Validate designation exists
     * @param {number} designationId - Designation ID
     * @returns {Promise<boolean>} True if valid
     */
    async validateDesignationExists(designationId) {
        if (!designationId) return true; // Designation is optional
        
        const query = `SELECT id FROM designations WHERE id = ? AND deleted_at IS NULL`;
        const [rows] = await db.execute(query, [designationId]);
        
        if (rows.length === 0) {
            throw new Error('Designation not found');
        }
        
        return true;
    }

    /**
     * Validate joining date (cannot be future)
     * @param {string} joiningDate - Joining date
     * @returns {boolean} True if valid
     */
    validateJoiningDate(joiningDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const joining = new Date(joiningDate);
        joining.setHours(0, 0, 0, 0);
        
        if (joining > today) {
            throw new Error('Joining date cannot be in the future');
        }
        
        return true;
    }

    /**
     * Get teacher with user info
     * @param {number} teacherId - Teacher ID
     * @returns {Promise<Object|null>} Teacher with user info
     */
    async findByIdWithUser(teacherId) {
        const query = `
            SELECT t.*, u.name, u.email, u.username, u.phone, u.role, u.is_active as user_is_active
            FROM ${this.table} t
            INNER JOIN users u ON t.user_id = u.id
            WHERE t.id = ? AND t.deleted_at IS NULL
        `;
        const [rows] = await db.execute(query, [teacherId]);
        return rows[0] || null;
    }

    /**
     * Get teacher with department info
     * @param {number} teacherId - Teacher ID
     * @returns {Promise<Object|null>} Teacher with department info
     */
    async findByIdWithDepartment(teacherId) {
        const query = `
            SELECT t.*, d.name as department_name, d.dept_code as department_short_name, 
                   f.id as faculty_id, f.name as faculty_name
            FROM ${this.table} t
            INNER JOIN departments d ON t.department_id = d.id
            INNER JOIN faculties f ON d.faculty_id = f.id
            WHERE t.id = ? AND t.deleted_at IS NULL
        `;
        const [rows] = await db.execute(query, [teacherId]);
        return rows[0] || null;
    }
}

module.exports = new Teacher();
