const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../middlewares/asyncHandler');
const { body, param, query } = require('express-validator');
const db = require('../config/database');

// ============================================
// User Management Routes
// ============================================

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination and filters
 * @access  Protected (Admin, HOD)
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'hod'),
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      role,
      status = 'active',
      search
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE deleted_at IS NULL';
    const params = [];

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const [users] = await db.query(
      `SELECT id, username, email, full_name, role, status, last_login_at, 
              created_at, updated_at 
       FROM users 
       ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  })
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Protected (Admin, HOD, or own profile)
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Users can only view their own profile unless they're admin/hod
    if (req.user.id !== parseInt(id) && !['admin', 'hod'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own profile'
      });
    }

    const [[user]] = await db.query(
      `SELECT id, username, email, full_name, role, status, last_login_at,
              email_verified_at, created_at, updated_at
       FROM users
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  })
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Protected (Admin, HOD, or own profile for limited fields)
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id').isInt().withMessage('Invalid user ID'),
    body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
    body('role').optional().isIn(['admin', 'hod', 'teacher', 'student']).withMessage('Invalid role')
  ],
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { full_name, email, status, role } = req.body;

    // Check if user can update this profile
    const isOwnProfile = req.user.id === parseInt(id);
    const isAdmin = req.user.role === 'admin';
    const isHOD = req.user.role === 'hod';

    if (!isOwnProfile && !isAdmin && !isHOD) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this user'
      });
    }

    // Users can only update their own name and email
    if (isOwnProfile && !isAdmin && (status || role)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your name and email'
      });
    }

    const updates = [];
    const params = [];

    if (full_name !== undefined) {
      updates.push('full_name = ?');
      params.push(full_name);
    }

    if (email !== undefined) {
      // Check if email already exists
      const [[existing]] = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ? AND deleted_at IS NULL',
        [email, id]
      );

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }

      updates.push('email = ?');
      params.push(email);
    }

    if (status !== undefined && (isAdmin || isHOD)) {
      updates.push('status = ?');
      params.push(status);
    }

    if (role !== undefined && isAdmin) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
      params
    );

    const [[updatedUser]] = await db.query(
      `SELECT id, username, email, full_name, role, status, last_login_at,
              email_verified_at, created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  })
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Soft delete user
 * @access  Protected (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const [[user]] = await db.query(
      'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await db.query(
      'UPDATE users SET deleted_at = NOW(), status = "inactive" WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  })
);

/**
 * @route   GET /api/v1/users/stats/overview
 * @desc    Get user statistics
 * @access  Protected (Admin, HOD)
 */
router.get(
  '/stats/overview',
  authenticate,
  authorize('admin', 'hod'),
  asyncHandler(async (req, res) => {
    const [[stats]] = await db.query(`
      SELECT
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as total_students,
        SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) as total_teachers,
        SUM(CASE WHEN role = 'hod' THEN 1 ELSE 0 END) as total_hods,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users
      FROM users
      WHERE deleted_at IS NULL
    `);

    res.json({
      success: true,
      data: stats
    });
  })
);

module.exports = router;
