const BaseController = require('./BaseController');
const TeacherService = require('../services/TeacherService');
const { body, query } = require('express-validator');

class TeacherController extends BaseController {
    constructor() {
        super(TeacherService);
    }

    /**
     * Validation rules for creating a teacher
     */
    getCreateValidationRules() {
        return [
            body('user_id')
                .notEmpty().withMessage('User ID is required')
                .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
            body('department_id')
                .notEmpty().withMessage('Department ID is required')
                .isInt({ min: 1 }).withMessage('Department ID must be a positive integer'),
            body('designation_id')
                .optional()
                .isInt({ min: 1 }).withMessage('Designation ID must be a positive integer'),
            body('employee_id')
                .notEmpty().withMessage('Employee ID is required')
                .trim()
                .isLength({ max: 50 }).withMessage('Employee ID cannot exceed 50 characters'),
            body('joining_date')
                .notEmpty().withMessage('Joining date is required')
                .isISO8601().withMessage('Joining date must be a valid date')
                .custom((value) => {
                    const joiningDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (joiningDate > today) {
                        throw new Error('Joining date cannot be in the future');
                    }
                    return true;
                }),
            body('specialization')
                .optional()
                .trim()
                .isLength({ max: 255 }).withMessage('Specialization cannot exceed 255 characters'),
            body('is_active')
                .optional()
                .isBoolean().withMessage('is_active must be a boolean')
        ];
    }

    /**
     * Validation rules for updating a teacher
     */
    getUpdateValidationRules() {
        return [
            body('user_id')
                .optional()
                .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
            body('department_id')
                .optional()
                .isInt({ min: 1 }).withMessage('Department ID must be a positive integer'),
            body('designation_id')
                .optional()
                .isInt({ min: 1 }).withMessage('Designation ID must be a positive integer'),
            body('employee_id')
                .optional()
                .trim()
                .isLength({ max: 50 }).withMessage('Employee ID cannot exceed 50 characters'),
            body('joining_date')
                .optional()
                .isISO8601().withMessage('Joining date must be a valid date')
                .custom((value) => {
                    const joiningDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (joiningDate > today) {
                        throw new Error('Joining date cannot be in the future');
                    }
                    return true;
                }),
            body('specialization')
                .optional()
                .trim()
                .isLength({ max: 255 }).withMessage('Specialization cannot exceed 255 characters'),
            body('is_active')
                .optional()
                .isBoolean().withMessage('is_active must be a boolean')
        ];
    }

    /**
     * Get teacher with user information
     */
    async getWithUser(req, res) {
        return this.customAction(req, res, async () => {
            const teacher = await this.service.getWithUser(req.params.id);
            return this.successResponse(res, teacher, 'Teacher with user retrieved successfully');
        });
    }

    /**
     * Get teacher with department information
     */
    async getWithDepartment(req, res) {
        return this.customAction(req, res, async () => {
            const teacher = await this.service.getWithDepartment(req.params.id);
            return this.successResponse(res, teacher, 'Teacher with department retrieved successfully');
        });
    }

    /**
     * Get teacher with all relationships
     */
    async getWithRelations(req, res) {
        return this.customAction(req, res, async () => {
            const teacher = await this.service.getWithRelations(req.params.id);
            return this.successResponse(res, teacher, 'Teacher with relationships retrieved successfully');
        });
    }

    /**
     * Get all active teachers
     */
    async getActive(req, res) {
        return this.customAction(req, res, async () => {
            const teachers = await this.service.getActive();
            return this.successResponse(res, teachers, 'Active teachers retrieved successfully');
        });
    }

    /**
     * Search teachers
     */
    async search(req, res) {
        return this.customAction(req, res, async () => {
            const { q } = req.query;
            if (!q) {
                return this.errorResponse(res, 'Search term is required', 400);
            }
            const teachers = await this.service.search(q);
            return this.successResponse(res, teachers, 'Search results retrieved successfully');
        });
    }

    /**
     * Get teachers by department
     */
    async getByDepartment(req, res) {
        return this.customAction(req, res, async () => {
            const { departmentId } = req.query;
            if (!departmentId) {
                return this.errorResponse(res, 'Department ID is required', 400);
            }
            const teachers = await this.service.getByDepartmentId(departmentId);
            return this.successResponse(res, teachers, 'Teachers retrieved successfully');
        });
    }

    /**
     * Get teachers by designation
     */
    async getByDesignation(req, res) {
        return this.customAction(req, res, async () => {
            const { designationId } = req.query;
            if (!designationId) {
                return this.errorResponse(res, 'Designation ID is required', 400);
            }
            const teachers = await this.service.getByDesignationId(designationId);
            return this.successResponse(res, teachers, 'Teachers retrieved successfully');
        });
    }

    /**
     * Get teacher by user ID
     */
    async getByUser(req, res) {
        return this.customAction(req, res, async () => {
            const { userId } = req.query;
            if (!userId) {
                return this.errorResponse(res, 'User ID is required', 400);
            }
            const teacher = await this.service.getByUserId(userId);
            return this.successResponse(res, teacher, 'Teacher retrieved successfully');
        });
    }

    /**
     * Get teacher by employee ID
     */
    async getByEmployeeId(req, res) {
        return this.customAction(req, res, async () => {
            const { employeeId } = req.query;
            if (!employeeId) {
                return this.errorResponse(res, 'Employee ID is required', 400);
            }
            const teacher = await this.service.getByEmployeeId(employeeId);
            return this.successResponse(res, teacher, 'Teacher retrieved successfully');
        });
    }

    /**
     * Get course offerings for a teacher
     */
    async getCourseOfferings(req, res) {
        return this.customAction(req, res, async () => {
            const offerings = await this.service.getCourseOfferings(req.params.id);
            return this.successResponse(res, offerings, 'Course offerings retrieved successfully');
        });
    }

    /**
     * Get statistics for a teacher
     */
    async getStatistics(req, res) {
        return this.customAction(req, res, async () => {
            const statistics = await this.service.getStatistics(req.params.id);
            return this.successResponse(res, statistics, 'Teacher statistics retrieved successfully');
        });
    }

    /**
     * Toggle teacher active status
     */
    async toggleStatus(req, res) {
        return this.customAction(req, res, async () => {
            const result = await this.service.toggleStatus(req.params.id);
            return this.successResponse(res, result, result.message);
        });
    }
}

module.exports = new TeacherController();
