# AuthService Documentation

## Overview

The `AuthService` class provides comprehensive authentication and authorization functionality for the OBE System. It handles user login, registration, JWT token management, password reset, and session tracking.

## Features

✅ **User Authentication**
- Login with email or username
- Password validation with bcrypt
- Account status checking (active/inactive)

✅ **JWT Token Management**
- Access tokens (expires in 1 hour)
- Refresh tokens (expires in 7 days)
- Token verification and validation
- Automatic token type checking

✅ **User Registration**
- Input validation with Joi
- Password strength requirements
- Duplicate email/username checking
- Automatic password hashing

✅ **Session Management**
- Session creation with metadata (IP, user agent)
- Session tracking in database
- Session invalidation on logout
- Automatic cleanup of expired sessions

✅ **Password Reset**
- Secure token generation
- Token expiration (10 minutes)
- Email-based reset flow
- Automatic session invalidation after reset

✅ **Security Features**
- Password hashing with bcrypt (12 rounds)
- JWT with signature verification
- Token type validation (access vs refresh)
- Session-based token invalidation
- Protection against token reuse

## Installation

The AuthService is already integrated into the OBE System. Ensure you have the required dependencies:

```bash
npm install jsonwebtoken bcryptjs joi
```

## Usage

### Import and Initialize

```javascript
const AuthService = require('./services/AuthService');

const authService = new AuthService();
```

### 1. User Login

```javascript
try {
  const result = await authService.login(
    'user@example.com',  // email or username
    'SecurePass123!',     // password
    {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  );

  console.log(result);
  // {
  //   user: { id, email, username, role, ... },
  //   tokens: {
  //     accessToken: 'eyJhbGc...',
  //     refreshToken: 'eyJhbGc...',
  //     tokenType: 'Bearer',
  //     expiresIn: '1h'
  //   },
  //   sessionId: 'uuid-v4-session-id'
  // }
} catch (error) {
  // Handle errors: ValidationError, UnauthorizedError
  console.error(error.message);
}
```

### 2. User Registration

```javascript
try {
  const result = await authService.register({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    username: 'johndoe',
    password: 'SecurePass123!',
    role: 'student',  // admin, hod, teacher, student
    phone: '+1234567890',
    date_of_birth: '2000-01-01',
    gender_id: 1
  });

  console.log(result);
  // {
  //   user: { id, email, username, role, ... },
  //   tokens: { accessToken, refreshToken, ... },
  //   sessionId: 'uuid-v4-session-id'
  // }
} catch (error) {
  // Handle errors: ValidationError (duplicate email/username)
  console.error(error.message);
}
```

### 3. Logout

```javascript
try {
  const success = await authService.logout(
    userId,       // User ID
    refreshToken  // Refresh token from login
  );

  console.log('Logout successful:', success);
} catch (error) {
  console.error(error.message);
}
```

### 4. Refresh Access Token

```javascript
try {
  const result = await authService.refreshToken(
    refreshToken,  // Current refresh token
    {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  );

  console.log(result);
  // {
  //   accessToken: 'new-access-token',
  //   tokenType: 'Bearer',
  //   expiresIn: '1h'
  // }
} catch (error) {
  // Handle errors: UnauthorizedError (invalid/expired token)
  console.error(error.message);
}
```

### 5. Forgot Password

```javascript
try {
  const resetToken = await authService.forgotPassword('user@example.com');

  // Send resetToken via email to user
  // In production: emailService.sendPasswordResetEmail(email, resetToken)
  
  console.log('Reset token:', resetToken);
  // 'a1b2c3d4e5f6...' (64 character hex string)
} catch (error) {
  // Handle errors: NotFoundError (email not found)
  console.error(error.message);
}
```

### 6. Reset Password

```javascript
try {
  const success = await authService.resetPassword(
    resetToken,      // Token from forgot password
    'NewSecurePass123!'  // New password
  );

  console.log('Password reset successful:', success);
  // All user sessions are invalidated
} catch (error) {
  // Handle errors: UnauthorizedError (invalid/expired token), ValidationError
  console.error(error.message);
}
```

### 7. Verify Access Token

```javascript
try {
  const user = await authService.verifyAccessToken(accessToken);

  console.log('Authenticated user:', user);
  // { id, email, username, role, ... }
} catch (error) {
  // Handle errors: UnauthorizedError (invalid/expired token)
  console.error(error.message);
}
```

### 8. Get User by ID

```javascript
try {
  const user = await authService.getUser(userId);

  console.log('User:', user);
} catch (error) {
  // Handle errors: NotFoundError
  console.error(error.message);
}
```

## Controller Integration Example

```javascript
const AuthService = require('../services/AuthService');
const { asyncHandler } = require('../utils/asyncHandler');

const authService = new AuthService();

// Login controller
exports.login = asyncHandler(async (req, res) => {
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
});

// Register controller
exports.register = asyncHandler(async (req, res) => {
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
});

// Logout controller
exports.logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  await authService.logout(req.user.id, refreshToken);

  res.clearCookie('refreshToken');

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// Refresh token controller
exports.refreshToken = asyncHandler(async (req, res) => {
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
});

// Forgot password controller
exports.forgotPassword = asyncHandler(async (req, res) => {
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
});

// Reset password controller
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  await authService.resetPassword(token, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password reset successful. Please login with your new password.'
  });
});

// Get current user controller
exports.getMe = asyncHandler(async (req, res) => {
  // req.user is set by auth middleware
  const user = await authService.getUser(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});
```

## Password Requirements

The AuthService enforces the following password requirements:

- **Minimum length:** 8 characters
- **Maximum length:** 128 characters
- **Must contain:**
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (@$!%*?&)

Example valid passwords:
- `SecurePass123!`
- `MyP@ssw0rd`
- `Admin2026!`

## Token Expiration

| Token Type | Expiration | Use Case |
|------------|------------|----------|
| Access Token | 1 hour | API authentication |
| Refresh Token | 7 days | Renewing access tokens |
| Reset Token | 10 minutes | Password reset |

## Error Handling

The AuthService throws the following custom errors:

| Error Type | HTTP Status | When Thrown |
|------------|-------------|-------------|
| `ValidationError` | 400 | Invalid input data, duplicate email/username |
| `UnauthorizedError` | 401 | Invalid credentials, expired/invalid tokens |
| `NotFoundError` | 404 | User/email not found |
| `AppError` | 500 | Database/server errors |

## Security Best Practices

1. **Always use HTTPS in production** to protect tokens in transit
2. **Store refresh tokens as HTTP-only cookies** to prevent XSS attacks
3. **Implement rate limiting** on login and password reset endpoints
4. **Run cleanup jobs periodically:**
   ```javascript
   // Cron job example
   const authService = new AuthService();
   
   // Run every hour
   setInterval(async () => {
     await authService.cleanupExpiredSessions();
     await authService.cleanupExpiredResetTokens();
   }, 60 * 60 * 1000);
   ```
5. **Invalidate all sessions on password change**
6. **Log authentication events** for security auditing
7. **Use environment variables** for JWT secrets and configuration

## Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRY=1h
JWT_REFRESH_TOKEN_EXPIRY=7d
JWT_RESET_PASSWORD_EXPIRY=10m

# App Configuration
APP_NAME=OBE System
APP_URL=http://localhost:3000
NODE_ENV=development

# Password Configuration
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
```

## Testing

```javascript
const AuthService = require('./services/AuthService');

describe('AuthService', () => {
  let authService;
  
  beforeEach(() => {
    authService = new AuthService();
  });

  test('should login user with valid credentials', async () => {
    const result = await authService.login('admin@obe.edu', 'password123');
    
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('tokens');
    expect(result.tokens).toHaveProperty('accessToken');
    expect(result.tokens).toHaveProperty('refreshToken');
  });

  test('should throw error for invalid credentials', async () => {
    await expect(
      authService.login('admin@obe.edu', 'wrongpassword')
    ).rejects.toThrow('Invalid credentials');
  });

  test('should register new user', async () => {
    const userData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'TestPass123!',
      role: 'student'
    };

    const result = await authService.register(userData);
    
    expect(result.user.email).toBe(userData.email);
    expect(result.tokens.accessToken).toBeDefined();
  });

  test('should refresh access token', async () => {
    const loginResult = await authService.login('admin@obe.edu', 'password123');
    
    const refreshResult = await authService.refreshToken(
      loginResult.tokens.refreshToken
    );
    
    expect(refreshResult.accessToken).toBeDefined();
    expect(refreshResult.tokenType).toBe('Bearer');
  });
});
```

## Next Steps

After implementing AuthService, proceed to:
1. ✅ **Step 2.3:** Create AuthController
2. ✅ **Step 2.4:** Create Auth Middleware
3. ✅ **Step 2.5:** Create Auth Routes

## Support

For issues or questions, refer to:
- `/obe-system/backend/services/README.md` - BaseService documentation
- `/obe-system/backend/models/User.js` - User model implementation
- `/obe-system/backend/config/auth.js` - Authentication configuration
