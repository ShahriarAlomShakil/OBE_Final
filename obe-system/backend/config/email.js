const nodemailer = require('nodemailer');
require('dotenv').config();

// Email Configuration
const emailConfig = {
  // SMTP configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
    // Connection timeout
    connectionTimeout: parseInt(process.env.SMTP_TIMEOUT) || 10000,
    greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT) || 10000,
    socketTimeout: parseInt(process.env.SMTP_SOCKET_TIMEOUT) || 10000,
    // Debug
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  },
  
  // Default sender
  from: {
    email: process.env.EMAIL_FROM || 'noreply@obesystem.com',
    name: process.env.EMAIL_FROM_NAME || 'OBE System',
  },
  
  // Email templates configuration
  templates: {
    enabled: process.env.EMAIL_TEMPLATES_ENABLED !== 'false',
    path: process.env.EMAIL_TEMPLATES_PATH || './templates/emails',
    engine: process.env.EMAIL_TEMPLATE_ENGINE || 'ejs', // ejs, handlebars, pug
  },
  
  // Queue configuration
  queue: {
    enabled: process.env.EMAIL_QUEUE_ENABLED !== 'false',
    name: process.env.EMAIL_QUEUE_NAME || 'email',
    attempts: parseInt(process.env.EMAIL_QUEUE_ATTEMPTS) || 3,
    backoff: {
      type: 'exponential',
      delay: parseInt(process.env.EMAIL_QUEUE_BACKOFF) || 5000,
    },
  },
  
  // Rate limiting
  rateLimit: {
    enabled: process.env.EMAIL_RATE_LIMIT_ENABLED !== 'false',
    maxPerHour: parseInt(process.env.EMAIL_RATE_LIMIT_PER_HOUR) || 100,
    maxPerDay: parseInt(process.env.EMAIL_RATE_LIMIT_PER_DAY) || 1000,
  },
  
  // Email types
  types: {
    welcome: {
      subject: 'Welcome to OBE System',
      template: 'welcome',
      priority: 'high',
    },
    emailVerification: {
      subject: 'Verify Your Email Address',
      template: 'email-verification',
      priority: 'high',
    },
    passwordReset: {
      subject: 'Reset Your Password',
      template: 'password-reset',
      priority: 'high',
    },
    passwordChanged: {
      subject: 'Your Password Has Been Changed',
      template: 'password-changed',
      priority: 'high',
    },
    accountLocked: {
      subject: 'Account Locked - Security Alert',
      template: 'account-locked',
      priority: 'high',
    },
    loginAlert: {
      subject: 'New Login Detected',
      template: 'login-alert',
      priority: 'normal',
    },
    courseEnrollment: {
      subject: 'Course Enrollment Confirmation',
      template: 'course-enrollment',
      priority: 'normal',
    },
    assessmentReminder: {
      subject: 'Upcoming Assessment Reminder',
      template: 'assessment-reminder',
      priority: 'normal',
    },
    gradePublished: {
      subject: 'Grades Published',
      template: 'grade-published',
      priority: 'normal',
    },
    resultPublished: {
      subject: 'Results Published',
      template: 'result-published',
      priority: 'high',
    },
    notification: {
      subject: 'Notification from OBE System',
      template: 'notification',
      priority: 'low',
    },
    report: {
      subject: 'Report Generated',
      template: 'report',
      priority: 'normal',
    },
  },
  
  // Email options
  options: {
    // Text encoding
    textEncoding: 'utf-8',
    
    // HTML encoding
    htmlEncoding: 'utf-8',
    
    // Include plain text version
    includePlainText: true,
    
    // Include attachments
    maxAttachmentSize: parseInt(process.env.EMAIL_MAX_ATTACHMENT_SIZE) || 5 * 1024 * 1024, // 5MB
    
    // Track opens
    trackOpens: process.env.EMAIL_TRACK_OPENS === 'true',
    
    // Track clicks
    trackClicks: process.env.EMAIL_TRACK_CLICKS === 'true',
  },
  
  // Testing
  testing: {
    enabled: process.env.NODE_ENV === 'development' || process.env.EMAIL_TESTING_ENABLED === 'true',
    interceptEmail: process.env.EMAIL_INTERCEPT_EMAIL || null, // Send all emails to this address
    ethereal: process.env.EMAIL_USE_ETHEREAL === 'true', // Use ethereal.email for testing
  }
};

// Create transporter
let transporter = null;

/**
 * Initialize email transporter
 */
const initializeTransporter = async () => {
  try {
    // Use Ethereal for testing if enabled
    if (emailConfig.testing.ethereal) {
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      console.log('✓ Email transporter initialized (Ethereal - Testing)');
      console.log(`  Preview URLs at: https://ethereal.email/messages`);
      return;
    }
    
    // Use configured SMTP
    transporter = nodemailer.createTransport(emailConfig.smtp);
    
    // Verify connection
    await transporter.verify();
    console.log('✓ Email transporter initialized and verified');
  } catch (error) {
    console.error('✗ Email transporter initialization failed:', error.message);
    transporter = null;
  }
};

/**
 * Send email
 * @param {object} options - Email options
 * @returns {Promise<object>} - Send result
 */
const sendEmail = async (options) => {
  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }
    
    // Override recipient in testing mode
    const to = emailConfig.testing.interceptEmail || options.to;
    
    // Prepare email
    const mailOptions = {
      from: options.from || `${emailConfig.from.name} <${emailConfig.from.email}>`,
      to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
      cc: options.cc || undefined,
      bcc: options.bcc || undefined,
      replyTo: options.replyTo || undefined,
      attachments: options.attachments || undefined,
      priority: options.priority || 'normal',
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // Log preview URL if using Ethereal
    if (emailConfig.testing.ethereal) {
      console.log('📧 Email sent (Test mode)');
      console.log('  Preview URL:', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('📧 Email sent successfully:', info.messageId);
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: emailConfig.testing.ethereal ? nodemailer.getTestMessageUrl(info) : null,
    };
  } catch (error) {
    console.error('✗ Email send failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send templated email
 * @param {string} type - Email type
 * @param {string} to - Recipient email
 * @param {object} data - Template data
 * @param {object} options - Additional options
 * @returns {Promise<object>} - Send result
 */
const sendTemplatedEmail = async (type, to, data = {}, options = {}) => {
  const emailType = emailConfig.types[type];
  
  if (!emailType) {
    throw new Error(`Unknown email type: ${type}`);
  }
  
  // TODO: Load and render template
  // For now, send plain text
  const text = `${emailType.subject}\n\n${JSON.stringify(data, null, 2)}`;
  
  return await sendEmail({
    to,
    subject: options.subject || emailType.subject,
    text,
    html: options.html || `<pre>${text}</pre>`,
    priority: options.priority || emailType.priority,
    ...options,
  });
};

/**
 * Send welcome email
 * @param {string} to - Recipient email
 * @param {object} data - User data
 * @returns {Promise<object>} - Send result
 */
const sendWelcomeEmail = async (to, data) => {
  return await sendTemplatedEmail('welcome', to, data);
};

/**
 * Send email verification
 * @param {string} to - Recipient email
 * @param {object} data - Verification data (token, url)
 * @returns {Promise<object>} - Send result
 */
const sendEmailVerification = async (to, data) => {
  return await sendTemplatedEmail('emailVerification', to, data);
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {object} data - Reset data (token, url)
 * @returns {Promise<object>} - Send result
 */
const sendPasswordReset = async (to, data) => {
  return await sendTemplatedEmail('passwordReset', to, data);
};

/**
 * Send password changed notification
 * @param {string} to - Recipient email
 * @param {object} data - User data
 * @returns {Promise<object>} - Send result
 */
const sendPasswordChanged = async (to, data) => {
  return await sendTemplatedEmail('passwordChanged', to, data);
};

/**
 * Send account locked notification
 * @param {string} to - Recipient email
 * @param {object} data - Lock data
 * @returns {Promise<object>} - Send result
 */
const sendAccountLocked = async (to, data) => {
  return await sendTemplatedEmail('accountLocked', to, data);
};

/**
 * Send login alert
 * @param {string} to - Recipient email
 * @param {object} data - Login data (ip, location, device)
 * @returns {Promise<object>} - Send result
 */
const sendLoginAlert = async (to, data) => {
  return await sendTemplatedEmail('loginAlert', to, data);
};

/**
 * Send course enrollment confirmation
 * @param {string} to - Recipient email
 * @param {object} data - Enrollment data
 * @returns {Promise<object>} - Send result
 */
const sendCourseEnrollment = async (to, data) => {
  return await sendTemplatedEmail('courseEnrollment', to, data);
};

/**
 * Send assessment reminder
 * @param {string} to - Recipient email
 * @param {object} data - Assessment data
 * @returns {Promise<object>} - Send result
 */
const sendAssessmentReminder = async (to, data) => {
  return await sendTemplatedEmail('assessmentReminder', to, data);
};

/**
 * Send grade published notification
 * @param {string} to - Recipient email
 * @param {object} data - Grade data
 * @returns {Promise<object>} - Send result
 */
const sendGradePublished = async (to, data) => {
  return await sendTemplatedEmail('gradePublished', to, data);
};

/**
 * Send generic notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 * @returns {Promise<object>} - Send result
 */
const sendNotification = async (to, subject, message) => {
  return await sendEmail({
    to,
    subject,
    text: message,
    html: `<p>${message}</p>`,
  });
};

/**
 * Send bulk emails
 * @param {Array} recipients - Array of {to, subject, text, html}
 * @returns {Promise<Array>} - Send results
 */
const sendBulkEmails = async (recipients) => {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendEmail(recipient);
    results.push({ ...recipient, ...result });
  }
  
  return results;
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} - Test result
 */
const testConnection = async () => {
  try {
    if (!transporter) {
      await initializeTransporter();
    }
    
    if (!transporter) {
      return false;
    }
    
    await transporter.verify();
    console.log('✓ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('✗ Email configuration test failed:', error.message);
    return false;
  }
};

module.exports = {
  emailConfig,
  initializeTransporter,
  sendEmail,
  sendTemplatedEmail,
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordReset,
  sendPasswordChanged,
  sendAccountLocked,
  sendLoginAlert,
  sendCourseEnrollment,
  sendAssessmentReminder,
  sendGradePublished,
  sendNotification,
  sendBulkEmails,
  testConnection,
};
