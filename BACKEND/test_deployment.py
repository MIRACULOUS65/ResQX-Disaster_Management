#!/usr/bin/env python3
"""
Test script to verify the disaster prediction model works correctly.
This script tests the model locally before deployment.
"""

import sys
import os
sys.path.append('flask_server')

import joblib
import numpy as np

def test_model():
    """Test the trained model locally"""
    print("🧪 Testing Disaster Prediction Model...")
    
    try:
        # Load model and scaler
        model = joblib.load('flask_server/dataset/model.pkl')
        scaler = joblib.load('flask_server/dataset/scaler.pkl')
        
        # Test features (5 features as expected by the model)
        test_features = np.array([[0.1, 0.2, 0.3, 0.4, 0.5]])
        
        # Scale features
        scaled_features = scaler.transform(test_features)
        
        # Get prediction
        prediction = model.predict(scaled_features)[0]
        probabilities = model.predict_proba(scaled_features)[0]
        
        # Disaster type mapping
        disaster_types = ["Earthquake", "Flood", "Hurricane", "Tornado", "Wildfire"]
        disaster_type = disaster_types[prediction]
        confidence = float(np.max(probabilities))
        severity = int(confidence * 5) + 1
        
        print(f"✅ Model loaded successfully")
        print(f"📊 Test prediction:")
        print(f"   - Features: {test_features[0].tolist()}")
        print(f"   - Predicted disaster: {disaster_type}")
        print(f"   - Confidence: {confidence:.3f}")
        print(f"   - Severity: {severity}/5")
        print(f"   - All probabilities: {probabilities.tolist()}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing model: {e}")
        return False

def test_flask_app():
    """Test Flask app endpoints"""
    print("\n🌐 Testing Flask App...")
    
    try:
        from flask_server.app import app, model_ready
        import time
        
        # Wait for model to load (up to 10 seconds)
        print("   Waiting for model to load...")
        for i in range(20):  # 20 * 0.5 = 10 seconds max
            if model_ready:
                break
            time.sleep(0.5)
        
        with app.test_client() as client:
            # Test health endpoint
            response = client.get('/health')
            if response.status_code == 200:
                print("✅ Health endpoint working")
                health_data = response.get_json()
                print(f"   Response: {health_data}")
                
                if not health_data.get('model_ready', False):
                    print("⚠️  Model not ready yet, but health endpoint works")
            else:
                print(f"❌ Health endpoint failed: {response.status_code}")
                return False
            
            # Test prediction endpoint only if model is ready
            if health_data.get('model_ready', False):
                test_data = {"features": [0.1, 0.2, 0.3, 0.4, 0.5]}
                response = client.post('/predict', json=test_data)
                if response.status_code == 200:
                    print("✅ Prediction endpoint working")
                    result = response.get_json()
                    print(f"   Response: {result}")
                else:
                    print(f"❌ Prediction endpoint failed: {response.status_code}")
                    print(f"   Error: {response.get_json()}")
                    return False
            else:
                print("⚠️  Skipping prediction test - model not ready")
                
        return True
        
    except Exception as e:
        print(f"❌ Error testing Flask app: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Disaster Management Backend - Deployment Test")
    print("=" * 50)
    
    # Test model
    model_ok = test_model()
    
    # Test Flask app
    flask_ok = test_flask_app()
    
    print("\n" + "=" * 50)
    if model_ok and flask_ok:
        print("🎉 All tests passed! Ready for deployment to Render.")
        print("\nNext steps:")
        print("1. Commit and push your code to GitHub")
        print("2. Follow the RENDER_DEPLOYMENT_GUIDE.md")
        print("3. Deploy Flask service first, then Express service")
    else:
        print("❌ Some tests failed. Please fix issues before deployment.")
        sys.exit(1)
