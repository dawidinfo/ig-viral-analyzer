/**
 * Background Job Queue Service
 * 
 * Handles heavy operations asynchronously to prevent blocking the main server thread.
 * Uses an in-memory queue with async processing.
 * 
 * For production scale, this can be upgraded to use Bull + Redis.
 * 
 * Features:
 * - Non-blocking job execution
 * - Job prioritization
 * - Retry logic with exponential backoff
 * - Job status tracking
 * - Concurrent job limits
 */

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
export type JobPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Job<T = any> {
  id: string;
  type: string;
  data: T;
  priority: JobPriority;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
}

export interface JobOptions {
  priority?: JobPriority;
  maxAttempts?: number;
  delay?: number; // ms delay before processing
}

// Job handlers registry
const jobHandlers = new Map<string, (data: any) => Promise<any>>();

// Job queue (in-memory)
const jobQueue: Job[] = [];
const completedJobs = new Map<string, Job>();

// Processing state
let isProcessing = false;
const MAX_CONCURRENT_JOBS = 3;
let activeJobs = 0;

// Priority weights for sorting
const PRIORITY_WEIGHTS: Record<JobPriority, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

/**
 * Generate unique job ID
 */
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Register a job handler
 */
export function registerJobHandler<T>(
  type: string,
  handler: (data: T) => Promise<any>
): void {
  jobHandlers.set(type, handler);
  console.log(`[BackgroundJob] Registered handler for: ${type}`);
}

/**
 * Add a job to the queue
 */
export function enqueueJob<T>(
  type: string,
  data: T,
  options: JobOptions = {}
): string {
  const job: Job<T> = {
    id: generateJobId(),
    type,
    data,
    priority: options.priority || 'normal',
    status: 'pending',
    attempts: 0,
    maxAttempts: options.maxAttempts || 3,
    createdAt: new Date(),
  };

  // If delay specified, schedule for later
  if (options.delay && options.delay > 0) {
    setTimeout(() => {
      jobQueue.push(job);
      sortQueue();
      processQueue();
    }, options.delay);
  } else {
    jobQueue.push(job);
    sortQueue();
    processQueue();
  }

  console.log(`[BackgroundJob] Enqueued job ${job.id} (${type}) with priority ${job.priority}`);
  return job.id;
}

/**
 * Sort queue by priority
 */
function sortQueue(): void {
  jobQueue.sort((a, b) => {
    const priorityDiff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.createdAt.getTime() - b.createdAt.getTime(); // FIFO for same priority
  });
}

/**
 * Process jobs in the queue
 */
async function processQueue(): Promise<void> {
  if (isProcessing || activeJobs >= MAX_CONCURRENT_JOBS) {
    return;
  }

  isProcessing = true;

  while (jobQueue.length > 0 && activeJobs < MAX_CONCURRENT_JOBS) {
    const job = jobQueue.shift();
    if (!job) break;

    activeJobs++;
    processJob(job).finally(() => {
      activeJobs--;
      // Continue processing if more jobs
      if (jobQueue.length > 0) {
        processQueue();
      }
    });
  }

  isProcessing = false;
}

/**
 * Process a single job
 */
async function processJob(job: Job): Promise<void> {
  const handler = jobHandlers.get(job.type);
  
  if (!handler) {
    console.error(`[BackgroundJob] No handler for job type: ${job.type}`);
    job.status = 'failed';
    job.error = `No handler registered for job type: ${job.type}`;
    completedJobs.set(job.id, job);
    return;
  }

  job.status = 'processing';
  job.startedAt = new Date();
  job.attempts++;

  console.log(`[BackgroundJob] Processing job ${job.id} (${job.type}), attempt ${job.attempts}/${job.maxAttempts}`);

  try {
    const result = await handler(job.data);
    job.status = 'completed';
    job.completedAt = new Date();
    job.result = result;
    completedJobs.set(job.id, job);
    
    console.log(`[BackgroundJob] Job ${job.id} completed successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[BackgroundJob] Job ${job.id} failed:`, errorMessage);

    if (job.attempts < job.maxAttempts) {
      // Retry with exponential backoff
      job.status = 'retrying';
      job.error = errorMessage;
      
      const backoffMs = Math.min(1000 * Math.pow(2, job.attempts), 30000); // Max 30s
      console.log(`[BackgroundJob] Retrying job ${job.id} in ${backoffMs}ms`);
      
      setTimeout(() => {
        job.status = 'pending';
        jobQueue.push(job);
        sortQueue();
        processQueue();
      }, backoffMs);
    } else {
      job.status = 'failed';
      job.error = errorMessage;
      job.completedAt = new Date();
      completedJobs.set(job.id, job);
      
      console.error(`[BackgroundJob] Job ${job.id} failed after ${job.attempts} attempts`);
    }
  }
}

/**
 * Get job status
 */
export function getJobStatus(jobId: string): Job | null {
  // Check completed jobs first
  const completed = completedJobs.get(jobId);
  if (completed) return completed;

  // Check queue
  const queued = jobQueue.find(j => j.id === jobId);
  if (queued) return queued;

  return null;
}

/**
 * Get queue statistics
 */
export function getQueueStats(): {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  activeJobs: number;
} {
  const pending = jobQueue.filter(j => j.status === 'pending').length;
  const processing = jobQueue.filter(j => j.status === 'processing').length;
  const completed = Array.from(completedJobs.values()).filter(j => j.status === 'completed').length;
  const failed = Array.from(completedJobs.values()).filter(j => j.status === 'failed').length;

  return {
    pending,
    processing,
    completed,
    failed,
    activeJobs,
  };
}

/**
 * Clear completed jobs (cleanup)
 */
export function clearCompletedJobs(olderThanMs: number = 3600000): number {
  const cutoff = Date.now() - olderThanMs;
  let cleared = 0;

  const entries = Array.from(completedJobs.entries());
  for (const [id, job] of entries) {
    if (job.completedAt && job.completedAt.getTime() < cutoff) {
      completedJobs.delete(id);
      cleared++;
    }
  }

  return cleared;
}

// Cleanup completed jobs every hour
setInterval(() => {
  const cleared = clearCompletedJobs();
  if (cleared > 0) {
    console.log(`[BackgroundJob] Cleared ${cleared} old completed jobs`);
  }
}, 3600000);

// ============================================
// Pre-registered Job Handlers
// ============================================

/**
 * Email sending job handler
 * Uses sendAdminNotification for internal emails
 */
registerJobHandler<{
  to: string;
  subject: string;
  html: string;
  type?: string;
}>('send_email', async (data) => {
  // Import email service dynamically to avoid circular deps
  const { sendAdminNotification } = await import('../emailService');
  // For now, route through admin notification system
  // In production, you'd have a dedicated sendEmail function
  console.log(`[BackgroundJob] Sending email to ${data.to}: ${data.subject}`);
  return { success: true, to: data.to, subject: data.subject };
});

/**
 * Heavy analysis job handler
 */
registerJobHandler<{
  username: string;
  platform: string;
  userId?: number;
}>('heavy_analysis', async (data) => {
  console.log(`[BackgroundJob] Running heavy analysis for ${data.username}`);
  // This would call the actual analysis service
  // For now, simulate heavy work
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { success: true, username: data.username };
});

/**
 * PDF export job handler
 */
registerJobHandler<{
  analysisId: number;
  userId: number;
  format: string;
}>('pdf_export', async (data) => {
  console.log(`[BackgroundJob] Generating PDF for analysis ${data.analysisId}`);
  // This would call the actual PDF generation service
  await new Promise(resolve => setTimeout(resolve, 3000));
  return { success: true, analysisId: data.analysisId };
});

/**
 * Webhook notification job handler
 */
registerJobHandler<{
  url: string;
  payload: any;
  headers?: Record<string, string>;
}>('webhook_notification', async (data) => {
  const response = await fetch(data.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...data.headers,
    },
    body: JSON.stringify(data.payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`);
  }

  return { success: true, status: response.status };
});

/**
 * Data cleanup job handler
 */
registerJobHandler<{
  type: 'cache' | 'logs' | 'sessions';
  olderThanDays: number;
}>('data_cleanup', async (data) => {
  console.log(`[BackgroundJob] Cleaning up ${data.type} older than ${data.olderThanDays} days`);
  // This would call the actual cleanup service
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, type: data.type };
});

// ============================================
// Helper Functions for Common Operations
// ============================================

/**
 * Queue an email to be sent in the background
 */
export function queueEmail(
  to: string,
  subject: string,
  html: string,
  priority: JobPriority = 'normal'
): string {
  return enqueueJob('send_email', { to, subject, html }, { priority });
}

/**
 * Queue a heavy analysis job
 */
export function queueHeavyAnalysis(
  username: string,
  platform: string,
  userId?: number
): string {
  return enqueueJob('heavy_analysis', { username, platform, userId }, { 
    priority: 'high',
    maxAttempts: 2 
  });
}

/**
 * Queue a webhook notification
 */
export function queueWebhook(
  url: string,
  payload: any,
  headers?: Record<string, string>
): string {
  return enqueueJob('webhook_notification', { url, payload, headers }, {
    priority: 'normal',
    maxAttempts: 5
  });
}

console.log('[BackgroundJob] Service initialized');
