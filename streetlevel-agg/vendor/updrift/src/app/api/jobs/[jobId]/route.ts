import { NextRequest, NextResponse } from 'next/server';
import { getJobDetail as getJobDetailFromDB, parseCompositeJobId } from '@/lib/jobStorage';
import { Job } from '@/types/job';
import { errorHandler, errorUtils } from '@/lib/errorHandling';

const getJobDetail = async (request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) => {
  return errorUtils.withRetry(
    async () => {
      const { jobId } = await params;
      
      console.log('🔍 Fetching job detail for:', jobId);

      // Try to find job in our database first
      const jobData = await getJobDetailFromDB(jobId);

      if (jobData) {
        console.log('✅ Found job in database');
        
        return NextResponse.json({
          status: 'success',
          data: jobData,
          source: 'database',
          cached: true
        });
      }

      // If not in database, try to fetch from original provider
      console.log('🔍 Job not in database, attempting to fetch from provider');
      
      // Parse composite job ID
      const parsed = parseCompositeJobId(jobId);
      
      if (!parsed) {
        return NextResponse.json(
          { 
            status: 'error', 
            message: 'Invalid job ID format. Expected format: provider-originalId' 
          },
          { status: 400 }
        );
      }

      // For now, return a more helpful error message
      // In the future, this could fetch from the original provider
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Job not found in database. The job may have expired or been removed.',
          jobId,
          provider: parsed.provider,
          originalId: parsed.originalId
        },
        { status: 404 }
      );
    },
    3 // maxRetries
  );
};

export { getJobDetail as GET }; 