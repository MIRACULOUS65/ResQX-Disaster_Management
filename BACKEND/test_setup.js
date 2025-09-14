
const axios = require('axios');

async function testSetup() {
    console.log('Testing Disaster Management Backend Setup...\n');
    
    try {
        // Test Express health endpoint
        console.log('1. Testing Express health endpoint...');
        const expressHealth = await axios.get('http://localhost:5000/api/health');
        console.log('✅ Express health:', expressHealth.data);
    } catch (error) {
        console.log('❌ Express health failed:', error.message);
    }
    
    try {
        // Test Flask health endpoint
        console.log('\n2. Testing Flask health endpoint...');
        const flaskHealth = await axios.get('http://localhost:5001/health');
        console.log('✅ Flask health:', flaskHealth.data);
    } catch (error) {
        console.log('❌ Flask health failed:', error.message);
    }
    
    try {
        // Test prediction through Express
        console.log('\n3. Testing prediction through Express...');
        const prediction = await axios.post('http://localhost:5000/api/predict', {
            features: [0.1, 0.2, 0.3]
        });
        console.log('✅ Prediction result:', prediction.data);
    } catch (error) {
        console.log('❌ Prediction failed:', error.message);
    }
    
    try {
        // Test prediction with filename
        console.log('\n4. Testing prediction with filename...');
        const filenamePrediction = await axios.post('http://localhost:5000/api/predict', {
            filename: 'earthquake_damage.jpg'
        });
        console.log('✅ Filename prediction:', filenamePrediction.data);
    } catch (error) {
        console.log('❌ Filename prediction failed:', error.message);
    }
    
    console.log('\n🎉 Setup test completed!');
}

testSetup().catch(console.error);
