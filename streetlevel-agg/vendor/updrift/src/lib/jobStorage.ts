import { prisma } from '@/lib/prisma';
import { Job } from '@/types/job';

/**
 * Store job data in the database for internal job detail pages
 */
export async function storeJobDetail(job: Job): Promise<void> {
  try {
    const compositeJobId = `${job.job_publisher.toLowerCase()}-${job.job_id}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await prisma.jobDetail.upsert({
      where: { jobId: compositeJobId },
      update: {
        jobData: JSON.stringify(job),
        updatedAt: new Date(),
        expiresAt
      },
      create: {
        jobId: compositeJobId,
        provider: job.job_publisher.toLowerCase(),
        originalId: job.job_id,
        jobData: JSON.stringify(job),
        expiresAt
      }
    });

    console.log('✅ Stored job detail:', compositeJobId);
  } catch (error) {
    console.error('❌ Error storing job detail:', error);
  }
}

/**
 * Retrieve job data from the database
 */
export async function getJobDetail(jobId: string): Promise<Job | null> {
  try {
    const jobDetail = await prisma.jobDetail.findUnique({
      where: { jobId }
    });

    if (jobDetail) {
      return JSON.parse(jobDetail.jobData) as Job;
    }

    return null;
  } catch (error) {
    console.error('❌ Error retrieving job detail:', error);
    return null;
  }
}

/**
 * Clean up expired job details
 */
export async function cleanupExpiredJobDetails(): Promise<void> {
  try {
    const result = await prisma.jobDetail.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`🧹 Cleaned up ${result.count} expired job details`);
  } catch (error) {
    console.error('❌ Error cleaning up expired job details:', error);
  }
}

/**
 * Create composite job ID from provider and original ID
 */
export function createCompositeJobId(provider: string, originalId: string): string {
  return `${provider.toLowerCase()}-${originalId}`;
}

/**
 * Parse composite job ID to get provider and original ID
 */
export function parseCompositeJobId(compositeId: string): { provider: string; originalId: string } | null {
  const parts = compositeId.split('-', 2);
  if (parts.length !== 2) {
    return null;
  }
  
  return {
    provider: parts[0],
    originalId: parts[1]
  };
} 