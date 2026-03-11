/**
 * FacultyController Example
 * Demonstrates how to extend BaseController for specific resources
 * 
 * This is an EXAMPLE file showing the pattern.
 * Actual implementation will be created when needed.
 */

const BaseController = require('./BaseController');
// const FacultyService = require('../services/FacultyService');

class FacultyController extends BaseController {
  constructor() {
    // Initialize with the appropriate service
    // super(new FacultyService());
    super(null); // Placeholder for example
  }

  /**
   * Custom method example: Get departments for a faculty
   * GET /api/v1/faculties/:id/departments
   */
  getDepartments = this.customAction(async (req, res) => {
    const { id } = req.params;
    
    // Custom business logic
    const departments = await this.service.getDepartments(parseInt(id));
    
    return {
      data: departments,
      message: 'Departments retrieved successfully'
    };
  });

  /**
   * Custom method example: Get statistics
   * GET /api/v1/faculties/:id/statistics
   */
  getStatistics = this.customAction(async (req, res) => {
    const { id } = req.params;
    
    const stats = await this.service.getStatistics(parseInt(id));
    
    return {
      data: stats,
      message: 'Faculty statistics retrieved successfully',
      meta: {
        calculatedAt: new Date().toISOString()
      }
    };
  });

  /**
   * Override a base method if needed
   * For example, customize the index method
   */
  // index = this.customAction(async (req, res) => {
  //   // Custom implementation
  //   const { page, limit, offset, sort, order } = this.getPaginationParams(req.query);
  //   
  //   // Add custom logic
  //   const includeInactive = req.query.includeInactive === 'true';
  //   
  //   const result = await this.service.getAll({
  //     limit,
  //     offset,
  //     sort,
  //     order,
  //     includeInactive
  //   });
  //   
  //   const meta = this.buildPaginationMeta(result.total, page, limit);
  //   
  //   return {
  //     data: result.data,
  //     message: 'Faculties retrieved successfully',
  //     meta
  //   };
  // });
}

// Export singleton instance
// module.exports = new FacultyController();

module.exports = FacultyController;
