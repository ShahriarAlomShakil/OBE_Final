/**
 * Example: FacultyService - Demonstrates how to extend BaseService
 * 
 * This is a sample implementation showing best practices for creating
 * service classes that extend BaseService. Use this as a template for
 * creating other service classes in your OBE system.
 * 
 * @author OBE System Team
 * @version 1.0.0
 */

const Joi = require('joi');
const BaseService = require('./BaseService');
// const Faculty = require('../models/Faculty'); // Uncomment when Faculty model is created
// const FacultyRepository = require('../repositories/FacultyRepository'); // Optional

class FacultyService extends BaseService {
  constructor() {
    // Pass the model/repository and resource name to parent
    // const facultyModel = new Faculty();
    // super(facultyModel, 'Faculty');
    
    // OR if using repository pattern:
    // const facultyRepository = new FacultyRepository(new Faculty());
    // super(facultyRepository, 'Faculty');
    
    // For now, just showing the structure (uncomment above when models are ready)
    super(null, 'Faculty');

    // Define validation schemas
    this.defineSchemas();
  }

  /**
   * Define Joi validation schemas for this service
   */
  defineSchemas() {
    // Create schema
    this.schemas.create = Joi.object({
      name: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
          'string.min': 'Faculty name must be at least 3 characters',
          'string.max': 'Faculty name must not exceed 100 characters',
          'any.required': 'Faculty name is required'
        }),
      short_name: Joi.string()
        .max(20)
        .required()
        .messages({
          'string.max': 'Short name must not exceed 20 characters',
          'any.required': 'Short name is required'
        }),
      description: Joi.string()
        .max(500)
        .allow(null, '')
        .optional(),
      established_date: Joi.date()
        .optional()
        .allow(null),
      is_active: Joi.boolean()
        .default(true)
    });

    // Update schema (all fields optional)
    this.schemas.update = Joi.object({
      name: Joi.string()
        .min(3)
        .max(100)
        .optional(),
      short_name: Joi.string()
        .max(20)
        .optional(),
      description: Joi.string()
        .max(500)
        .allow(null, '')
        .optional(),
      established_date: Joi.date()
        .optional()
        .allow(null),
      is_active: Joi.boolean()
        .optional()
    });

    // Filters schema
    this.schemas.filters = Joi.object({
      name: Joi.string().optional(),
      short_name: Joi.string().optional(),
      is_active: Joi.boolean().optional(),
      search: Joi.string().optional() // For general search
    });
  }

  // ============================================================================
  // LIFECYCLE HOOKS - Override parent methods
  // ============================================================================

  /**
   * Before creating a faculty - add custom logic
   * Example: Convert name to title case, check for duplicates
   */
  async beforeCreate(data) {
    // Example: Convert name to title case
    if (data.name) {
      data.name = data.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    // Example: Check for duplicate short_name
    // const existing = await this.findOne({ short_name: data.short_name });
    // if (existing) {
    //   throw new ConflictError(`Faculty with short name '${data.short_name}' already exists`);
    // }

    // Add any pre-creation business logic here
    console.log('beforeCreate hook executed for Faculty');
    
    return data;
  }

  /**
   * After creating a faculty - add post-creation logic
   * Example: Send notifications, create related records
   */
  async afterCreate(data, result) {
    // Example: Log the creation
    console.log(`Faculty created with ID: ${result.id}`);

    // Example: Trigger notifications
    // await notificationService.send({
    //   type: 'FACULTY_CREATED',
    //   data: result
    // });

    return result;
  }

  /**
   * Before updating a faculty
   */
  async beforeUpdate(id, data) {
    // Example: Prevent changing short_name if faculty has departments
    // const departments = await this.getDepartments(id);
    // if (departments.length > 0 && data.short_name) {
    //   throw new ValidationError('Cannot change short_name for faculty with existing departments');
    // }

    console.log(`beforeUpdate hook executed for Faculty ID: ${id}`);
    
    return data;
  }

  /**
   * After updating a faculty
   */
  async afterUpdate(id, data, result) {
    console.log(`Faculty updated with ID: ${id}`);
    return result;
  }

  /**
   * Before deleting a faculty
   */
  async beforeDelete(id) {
    // Example: Check if faculty has departments
    // const departments = await this.getDepartments(id);
    // if (departments.length > 0) {
    //   throw new ValidationError('Cannot delete faculty with existing departments');
    // }

    console.log(`beforeDelete hook executed for Faculty ID: ${id}`);
  }

  /**
   * After deleting a faculty
   */
  async afterDelete(id) {
    console.log(`Faculty deleted with ID: ${id}`);
  }

  // ============================================================================
  // CUSTOM BUSINESS METHODS
  // ============================================================================

  /**
   * Get all departments for a faculty
   * @param {number} facultyId - Faculty ID
   * @returns {Promise<Array>}
   */
  async getDepartments(facultyId) {
    try {
      // Verify faculty exists
      await this.getById(facultyId);

      // Fetch departments
      // return await Department.findAll({ where: { faculty_id: facultyId } });
      
      console.log(`Fetching departments for faculty: ${facultyId}`);
      return []; // Placeholder
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get faculty statistics
   * @param {number} facultyId - Faculty ID
   * @returns {Promise<Object>}
   */
  async getStatistics(facultyId) {
    try {
      await this.getById(facultyId);

      // Example: Calculate statistics
      const stats = {
        totalDepartments: 0,
        totalTeachers: 0,
        totalStudents: 0,
        totalCourses: 0
      };

      // Fetch and calculate real statistics here
      // const departments = await this.getDepartments(facultyId);
      // stats.totalDepartments = departments.length;
      // ... more calculations

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search faculties with advanced filters
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>}
   */
  async search(searchParams) {
    try {
      const { search, ...filters } = searchParams;

      // If search term provided, search in multiple fields
      if (search) {
        filters.name = { $like: `%${search}%` };
        // Or use OR condition:
        // filters.$or = [
        //   { name: { $like: `%${search}%` } },
        //   { short_name: { $like: `%${search}%` } }
        // ];
      }

      return await this.getAll(filters);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle faculty active status
   * @param {number} facultyId - Faculty ID
   * @returns {Promise<Object>}
   */
  async toggleActive(facultyId) {
    try {
      const { data: faculty } = await this.getById(facultyId);
      
      return await this.update(facultyId, {
        is_active: !faculty.is_active
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk activate/deactivate faculties
   * @param {Array<number>} facultyIds - Array of faculty IDs
   * @param {boolean} isActive - Active status to set
   * @returns {Promise<Object>}
   */
  async bulkSetActive(facultyIds, isActive) {
    try {
      const updates = facultyIds.map(id => ({
        id,
        data: { is_active: isActive }
      }));

      return await this.bulkUpdate(updates);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = FacultyService;
