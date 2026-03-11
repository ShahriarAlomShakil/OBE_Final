const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Rate limiter for auth endpoints (5 requests per minute)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again after a minute.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts. Please try again after a minute.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 60
      }
    });
  }
});

// Public routes (with rate limiting)
router.post(
  '/login',
  authLimiter,
  AuthController.loginValidation,
  AuthController.login
);

router.post(
  '/register',
  authLimiter,
  AuthController.registerValidation,
  AuthController.register
);

router.post(
  '/forgot-password',
  authLimiter,
  AuthController.forgotPasswordValidation,
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  AuthController.resetPasswordValidation,
  AuthController.resetPassword
);

// Refresh token endpoint (slightly less restrictive rate limit)
router.post(
  '/refresh-token',
  AuthController.refreshTokenValidation,
  AuthController.refreshToken
);

// Protected routes (require authentication)
router.post(
  '/logout',
  authenticate,
  AuthController.logout
);

router.get(
  '/me',
  authenticate,
  AuthController.me
);

module.exports = router;
