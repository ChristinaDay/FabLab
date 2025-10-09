// Test script to verify usage estimates are working
const testUsageEstimates = async () => {
  try {
    console.log('🧪 Testing Usage Estimates...');
    
    // Test by making actual API calls
    console.log('📊 Making test API calls...');
    
    // Test Adzuna API call
    console.log('🔍 Testing Adzuna API...');
    const adzunaResponse = await fetch('http://localhost:3000/api/jobs/search?query=software&location=san%20francisco&radius=25');
    if (adzunaResponse.ok) {
      console.log('✅ Adzuna API call successful');
    } else {
      console.log('❌ Adzuna API call failed');
    }
    
    // Test JSearch API call
    console.log('🔍 Testing JSearch API...');
    const jsearchResponse = await fetch('http://localhost:3000/api/jobs/search?query=developer&location=remote&radius=25');
    if (jsearchResponse.ok) {
      console.log('✅ JSearch API call successful');
    } else {
      console.log('❌ JSearch API call failed');
    }
    
    // Check API Hub to see if usage is recorded
    console.log('\n🌐 Checking API Hub for usage data...');
    const apiHubResponse = await fetch('http://localhost:3000/apihub');
    if (apiHubResponse.ok) {
      console.log('✅ API Hub page loads successfully');
      console.log('📈 Check the API Hub page to see if usage estimates are now showing data');
    } else {
      console.log('❌ API Hub page failed to load');
    }
    
    console.log('\n🎯 To verify usage estimates are working:');
    console.log('1. Go to http://localhost:3000/apihub');
    console.log('2. Look for "Usage Estimates" sections');
    console.log('3. They should now show non-zero values after API calls');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testUsageEstimates(); 