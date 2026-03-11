/**
 * AuthService Usage Examples
 * Demonstrates how to use AuthService in your application
 * 
 * @author OBE System Team
 * @version 1.0.0
 */

const AuthService = require('./AuthService');

// Initialize service
const authService = new AuthService();

// ============================================================================
// Example 1: User Login
// ============================================================================

async function loginExample() {
  try {
    const result = await authService.login(
      'admin@obe.edu',      // email or username
      'password123',        // password
      {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    );

    console.log('Login successful!');
    console.log('User:', result.user);
    console.log('Access Token:', result.tokens.accessToken);
    console.log('Refresh Token:', result.tokens.refreshToken);
    console.log('Session ID:', result.sessionId);

    return result;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
}

// ============================================================================
// Example 2: User Registration
// ============================================================================

async function registerExample() {
  try {
    const result = await authService.register({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'SecurePass123!',
      role: 'student',
      phone: '+1234567890',
      date_of_birth: '2000-01-01',
      gender_id: 1
    });

    console.log('Registration successful!');
    console.log('User:', result.user);
    console.log('Access Token:', result.tokens.accessToken);

    return result;
  } catch (error) {
    console.error('Registration failed:', error.message);
    if (error.details) {
      console.error('Validation errors:', error.details);
    }
    throw error;
  }
}

// ============================================================================
// Example 3: Refresh Token
// ============================================================================

async function refreshTokenExample(refreshToken) {
  try {
    const result = await authService.refreshToken(refreshToken, {
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0'
    });

    console.log('Token refreshed successfully!');
    console.log('New Access Token:', result.accessToken);
    console.log('Expires In:', result.expiresIn);

    return result;
  } catch (error) {
    console.error('Token refresh failed:', error.message);
    throw error;
  }
}

// ============================================================================
// Example 4: Logout
// ============================================================================

async function logoutExample(userId, refreshToken) {
  try {
    const success = await authService.logout(userId, refreshToken);

    console.log('Logout successful:', success);

    return success;
  } catch (error) {
    console.error('Logout failed:', error.message);
    throw error;
  }
}

// ============================================================================
// Example 5: Forgot Password
// ============================================================================

async function forgotPasswordExample() {
  try {
    const resetToken = await authService.forgotPassword('admin@obe.edu');

    console.log('Password reset token generated!');
    console.log('Reset Token:', resetToken);
    console.log('Send this token to user via email');

    // In production, send via email:
    // await emailService.sendPasswordResetEmail('admin@obe.edu', resetToken);

    return resetToken;
  } catch (error) {
    console.error('Forgot password failed:', error.message);
    throw error;
  }
}

// ============================================================================
// Example 6: Reset Password
// ============================================================================

async function resetPasswordExample(resetToken) {
  try {
    const success = await authService.resetPassword(
      resetToken,
      'NewSecurePass123!'
    );

    console.log('Password reset successful:', success);
    console.log('All user sessions have been invalidated');

    return success;
  } catch (error) {
    console.error('Password reset failed:', error.message);
    throw error;
  }
}

// ============================================================================
// Example 7: Verify Access Token
// ============================================================================

async function verifyTokenExample(accessToken) {
  try {
    const user = await authService.verifyAccessToken(accessToken);

    console.log('Token is valid!');
    console.log('Authenticated User:', user);

    return user;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw error;
  }
}

// ============================================================================
// Complete Workflow Example
// ============================================================================

async function completeWorkflowExample() {
  console.log('\n=== Starting Complete Workflow ===\n');

  // Step 1: Register new user
  console.log('Step 1: Registering new user...');
  const registerResult = await registerExample();
  const userId = registerResult.user.id;
  const refreshToken = registerResult.tokens.refreshToken;
  const accessToken = registerResult.tokens.accessToken;

  // Step 2: Verify access token
  console.log('\nStep 2: Verifying access token...');
  await verifyTokenExample(accessToken);

  // Step 3: Refresh token (simulate after 1 hour)
  console.log('\nStep 3: Refreshing access token...');
  const newTokens = await refreshTokenExample(refreshToken);

  // Step 4: Forgot password
  console.log('\nStep 4: Requesting password reset...');
  const resetToken = await forgotPasswordExample();

  // Step 5: Reset password
  console.log('\nStep 5: Resetting password...');
  await resetPasswordExample(resetToken);

  // Step 6: Login with new password
  console.log('\nStep 6: Logging in with new password...');
  const loginResult = await authService.login('john.doe@example.com', 'NewSecurePass123!');

  // Step 7: Logout
  console.log('\nStep 7: Logging out...');
  await logoutExample(loginResult.user.id, loginResult.tokens.refreshToken);

  console.log('\n=== Workflow Complete ===\n');
}

// ============================================================================
// Express Controller Example
// ============================================================================

function expressControllerExample() {
  const { asyncHandler } = require('../utils/asyncHandler');

  return {
    // POST /api/v1/auth/login
    login: asyncHandler(async (req, res) => {
      const { email, password } = req.body;

      const result = await authService.login(email, password, {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          tokenType: result.tokens.tokenType,
          expiresIn: result.tokens.expiresIn
        },
        message: 'Login successful'
      });
    }),

    // POST /api/v1/auth/register
    register: asyncHandler(async (req, res) => {
      const result = await authService.register(req.body);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          tokenType: result.tokens.tokenType,
          expiresIn: result.tokens.expiresIn
        },
        message: 'Registration successful'
      });
    }),

    // POST /api/v1/auth/logout
    logout: asyncHandler(async (req, res) => {
      const refreshToken = req.cookies.refreshToken;

      await authService.logout(req.user.id, refreshToken);

      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    }),

    // POST /api/v1/auth/refresh-token
    refreshToken: asyncHandler(async (req, res) => {
      const refreshToken = req.cookies.refreshToken;

      const result = await authService.refreshToken(refreshToken, {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Token refreshed successfully'
      });
    }),

    // POST /api/v1/auth/forgot-password
    forgotPassword: asyncHandler(async (req, res) => {
      const { email } = req.body;

      const resetToken = await authService.forgotPassword(email);

      // TODO: Send email with reset token
      // await emailService.sendPasswordResetEmail(email, resetToken);

      res.status(200).json({
        success: true,
        message: 'Password reset instructions sent to email',
        // In development only:
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      });
    }),

    // POST /api/v1/auth/reset-password
    resetPassword: asyncHandler(async (req, res) => {
      const { token, newPassword } = req.body;

      await authService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successful. Please login with your new password.'
      });
    }),

    // GET /api/v1/auth/me
    getMe: asyncHandler(async (req, res) => {
      const user = await authService.getUser(req.user.id);

      res.status(200).json({
        success: true,
        data: user
      });
    })
  };
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  loginExample,
  registerExample,
  refreshTokenExample,
  logoutExample,
  forgotPasswordExample,
  resetPasswordExample,
  verifyTokenExample,
  completeWorkflowExample,
  expressControllerExample
};

// ============================================================================
// Run Examples (uncomment to test)
// ============================================================================

// Uncomment to run complete workflow:
// completeWorkflowExample().catch(console.error);
