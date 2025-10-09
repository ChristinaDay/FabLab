import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredJobDetails } from '@/lib/jobStorage';
import { errorHandler, errorUtils } from '@/lib/errorHandling';

const cleanupJobDetails = async (request: NextRequest) => {
  return errorUtils.withRetry(
    async () => {
      console.log('🧹 Starting cleanup of expired job details...');

      try {
        await cleanupExpiredJobDetails();
        
        return NextResponse.json({
          status: 'success',
          message: 'Cleanup completed successfully'
        });
      } catch (error) {
        console.error('❌ Error during cleanup:', error);
        return NextResponse.json(
          { 
            status: 'error', 
            message: 'Failed to cleanup expired job details' 
          },
          { status: 500 }
        );
      }
    },
    3 // maxRetries
  );
};

export { cleanupJobDetails as POST }; 