// Test script to check API logo data
const testApiResponse = async () => {
  try {
    // Test the search API
    const response = await fetch('/api/jobs/search?query=software&location=san%20francisco&radius=25');
    const data = await response.json();
    
    console.log('🔍 API Response Test:');
    console.log('Total jobs:', data.data?.length || 0);
    
    // Check first few jobs for logo data
    const sampleJobs = data.data?.slice(0, 5) || [];
    sampleJobs.forEach((job, index) => {
      console.log(`\nJob ${index + 1}:`);
      console.log('  Company:', job.employer_name);
      console.log('  Logo URL:', job.employer_logo || 'undefined');
      console.log('  Website:', job.employer_website || 'undefined');
      console.log('  Publisher:', job.job_publisher);
    });
    
  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
};

// Run the test
testApiResponse(); 