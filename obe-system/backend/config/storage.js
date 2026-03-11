const path = require('path');
const fs = require('fs').promises;
const AWS = require('aws-sdk');
require('dotenv').config();

// Storage Configuration
const storageConfig = {
  // Storage type: local, s3, minio
  type: process.env.STORAGE_TYPE || 'local',
  
  // Local storage configuration
  local: {
    uploadPath: process.env.STORAGE_LOCAL_PATH || './uploads',
    baseUrl: process.env.APP_URL || 'http://localhost:3000',
    publicPath: '/uploads',
    directories: {
      profiles: 'profiles',
      documents: 'documents',
      assessments: 'assessments',
      reports: 'reports',
      temp: 'temp',
      exports: 'exports',
    }
  },
  
  // AWS S3 configuration
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || '',
    endpoint: process.env.AWS_S3_ENDPOINT || null,
    signatureVersion: 'v4',
    s3ForcePathStyle: false,
    acl: process.env.AWS_S3_ACL || 'private',
    directories: {
      profiles: 'profiles',
      documents: 'documents',
      assessments: 'assessments',
      reports: 'reports',
      temp: 'temp',
      exports: 'exports',
    }
  },
  
  // MinIO configuration (S3-compatible)
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
    bucket: process.env.MINIO_BUCKET || 'obe-system',
    region: process.env.MINIO_REGION || 'us-east-1',
    directories: {
      profiles: 'profiles',
      documents: 'documents',
      assessments: 'assessments',
      reports: 'reports',
      temp: 'temp',
      exports: 'exports',
    }
  },
  
  // File upload restrictions
  restrictions: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    maxFiles: parseInt(process.env.MAX_FILES_PER_REQUEST) || 5,
    
    // Allowed file types by category
    allowedTypes: {
      images: {
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        maxSize: 5 * 1024 * 1024, // 5MB
      },
      documents: {
        extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv'],
        mimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
          'text/csv'
        ],
        maxSize: 10 * 1024 * 1024, // 10MB
      },
      videos: {
        extensions: ['.mp4', '.mpeg', '.webm', '.avi', '.mov'],
        mimeTypes: ['video/mp4', 'video/mpeg', 'video/webm', 'video/x-msvideo', 'video/quicktime'],
        maxSize: 50 * 1024 * 1024, // 50MB
      },
      archives: {
        extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
        mimeTypes: [
          'application/zip',
          'application/x-rar-compressed',
          'application/x-7z-compressed',
          'application/x-tar',
          'application/gzip'
        ],
        maxSize: 20 * 1024 * 1024, // 20MB
      }
    }
  },
  
  // URL expiration for signed URLs (in seconds)
  urlExpiration: {
    view: parseInt(process.env.STORAGE_VIEW_URL_EXPIRY) || 3600, // 1 hour
    download: parseInt(process.env.STORAGE_DOWNLOAD_URL_EXPIRY) || 300, // 5 minutes
    upload: parseInt(process.env.STORAGE_UPLOAD_URL_EXPIRY) || 600, // 10 minutes
  }
};

// Initialize AWS S3 client
let s3Client = null;
if (storageConfig.type === 's3' || storageConfig.type === 'minio') {
  const s3Config = storageConfig.type === 's3' ? {
    accessKeyId: storageConfig.s3.accessKeyId,
    secretAccessKey: storageConfig.s3.secretAccessKey,
    region: storageConfig.s3.region,
    signatureVersion: storageConfig.s3.signatureVersion,
  } : {
    accessKeyId: storageConfig.minio.accessKey,
    secretAccessKey: storageConfig.minio.secretKey,
    endpoint: `${storageConfig.minio.useSSL ? 'https' : 'http'}://${storageConfig.minio.endpoint}:${storageConfig.minio.port}`,
    region: storageConfig.minio.region,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  };
  
  s3Client = new AWS.S3(s3Config);
}

// Storage service methods
const storage = {
  /**
   * Initialize storage directories (for local storage)
   */
  async initialize() {
    if (storageConfig.type === 'local') {
      const basePath = path.resolve(storageConfig.local.uploadPath);
      
      // Create base upload directory
      await fs.mkdir(basePath, { recursive: true });
      
      // Create subdirectories
      for (const dir of Object.values(storageConfig.local.directories)) {
        await fs.mkdir(path.join(basePath, dir), { recursive: true });
      }
      
      console.log('✓ Local storage directories initialized');
    } else if (storageConfig.type === 's3' || storageConfig.type === 'minio') {
      // Check if bucket exists
      const bucket = storageConfig.type === 's3' ? storageConfig.s3.bucket : storageConfig.minio.bucket;
      try {
        await s3Client.headBucket({ Bucket: bucket }).promise();
        console.log(`✓ ${storageConfig.type.toUpperCase()} bucket "${bucket}" is accessible`);
      } catch (error) {
        if (error.code === 'NotFound') {
          console.warn(`⚠ ${storageConfig.type.toUpperCase()} bucket "${bucket}" not found. Creating...`);
          await s3Client.createBucket({ Bucket: bucket }).promise();
          console.log(`✓ ${storageConfig.type.toUpperCase()} bucket "${bucket}" created`);
        } else {
          console.error(`✗ ${storageConfig.type.toUpperCase()} connection error:`, error.message);
        }
      }
    }
  },

  /**
   * Get full file path
   * @param {string} directory - Directory name
   * @param {string} filename - File name
   * @returns {string} - Full path
   */
  getFilePath(directory, filename) {
    if (storageConfig.type === 'local') {
      return path.join(storageConfig.local.uploadPath, directory, filename);
    } else {
      return `${directory}/${filename}`;
    }
  },

  /**
   * Get public URL for file
   * @param {string} directory - Directory name
   * @param {string} filename - File name
   * @returns {string} - Public URL
   */
  getPublicUrl(directory, filename) {
    if (storageConfig.type === 'local') {
      return `${storageConfig.local.baseUrl}${storageConfig.local.publicPath}/${directory}/${filename}`;
    } else {
      const bucket = storageConfig.type === 's3' ? storageConfig.s3.bucket : storageConfig.minio.bucket;
      const key = `${directory}/${filename}`;
      return `https://${bucket}.s3.${storageConfig.s3.region}.amazonaws.com/${key}`;
    }
  },

  /**
   * Generate signed URL for file
   * @param {string} directory - Directory name
   * @param {string} filename - File name
   * @param {string} operation - Operation type (getObject, putObject)
   * @param {number} expiresIn - Expiration time in seconds
   * @returns {Promise<string>} - Signed URL
   */
  async getSignedUrl(directory, filename, operation = 'getObject', expiresIn = null) {
    if (storageConfig.type === 'local') {
      // Local storage doesn't need signed URLs
      return this.getPublicUrl(directory, filename);
    }

    const bucket = storageConfig.type === 's3' ? storageConfig.s3.bucket : storageConfig.minio.bucket;
    const key = `${directory}/${filename}`;
    const expires = expiresIn || storageConfig.urlExpiration.view;

    const params = {
      Bucket: bucket,
      Key: key,
      Expires: expires,
    };

    return await s3Client.getSignedUrlPromise(operation, params);
  },

  /**
   * Upload file
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} directory - Directory name
   * @param {string} filename - File name
   * @param {string} contentType - Content type
   * @returns {Promise<object>} - Upload result
   */
  async upload(fileBuffer, directory, filename, contentType) {
    if (storageConfig.type === 'local') {
      const filePath = this.getFilePath(directory, filename);
      await fs.writeFile(filePath, fileBuffer);
      
      return {
        success: true,
        path: filePath,
        url: this.getPublicUrl(directory, filename),
        size: fileBuffer.length,
      };
    } else {
      const bucket = storageConfig.type === 's3' ? storageConfig.s3.bucket : storageConfig.minio.bucket;
      const key = `${directory}/${filename}`;
      
      const params = {
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: storageConfig.s3.acl,
      };
      
      const result = await s3Client.upload(params).promise();
      
      return {
        success: true,
        path: result.Key,
        url: result.Location,
        etag: result.ETag,
        size: fileBuffer.length,
      };
    }
  },

  /**
   * Delete file
   * @param {string} directory - Directory name
   * @param {string} filename - File name
   * @returns {Promise<boolean>} - Success status
   */
  async delete(directory, filename) {
    try {
      if (storageConfig.type === 'local') {
        const filePath = this.getFilePath(directory, filename);
        await fs.unlink(filePath);
      } else {
        const bucket = storageConfig.type === 's3' ? storageConfig.s3.bucket : storageConfig.minio.bucket;
        const key = `${directory}/${filename}`;
        
        await s3Client.deleteObject({ Bucket: bucket, Key: key }).promise();
      }
      return true;
    } catch (error) {
      console.error('Storage delete error:', error.message);
      return false;
    }
  },

  /**
   * Check if file exists
   * @param {string} directory - Directory name
   * @param {string} filename - File name
   * @returns {Promise<boolean>} - Exists status
   */
  async exists(directory, filename) {
    try {
      if (storageConfig.type === 'local') {
        const filePath = this.getFilePath(directory, filename);
        await fs.access(filePath);
        return true;
      } else {
        const bucket = storageConfig.type === 's3' ? storageConfig.s3.bucket : storageConfig.minio.bucket;
        const key = `${directory}/${filename}`;
        
        await s3Client.headObject({ Bucket: bucket, Key: key }).promise();
        return true;
      }
    } catch (error) {
      return false;
    }
  },

  /**
   * Validate file type
   * @param {string} filename - File name
   * @param {string} mimetype - MIME type
   * @param {string} category - File category (images, documents, etc.)
   * @returns {object} - Validation result
   */
  validateFileType(filename, mimetype, category = null) {
    const ext = path.extname(filename).toLowerCase();
    
    if (category) {
      const allowed = storageConfig.restrictions.allowedTypes[category];
      if (!allowed) {
        return { valid: false, error: 'Invalid file category' };
      }
      
      if (!allowed.extensions.includes(ext)) {
        return { valid: false, error: `Invalid file extension. Allowed: ${allowed.extensions.join(', ')}` };
      }
      
      if (!allowed.mimeTypes.includes(mimetype)) {
        return { valid: false, error: `Invalid file type. Allowed: ${allowed.mimeTypes.join(', ')}` };
      }
      
      return { valid: true, maxSize: allowed.maxSize };
    }
    
    // Check against all categories
    for (const [cat, allowed] of Object.entries(storageConfig.restrictions.allowedTypes)) {
      if (allowed.extensions.includes(ext) && allowed.mimeTypes.includes(mimetype)) {
        return { valid: true, category: cat, maxSize: allowed.maxSize };
      }
    }
    
    return { valid: false, error: 'File type not allowed' };
  }
};

module.exports = {
  storageConfig,
  storage,
  s3Client
};
