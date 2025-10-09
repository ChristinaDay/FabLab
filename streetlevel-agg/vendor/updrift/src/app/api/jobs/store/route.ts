import { NextRequest, NextResponse } from 'next/server';
import { storeJobDetail } from '@/lib/jobStorage';
import { Job } from '@/types/job';
import { errorHandler, errorUtils } from '@/lib/errorHandling';

const storeJob = async (request: NextRequest) => {
  return errorUtils.withRetry(
    async () => {
      const body = await request.json();
      const { job } = body;

      if (!job || !job.job_id || !job.job_publisher) {
        return NextResponse.json(
          { 
            status: 'error', 
            message: 'Invalid job data. Required fields: job_id, job_publisher' 
          },
          { status: 400 }
        );
      }

      console.log('🔍 Storing job data for:', job.job_id);

      try {
        await storeJobDetail(job as Job);
        
        return NextResponse.json({
          status: 'success',
          message: 'Job data stored successfully'
        });
      } catch (error) {
        console.error('❌ Error storing job data:', error);
        return NextResponse.json(
          { 
            status: 'error', 
            message: 'Failed to store job data' 
          },
          { status: 500 }
        );
      }
    },
    3 // maxRetries
  );
};

export { storeJob as POST }; 