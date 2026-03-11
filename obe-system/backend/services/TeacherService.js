const BaseService = require('./BaseService');
const Teacher = require('../models/Teacher');
const Joi = require('joi');
const { ValidationError } = require('../utils/AppError');

class TeacherService extends BaseService {
    constructor() {
        super(Teacher);
    }

    /**
     * Validation schema for creating a teacher
     */
    getCreateValidationSchema() {
        return Joi.object({
            user_id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': 'User ID must be a number',
                    'number.positive': 'User ID must be positive',
                    'any.required': 'User ID is required'
                }),
            department_id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': 'Department ID must be a number',
                    'number.positive': 'Department ID must be positive',
                    'any.required': 'Department ID is required'
                }),
            designation_id: Joi.number().integer().positive().allow(null)
                .messages({
                    'number.base': 'Designation ID must be a number',
                    'number.positive': 'Designation ID must be positive'
                }),
            employee_id: Joi.string().trim().max(50).required()
                .messages({
                    'string.base': 'Employee ID must be a string',
                    'string.max': 'Employee ID cannot exceed 50 characters',
                    'any.required': 'Employee ID is required'
                }),
            joining_date: Joi.date().max('now').required()
                .messages({
                    'date.base': 'Joining date must be a valid date',
                    'date.max': 'Joining date cannot be in the future',
                    'any.required': 'Joining date is required'
                }),
            specialization: Joi.string().trim().max(255).allow(null, '')
                .messages({
                    'string.base': 'Specialization must be a string',
                    'string.max': 'Specialization cannot exceed 255 characters'
                }),
            is_active: Joi.boolean().default(true)
        });
    }

    /**
     * Validation schema for updating a teacher
     */
    getUpdateValidationSchema() {
        return Joi.object({
            user_id: Joi.number().integer().positive()
                .messages({
                    'number.base': 'User ID must be a number',
                    'number.positive': 'User ID must be positive'
                }),
            department_id: Joi.number().integer().positive()
                .messages({
                    'number.base': 'Department ID must be a number',
                    'number.positive': 'Department ID must be positive'
                }),
            designation_id: Joi.number().integer().positive().allow(null)
                .messages({
                    'number.base': 'Designation ID must be a number',
                    'number.positive': 'Designation ID must be positive'
                }),
            employee_id: Joi.string().trim().max(50)
                .messages({
                    'string.base': 'Employee ID must be a string',
                    'string.max': 'Employee ID cannot exceed 50 characters'
                }),
            joining_date: Joi.date().max('now')
                .messages({
                    'date.base': 'Joining date must be a valid date',
                    'date.max': 'Joining date cannot be in the future'
                }),
            specialization: Joi.string().trim().max(255).allow(null, '')
                .messages({
                    'string.base': 'Specialization must be a string',
                    'string.max': 'Specialization cannot exceed 255 characters'
                }),
            is_active: Joi.boolean()
        }).min(1);
    }

    /**
     * Lifecycle hook - before create
     */
    async beforeCreate(data) {
        // Validate user exists and has appropriate role
        await this.model.validateUserExists(data.user_id);
        
        // Check if user already has a teacher profile
        const existingTeacher = await this.model.findByUserId(data.user_id);
        if (existingTeacher) {
            throw new ValidationError('This user already has a teacher profile');
        }
        
        // Validate department exists
        await this.model.validateDepartmentExists(data.department_id);
        
        // Validate designation if provided
        if (data.designation_id) {
            await this.model.validateDesignationExists(data.designation_id);
        }
        
        // Validate employee ID is unique
        const existingEmployee = await this.model.findByEmployeeId(data.employee_id);
        if (existingEmployee) {
            throw new ValidationError('Employee ID already exists');
        }
        
        // Validate joining date
        if (data.joining_date) {
            this.model.validateJoiningDate(data.joining_date);
        }
        
        return data;
    }

    /**
     * Lifecycle hook - before update
     */
    async beforeUpdate(id, data) {
        // Validate user if being updated
        if (data.user_id) {
            await this.model.validateUserExists(data.user_id);
            
            // Check if another teacher has this user_id
            const existingTeacher = await this.model.findByUserId(data.user_id);
            if (existingTeacher && existingTeacher.id !== id) {
                throw new ValidationError('This user already has a teacher profile');
            }
        }
        
        // Validate department if being updated
        if (data.department_id) {
            await this.model.validateDepartmentExists(data.department_id);
        }
        
        // Validate designation if being updated
        if (data.designation_id) {
            await this.model.validateDesignationExists(data.designation_id);
        }
        
        // Validate employee ID uniqueness if being updated
        if (data.employee_id) {
            const existingEmployee = await this.model.findByEmployeeId(data.employee_id);
            if (existingEmployee && existingEmployee.id !== id) {
                throw new ValidationError('Employee ID already exists');
            }
        }
        
        // Validate joining date if being updated
        if (data.joining_date) {
            this.model.validateJoiningDate(data.joining_date);
        }
        
        return data;
    }

    /**
     * Get teacher with user information
     */
    async getWithUser(id) {
        const teacher = await this.model.findByIdWithUser(id);
        if (!teacher) {
            throw new ValidationError('Teacher not found');
        }
        return teacher;
    }

    /**
     * Get teacher with department information
     */
    async getWithDepartment(id) {
        const teacher = await this.model.findByIdWithDepartment(id);
        if (!teacher) {
            throw new ValidationError('Teacher not found');
        }
        return teacher;
    }

    /**
     * Get teacher with all relationships
     */
    async getWithRelations(id) {
        const teacher = await this.model.findByIdWithRelations(id);
        if (!teacher) {
            throw new ValidationError('Teacher not found');
        }
        return teacher;
    }

    /**
     * Get all active teachers
     */
    async getActive() {
        return await this.model.getActive();
    }

    /**
     * Search teachers
     */
    async search(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            throw new ValidationError('Search term is required');
        }
        return await this.model.search(searchTerm);
    }

    /**
     * Get teachers by department
     */
    async getByDepartmentId(departmentId) {
        return await this.model.getByDepartmentId(departmentId);
    }

    /**
     * Get teachers by designation
     */
    async getByDesignationId(designationId) {
        return await this.model.getByDesignationId(designationId);
    }

    /**
     * Get teacher by user ID
     */
    async getByUserId(userId) {
        const teacher = await this.model.findByUserId(userId);
        if (!teacher) {
            throw new ValidationError('Teacher not found for this user');
        }
        return teacher;
    }

    /**
     * Get teacher by employee ID
     */
    async getByEmployeeId(employeeId) {
        const teacher = await this.model.findByEmployeeId(employeeId);
        if (!teacher) {
            throw new ValidationError('Teacher not found with this employee ID');
        }
        return teacher;
    }

    /**
     * Get course offerings for a teacher
     */
    async getCourseOfferings(id) {
        return await this.model.getCourseOfferings(id);
    }

    /**
     * Get statistics for a teacher
     */
    async getStatistics(id) {
        const teacher = await this.getById(id);
        if (!teacher) {
            throw new ValidationError('Teacher not found');
        }
        return await this.model.getStatistics(id);
    }

    /**
     * Toggle teacher active status
     */
    async toggleStatus(id) {
        const teacher = await this.getById(id);
        if (!teacher) {
            throw new ValidationError('Teacher not found');
        }
        
        const newStatus = !teacher.is_active;
        await this.update(id, { is_active: newStatus });
        
        return {
            id,
            is_active: newStatus,
            message: `Teacher ${newStatus ? 'activated' : 'deactivated'} successfully`
        };
    }
}

module.exports = new TeacherService();
