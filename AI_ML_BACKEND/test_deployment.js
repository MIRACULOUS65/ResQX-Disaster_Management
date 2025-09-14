const axios = require('axios');

// Configuration for testing deployment
const config = {
  // Local testing
  local: {
    express: 'http://localhost:5000',
    flask: 'http://localhost:5001'
  },
  // Production testing (update with your actual Render URLs)
  production: {
    express: 'https://disaster-express.onrender.com',
    flask: 'https://disaster-flask.onrender.com'
  }
};

async function testDeployment(environment = 'local') {
  const urls = config[environment];
  
  console.log(`🧪 Testing ${environment.toUpperCase()} deployment...\n`);
  
  const tests = [
    {
      name: 'Express Health Check',
      url: `${urls.express}/api/health`,
      method: 'GET',
      expected: { status: 'express-ok' }
    },
    {
      name: 'Flask Health Check',
      url: `${urls.flask}/health`,
      method: 'GET',
      expected: { status: 'ok', model_ready: true }
    },
    {
      name: 'Prediction with Features',
      url: `${urls.express}/api/predict`,
      method: 'POST',
      data: { features: [0.1, 0.2, 0.3] },
      expected: { disaster_type: 'Wildfire', confidence: 0.8 }
    },
    {
      name: 'Prediction with Filename',
      url: `${urls.express}/api/predict`,
      method: 'POST',
      data: { filename: 'earthquake_damage.jpg' },
      expected: { disaster_type: 'Earthquake' }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      
      const response = await axios({
        method: test.method,
        url: test.url,
        data: test.data,
        timeout: 10000,
        headers: test.data ? { 'Content-Type': 'application/json' } : {}
      });
      
      // Check if response contains expected fields
      const responseData = response.data;
      let testPassed = true;
      
      for (const [key, value] of Object.entries(test.expected)) {
        if (responseData[key] !== value) {
          testPassed = false;
          break;
        }
      }
      
      if (testPassed) {
        console.log(`✅ ${test.name}: PASSED`);
        console.log(`   Response: ${JSON.stringify(responseData, null, 2)}\n`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Expected: ${JSON.stringify(test.expected)}`);
        console.log(`   Got: ${JSON.stringify(responseData)}\n`);
        failed++;
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
      console.log(`   ${error.message}\n`);
      failed++;
    }
  }
  
  console.log(`📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Deployment is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the deployment configuration.');
  }
}

// Run tests
const environment = process.argv[2] || 'local';
testDeployment(environment).catch(console.error);
