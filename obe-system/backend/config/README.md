# Backend Configuration

This directory contains all configuration files for the OBE System backend application.

## 📁 Configuration Files

### Core Configuration Files

1. **index.js** - Main configuration entry point
   - Centralized exports for all configuration modules
   - Automatic configuration validation on load
   - Quick access helpers

2. **validator.js** - Configuration validation
   - Joi-based schema validation
   - Security checks for production
   - Connection testing utilities

### Service Configuration Files

3. **database.js** - MySQL Database Configuration
   - Connection pool setup
   - Query helpers
   - Transaction support
   - Connection testing

4. **redis.js** - Redis Cache Configuration
   - Redis client setup
   - Cache helper functions (get, set, del, etc.)
   - Connection management
   - Graceful shutdown

5. **auth.js** - Authentication & Authorization
   - JWT configuration
   - Password policies
   - Session management
   - Role-based permissions
   - OAuth settings (Google, Microsoft)

6. **app.js** - Application Configuration
   - Server settings
   - Security configuration (CORS, Helmet, Rate Limiting)
   - Logging configuration
   - Feature flags
   - Pagination defaults
   - File upload settings

7. **storage.js** - File Storage Configuration
   - Local storage setup
   - AWS S3 integration
   - MinIO support
   - File type validation
   - Helper functions for upload/download

8. **email.js** - Email Service Configuration
   - SMTP configuration
   - Email templates
   - Queue integration
   - Helper functions for various email types

9. **queue.js** - Background Job Queue Configuration
   - Bull queue setup
   - Multiple queue types (email, notification, report, etc.)
   - Job processing
   - Scheduled jobs

## 🚀 Usage

### Basic Import

```javascript
const config = require('./config');

// Access specific configurations
const { database, redis, auth, app } = config;

// Use validated environment variables
console.log(config.env.NODE_ENV);
console.log(config.env.PORT);

// Use helpers
if (config.isDevelopment) {
  console.log('Running in development mode');
}
```

### Using Database

```javascript
const { database } = require('./config');

// Execute query
const users = await database.query('SELECT * FROM users WHERE is_active = ?', [true]);

// Use transaction
const result = await database.transaction(async (connection) => {
  await connection.execute('INSERT INTO users SET ?', [userData]);
  await connection.execute('INSERT INTO students SET ?', [studentData]);
  return { success: true };
});
```

### Using Redis Cache

```javascript
const { redis } = require('./config');

// Set cache
await redis.cache.set('user:123', userData, 3600); // TTL: 1 hour

// Get cache
const user = await redis.cache.get('user:123');

// Delete cache
await redis.cache.del('user:123');

// Delete pattern
await redis.cache.delPattern('user:*');
```

### Using Storage

```javascript
const { storage } = require('./config');

// Upload file
const result = await storage.storage.upload(
  fileBuffer,
  'profiles',
  'user-123.jpg',
  'image/jpeg'
);

// Get signed URL
const url = await storage.storage.getSignedUrl('profiles', 'user-123.jpg');

// Delete file
await storage.storage.delete('profiles', 'user-123.jpg');
```

### Using Email

```javascript
const { email } = require('./config');

// Send welcome email
await email.sendWelcomeEmail('user@example.com', { name: 'John Doe' });

// Send password reset
await email.sendPasswordReset('user@example.com', {
  resetUrl: 'https://app.com/reset?token=xyz'
});

// Send custom email
await email.sendEmail({
  to: 'user@example.com',
  subject: 'Test Email',
  text: 'Hello World',
  html: '<p>Hello World</p>'
});
```

### Using Queue

```javascript
const { queue } = require('./config');

// Add job to queue
await queue.addJob('email', {
  to: 'user@example.com',
  template: 'welcome',
  data: { name: 'John' }
});

// Add delayed job
await queue.addDelayedJob('notification', { message: 'Hello' }, 5000); // 5 seconds

// Add repeatable job
await queue.addRepeatableJob('cleanup', {}, { cron: '0 2 * * *' }); // Daily at 2 AM

// Process queue
queue.processQueue('email', async (job) => {
  const { to, template, data } = job.data;
  await email.sendTemplatedEmail(template, to, data);
});
```

### Using Auth

```javascript
const { auth } = require('./config');

// Check permission
if (auth.hasPermission(user.role, 'courses', 'create')) {
  // Allow course creation
}

// Check role level
if (auth.hasRoleLevel(user.role, 'hod')) {
  // User has HOD or higher privileges
}

// Validate password
const validation = auth.validatePassword(password);
if (!validation.isValid) {
  return res.status(400).json({ errors: validation.errors });
}
```

## 🔧 Environment Variables

All environment variables should be defined in the `.env` file. See `.env.example` for a complete list of available configuration options.

### Required Variables (Production)

```env
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com

# Database
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-strong-password
DB_NAME=obe_system

# Security (MUST CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
SESSION_SECRET=your-super-secure-session-secret-min-32-chars

# Redis
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password

# Email (if email verification enabled)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## ✅ Configuration Validation

The configuration is automatically validated on application startup using Joi schema validation.

### Running Validation Manually

```javascript
const { validator } = require('./config');

// Validate configuration
const result = validator.validateConfig();
console.log(result.isValid);
console.log(result.errors);

// Check security issues
const warnings = validator.checkSecurityIssues();
console.log(warnings);
```

### Connection Testing

```javascript
const { testConnections } = require('./config');

// Test all service connections
const allConnected = await testConnections();
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Keep it in `.gitignore`
2. **Use strong secrets** - Minimum 32 characters for JWT and session secrets
3. **Change default passwords** - Never use default credentials in production
4. **Enable rate limiting** - Protect against brute force attacks
5. **Use HTTPS in production** - Set `NODE_ENV=production` and configure SSL
6. **Regular updates** - Keep dependencies updated
7. **Monitor logs** - Watch for suspicious activity

## 🔍 Troubleshooting

### Configuration Validation Errors

If you see validation errors on startup:
1. Check `.env` file exists and is readable
2. Verify all required variables are set
3. Check variable formats match expected types
4. Review error messages for specific issues

### Connection Failures

If services fail to connect:
1. Verify service is running (MySQL, Redis)
2. Check credentials and host/port settings
3. Ensure firewall allows connections
4. Check network connectivity

### Common Issues

**Database connection refused**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Check port
netstat -an | grep 3306
```

**Redis connection refused**
```bash
# Check if Redis is running
sudo systemctl status redis

# Test connection
redis-cli ping
```

**Email sending fails**
- Enable "Less secure app access" for Gmail (if using Gmail)
- Use App Password instead of regular password
- Check SMTP host and port
- Verify firewall allows SMTP traffic

## 📝 Adding New Configuration

To add new configuration:

1. Create new config file (e.g., `config/newservice.js`)
2. Add validation rules to `config/validator.js`
3. Add environment variables to `.env.example`
4. Export from `config/index.js`
5. Update this README

Example:
```javascript
// config/newservice.js
require('dotenv').config();

const newServiceConfig = {
  apiKey: process.env.NEW_SERVICE_API_KEY,
  endpoint: process.env.NEW_SERVICE_ENDPOINT,
};

module.exports = newServiceConfig;
```

## 📚 Related Documentation

- [Express.js Documentation](https://expressjs.com/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [ioredis Documentation](https://github.com/luin/ioredis)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [Nodemailer Documentation](https://nodemailer.com/)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Joi Validation Documentation](https://joi.dev/)

## 🤝 Contributing

When modifying configuration:
1. Update validation schema
2. Update `.env.example`
3. Update this README
4. Test thoroughly in development
5. Document breaking changes

## 📄 License

Copyright © 2026 OBE System. All rights reserved.
