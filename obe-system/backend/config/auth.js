require('dotenv').config();

// JWT Configuration
const jwtConfig = {
  // JWT Secret keys
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  
  // Token expiration times
  accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m', // 15 minutes
  refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d', // 7 days
  resetPasswordExpiry: process.env.JWT_RESET_PASSWORD_EXPIRY || '10m', // 10 minutes
  emailVerificationExpiry: process.env.JWT_EMAIL_VERIFICATION_EXPIRY || '24h', // 24 hours
  
  // Token options
  issuer: process.env.APP_NAME || 'OBE System',
  audience: process.env.APP_URL || 'http://localhost:3000',
  
  // Algorithm
  algorithm: 'HS256',
  
  // Cookie options for refresh token
  cookie: {
    name: 'refreshToken',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  }
};

// Password Configuration
const passwordConfig = {
  // Bcrypt rounds for hashing
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  
  // Password policy
  minLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  
  // Password history
  preventReuse: true,
  historyCount: 5, // Last 5 passwords cannot be reused
  
  // Password reset
  resetTokenLength: 32,
  resetLinkExpiry: '10m',
  
  // Password validation regex
  regex: {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
  }
};

// Session Configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
  name: 'sessionId',
  rolling: true, // Reset expiration on each request
};

// Account Security Configuration
const securityConfig = {
  // Login attempts
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  lockTime: parseInt(process.env.LOCK_TIME) || 15, // minutes
  lockTimeMs: (parseInt(process.env.LOCK_TIME) || 15) * 60 * 1000,
  
  // Session settings
  maxConcurrentSessions: 5,
  sessionInactivityTimeout: 30 * 60 * 1000, // 30 minutes
  
  // Password expiry
  passwordExpiryDays: 90,
  passwordExpiryWarningDays: 7,
  
  // Two-factor authentication
  twoFactorEnabled: process.env.TWO_FACTOR_ENABLED === 'true',
  twoFactorIssuer: process.env.APP_NAME || 'OBE System',
  
  // IP whitelist (optional)
  ipWhitelist: process.env.IP_WHITELIST ? process.env.IP_WHITELIST.split(',') : [],
  
  // User agent tracking
  trackUserAgent: true,
  
  // Remember me
  rememberMeDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// OAuth Configuration (for future implementation)
const oauthConfig = {
  google: {
    enabled: process.env.OAUTH_GOOGLE_ENABLED === 'true',
    clientId: process.env.OAUTH_GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || '',
    callbackURL: `${process.env.APP_URL}/api/auth/google/callback`,
    scope: ['profile', 'email']
  },
  microsoft: {
    enabled: process.env.OAUTH_MICROSOFT_ENABLED === 'true',
    clientId: process.env.OAUTH_MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.OAUTH_MICROSOFT_CLIENT_SECRET || '',
    callbackURL: `${process.env.APP_URL}/api/auth/microsoft/callback`,
    scope: ['user.read']
  }
};

// Role-based permissions
const roles = {
  ADMIN: 'admin',
  DEAN: 'dean',
  HOD: 'hod',
  TEACHER: 'teacher',
  STUDENT: 'student',
  STAFF: 'staff'
};

// Role hierarchy (for permission checking)
const roleHierarchy = {
  admin: 6,
  dean: 5,
  hod: 4,
  teacher: 3,
  staff: 2,
  student: 1
};

// Permission modules
const permissions = {
  // User management
  users: {
    create: ['admin'],
    read: ['admin', 'dean', 'hod', 'teacher', 'staff'],
    update: ['admin'],
    delete: ['admin'],
    viewAll: ['admin', 'dean', 'hod']
  },
  
  // Student management
  students: {
    create: ['admin', 'staff'],
    read: ['admin', 'dean', 'hod', 'teacher', 'staff'],
    update: ['admin', 'staff'],
    delete: ['admin'],
    viewAll: ['admin', 'dean', 'hod', 'teacher']
  },
  
  // Course management
  courses: {
    create: ['admin', 'hod'],
    read: ['admin', 'dean', 'hod', 'teacher', 'student'],
    update: ['admin', 'hod'],
    delete: ['admin', 'hod'],
    approve: ['admin', 'dean']
  },
  
  // Assessment management
  assessments: {
    create: ['admin', 'hod', 'teacher'],
    read: ['admin', 'dean', 'hod', 'teacher'],
    update: ['admin', 'teacher'],
    delete: ['admin', 'hod'],
    grade: ['teacher'],
    viewGrades: ['admin', 'dean', 'hod', 'teacher', 'student']
  },
  
  // Reports
  reports: {
    generate: ['admin', 'dean', 'hod', 'teacher'],
    viewAll: ['admin', 'dean', 'hod'],
    export: ['admin', 'dean', 'hod']
  }
};

/**
 * Check if user has required permission
 * @param {string} userRole - User's role
 * @param {string} module - Permission module
 * @param {string} action - Action to perform
 * @returns {boolean} - Has permission
 */
const hasPermission = (userRole, module, action) => {
  if (!permissions[module] || !permissions[module][action]) {
    return false;
  }
  return permissions[module][action].includes(userRole);
};

/**
 * Check if user role has higher or equal level than required role
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role
 * @returns {boolean} - Has access
 */
const hasRoleLevel = (userRole, requiredRole) => {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < passwordConfig.minLength) {
    errors.push(`Password must be at least ${passwordConfig.minLength} characters long`);
  }
  
  if (password.length > passwordConfig.maxLength) {
    errors.push(`Password must not exceed ${passwordConfig.maxLength} characters`);
  }
  
  if (passwordConfig.requireUppercase && !passwordConfig.regex.uppercase.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (passwordConfig.requireLowercase && !passwordConfig.regex.lowercase.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (passwordConfig.requireNumbers && !passwordConfig.regex.number.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (passwordConfig.requireSpecialChars && !passwordConfig.regex.specialChar.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  jwtConfig,
  passwordConfig,
  sessionConfig,
  securityConfig,
  oauthConfig,
  roles,
  roleHierarchy,
  permissions,
  hasPermission,
  hasRoleLevel,
  validatePassword
};
