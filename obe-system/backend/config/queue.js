const Queue = require('bull');
const { redisClient } = require('./redis');
require('dotenv').config();

// Queue Configuration
const queueConfig = {
  // Redis connection options
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_QUEUE_DB) || 1, // Separate DB for queues
  },
  
  // Queue prefix
  prefix: process.env.QUEUE_PREFIX || 'obe:queue:',
  
  // Default job options
  defaultJobOptions: {
    attempts: parseInt(process.env.QUEUE_ATTEMPTS) || 3,
    backoff: {
      type: 'exponential',
      delay: parseInt(process.env.QUEUE_BACKOFF_DELAY) || 5000, // 5 seconds
    },
    removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE) || 100,
    removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL) || 50,
    timeout: parseInt(process.env.QUEUE_JOB_TIMEOUT) || 60000, // 60 seconds
  },
  
  // Queue settings
  settings: {
    lockDuration: parseInt(process.env.QUEUE_LOCK_DURATION) || 30000, // 30 seconds
    lockRenewTime: parseInt(process.env.QUEUE_LOCK_RENEW_TIME) || 15000, // 15 seconds
    stalledInterval: parseInt(process.env.QUEUE_STALLED_INTERVAL) || 30000, // 30 seconds
    maxStalledCount: parseInt(process.env.QUEUE_MAX_STALLED_COUNT) || 3,
    guardInterval: parseInt(process.env.QUEUE_GUARD_INTERVAL) || 5000, // 5 seconds
    retryProcessDelay: parseInt(process.env.QUEUE_RETRY_PROCESS_DELAY) || 5000, // 5 seconds
  },
  
  // Concurrency settings
  concurrency: {
    email: parseInt(process.env.QUEUE_EMAIL_CONCURRENCY) || 5,
    notification: parseInt(process.env.QUEUE_NOTIFICATION_CONCURRENCY) || 10,
    report: parseInt(process.env.QUEUE_REPORT_CONCURRENCY) || 2,
    export: parseInt(process.env.QUEUE_EXPORT_CONCURRENCY) || 2,
    import: parseInt(process.env.QUEUE_IMPORT_CONCURRENCY) || 1,
    assessment: parseInt(process.env.QUEUE_ASSESSMENT_CONCURRENCY) || 3,
    calculation: parseInt(process.env.QUEUE_CALCULATION_CONCURRENCY) || 5,
  },
  
  // Rate limiting
  limiter: {
    max: parseInt(process.env.QUEUE_RATE_LIMIT_MAX) || 100, // max jobs per duration
    duration: parseInt(process.env.QUEUE_RATE_LIMIT_DURATION) || 1000, // 1 second
  },
  
  // Queue monitoring
  monitoring: {
    enabled: process.env.QUEUE_MONITORING_ENABLED !== 'false',
    interval: parseInt(process.env.QUEUE_MONITORING_INTERVAL) || 60000, // 1 minute
  }
};

// Initialize queues
const queues = {};

/**
 * Create a new queue
 * @param {string} name - Queue name
 * @param {object} options - Queue options
 * @returns {Queue} - Bull queue instance
 */
const createQueue = (name, options = {}) => {
  if (queues[name]) {
    return queues[name];
  }
  
  const queue = new Queue(name, {
    redis: queueConfig.redis,
    prefix: queueConfig.prefix,
    defaultJobOptions: {
      ...queueConfig.defaultJobOptions,
      ...options.jobOptions,
    },
    settings: {
      ...queueConfig.settings,
      ...options.settings,
    },
    limiter: options.limiter || queueConfig.limiter,
  });
  
  // Event listeners
  queue.on('error', (error) => {
    console.error(`✗ Queue "${name}" error:`, error.message);
  });
  
  queue.on('waiting', (jobId) => {
    console.log(`⏳ Queue "${name}" - Job ${jobId} waiting`);
  });
  
  queue.on('active', (job) => {
    console.log(`▶ Queue "${name}" - Job ${job.id} started`);
  });
  
  queue.on('completed', (job, result) => {
    console.log(`✓ Queue "${name}" - Job ${job.id} completed`);
  });
  
  queue.on('failed', (job, error) => {
    console.error(`✗ Queue "${name}" - Job ${job.id} failed:`, error.message);
  });
  
  queue.on('progress', (job, progress) => {
    console.log(`⟳ Queue "${name}" - Job ${job.id} progress: ${progress}%`);
  });
  
  queue.on('stalled', (job) => {
    console.warn(`⚠ Queue "${name}" - Job ${job.id} stalled`);
  });
  
  queue.on('removed', (job) => {
    console.log(`🗑 Queue "${name}" - Job ${job.id} removed`);
  });
  
  queues[name] = queue;
  console.log(`✓ Queue "${name}" initialized`);
  
  return queue;
};

/**
 * Get or create a queue
 * @param {string} name - Queue name
 * @returns {Queue} - Bull queue instance
 */
const getQueue = (name) => {
  return queues[name] || createQueue(name);
};

// Initialize default queues
const emailQueue = createQueue('email', {
  jobOptions: {
    priority: 1,
    attempts: 5,
  }
});

const notificationQueue = createQueue('notification', {
  jobOptions: {
    priority: 2,
    attempts: 3,
  }
});

const reportQueue = createQueue('report', {
  jobOptions: {
    priority: 3,
    attempts: 2,
    timeout: 300000, // 5 minutes
  }
});

const exportQueue = createQueue('export', {
  jobOptions: {
    priority: 3,
    attempts: 2,
    timeout: 600000, // 10 minutes
  }
});

const importQueue = createQueue('import', {
  jobOptions: {
    priority: 2,
    attempts: 2,
    timeout: 600000, // 10 minutes
  }
});

const assessmentQueue = createQueue('assessment', {
  jobOptions: {
    priority: 2,
    attempts: 3,
    timeout: 120000, // 2 minutes
  }
});

const calculationQueue = createQueue('calculation', {
  jobOptions: {
    priority: 2,
    attempts: 3,
    timeout: 60000, // 1 minute
  }
});

const cleanupQueue = createQueue('cleanup', {
  jobOptions: {
    priority: 4,
    attempts: 2,
  }
});

/**
 * Add job to queue
 * @param {string} queueName - Queue name
 * @param {object} data - Job data
 * @param {object} options - Job options
 * @returns {Promise<Job>} - Bull job instance
 */
const addJob = async (queueName, data, options = {}) => {
  try {
    const queue = getQueue(queueName);
    const job = await queue.add(data, options);
    console.log(`✓ Job ${job.id} added to queue "${queueName}"`);
    return job;
  } catch (error) {
    console.error(`✗ Failed to add job to queue "${queueName}":`, error.message);
    throw error;
  }
};

/**
 * Add job with delay
 * @param {string} queueName - Queue name
 * @param {object} data - Job data
 * @param {number} delay - Delay in milliseconds
 * @param {object} options - Job options
 * @returns {Promise<Job>} - Bull job instance
 */
const addDelayedJob = async (queueName, data, delay, options = {}) => {
  return await addJob(queueName, data, { ...options, delay });
};

/**
 * Add repeatable job
 * @param {string} queueName - Queue name
 * @param {object} data - Job data
 * @param {object} repeat - Repeat options (cron, every, etc.)
 * @param {object} options - Job options
 * @returns {Promise<Job>} - Bull job instance
 */
const addRepeatableJob = async (queueName, data, repeat, options = {}) => {
  return await addJob(queueName, data, { ...options, repeat });
};

/**
 * Get job by ID
 * @param {string} queueName - Queue name
 * @param {string} jobId - Job ID
 * @returns {Promise<Job>} - Bull job instance
 */
const getJob = async (queueName, jobId) => {
  const queue = getQueue(queueName);
  return await queue.getJob(jobId);
};

/**
 * Get queue statistics
 * @param {string} queueName - Queue name
 * @returns {Promise<object>} - Queue stats
 */
const getQueueStats = async (queueName) => {
  const queue = getQueue(queueName);
  
  const [
    waiting,
    active,
    completed,
    failed,
    delayed,
    paused
  ] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
    queue.getPausedCount(),
  ]);
  
  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    paused,
    total: waiting + active + completed + failed + delayed + paused,
  };
};

/**
 * Pause queue
 * @param {string} queueName - Queue name
 * @returns {Promise<void>}
 */
const pauseQueue = async (queueName) => {
  const queue = getQueue(queueName);
  await queue.pause();
  console.log(`⏸ Queue "${queueName}" paused`);
};

/**
 * Resume queue
 * @param {string} queueName - Queue name
 * @returns {Promise<void>}
 */
const resumeQueue = async (queueName) => {
  const queue = getQueue(queueName);
  await queue.resume();
  console.log(`▶ Queue "${queueName}" resumed`);
};

/**
 * Empty queue (remove all jobs)
 * @param {string} queueName - Queue name
 * @returns {Promise<void>}
 */
const emptyQueue = async (queueName) => {
  const queue = getQueue(queueName);
  await queue.empty();
  console.log(`🗑 Queue "${queueName}" emptied`);
};

/**
 * Clean queue (remove completed/failed jobs)
 * @param {string} queueName - Queue name
 * @param {number} grace - Grace period in milliseconds
 * @param {string} type - Job type to clean (completed, failed, etc.)
 * @returns {Promise<number[]>} - Removed job IDs
 */
const cleanQueue = async (queueName, grace = 0, type = 'completed') => {
  const queue = getQueue(queueName);
  const removed = await queue.clean(grace, type);
  console.log(`🗑 Queue "${queueName}" cleaned: ${removed.length} ${type} jobs removed`);
  return removed;
};

/**
 * Close queue
 * @param {string} queueName - Queue name
 * @returns {Promise<void>}
 */
const closeQueue = async (queueName) => {
  const queue = queues[queueName];
  if (queue) {
    await queue.close();
    delete queues[queueName];
    console.log(`✓ Queue "${queueName}" closed`);
  }
};

/**
 * Close all queues
 * @returns {Promise<void>}
 */
const closeAllQueues = async () => {
  const queueNames = Object.keys(queues);
  await Promise.all(queueNames.map(name => closeQueue(name)));
  console.log('✓ All queues closed');
};

/**
 * Process queue jobs
 * @param {string} queueName - Queue name
 * @param {function} processor - Job processor function
 * @param {number} concurrency - Concurrency
 * @returns {void}
 */
const processQueue = (queueName, processor, concurrency = null) => {
  const queue = getQueue(queueName);
  const concurrent = concurrency || queueConfig.concurrency[queueName] || 1;
  
  queue.process(concurrent, async (job) => {
    console.log(`▶ Processing job ${job.id} from queue "${queueName}"`);
    try {
      const result = await processor(job);
      console.log(`✓ Job ${job.id} completed successfully`);
      return result;
    } catch (error) {
      console.error(`✗ Job ${job.id} failed:`, error.message);
      throw error;
    }
  });
  
  console.log(`✓ Processor registered for queue "${queueName}" (concurrency: ${concurrent})`);
};

/**
 * Schedule recurring jobs
 */
const scheduleRecurringJobs = async () => {
  // Clean up old completed jobs daily at 2 AM
  await addRepeatableJob('cleanup', { type: 'completed' }, {
    cron: '0 2 * * *',
    jobId: 'cleanup-completed-jobs'
  });
  
  // Clean up old failed jobs daily at 3 AM
  await addRepeatableJob('cleanup', { type: 'failed' }, {
    cron: '0 3 * * *',
    jobId: 'cleanup-failed-jobs'
  });
  
  console.log('✓ Recurring jobs scheduled');
};

// Graceful shutdown
const shutdown = async () => {
  console.log('⏳ Closing all queues...');
  await closeAllQueues();
  console.log('✓ All queues closed gracefully');
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = {
  queueConfig,
  queues,
  emailQueue,
  notificationQueue,
  reportQueue,
  exportQueue,
  importQueue,
  assessmentQueue,
  calculationQueue,
  cleanupQueue,
  createQueue,
  getQueue,
  addJob,
  addDelayedJob,
  addRepeatableJob,
  getJob,
  getQueueStats,
  pauseQueue,
  resumeQueue,
  emptyQueue,
  cleanQueue,
  closeQueue,
  closeAllQueues,
  processQueue,
  scheduleRecurringJobs,
  shutdown,
};
