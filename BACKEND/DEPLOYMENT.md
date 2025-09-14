# 🚀 Render Deployment Guide

This guide provides step-by-step instructions for deploying the Disaster Management Backend to Render.

## 📋 Prerequisites

- GitHub repository with the code
- Render account (free tier available)
- Both services tested locally

## 🔧 Repository Structure

```
AI_ML_BACKEND/
├── flask_server/                 # Flask ML Service
│   ├── app.py                   # Main Flask application
│   ├── requirements.txt         # Python dependencies
│   └── .env.example            # Environment variables template
├── src/                         # Express API Gateway
│   ├── server.js               # Express server entry point
│   ├── app.js                  # Express application
│   └── ...
├── package.json                 # Node.js dependencies
├── render.yaml                  # Render deployment configuration
└── README.md                    # Project documentation
```

## 🌐 Deployment Options

### Option 1: Automated Deployment (Recommended)

Use the provided `render.yaml` file for automated deployment:

1. **Push to GitHub**: Ensure all code is pushed to your GitHub repository
2. **Connect to Render**: 
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the branch (usually `main`)
3. **Deploy**: Render will automatically detect `render.yaml` and deploy both services

### Option 2: Manual Deployment

#### Step 1: Deploy Flask Service

1. **Create Web Service**:
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect to your GitHub repository

2. **Configure Flask Service**:
   ```
   Name: disaster-flask
   Root Directory: flask_server
   Runtime: Python
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn --bind 0.0.0.0:$PORT app:app --workers 2 --timeout 120
   ```

3. **Environment Variables**:
   ```
   FLASK_HOST=0.0.0.0
   FLASK_PORT=$PORT
   MODEL_PATH=dataset/model.pkl
   PYTHON_VERSION=3.10.0
   ```

4. **Deploy**: Click "Create Web Service"

#### Step 2: Deploy Express Service

1. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect to the same GitHub repository

2. **Configure Express Service**:
   ```
   Name: disaster-express
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: npm install
   Start Command: node src/server.js
   ```

3. **Environment Variables**:
   ```
   PORT=$PORT
   NODE_ENV=production
   FLASK_URL=https://disaster-flask.onrender.com
   NODE_VERSION=18
   ```

4. **Deploy**: Click "Create Web Service"

## ✅ Testing Deployment

### 1. Test Flask Service
```bash
curl https://disaster-flask.onrender.com/health
```
Expected response:
```json
{
  "status": "ok",
  "model_ready": true,
  "model_type": "none"
}
```

### 2. Test Express Service
```bash
curl https://disaster-express.onrender.com/api/health
```
Expected response:
```json
{
  "status": "express-ok"
}
```

### 3. Test End-to-End Prediction
```bash
curl -X POST https://disaster-express.onrender.com/api/predict \
  -H "Content-Type: application/json" \
  -d '{"features":[0.1,0.2,0.3]}'
```
Expected response:
```json
{
  "confidence": 0.8,
  "disaster_type": "Wildfire",
  "prediction": [0.8,0.1,0.05,0.03,0.02],
  "severity": 1
}
```

## 🔒 Production Security

### Express Service
- CORS is configured for production
- Rate limiting is enabled (60 requests/minute)
- Helmet.js provides security headers
- Request body size limited to 5MB

### Flask Service
- Gunicorn with 2 workers for production
- Timeout set to 120 seconds
- Model loading with fallback predictions
- Health check endpoint for monitoring

## 📊 Monitoring

Both services include health check endpoints:
- Flask: `/health`
- Express: `/api/health`

Monitor these endpoints to ensure services are running properly.

## 🔄 Updates and Maintenance

1. **Code Updates**: Push changes to GitHub, Render will auto-deploy
2. **Environment Variables**: Update in Render dashboard
3. **Dependencies**: Update `requirements.txt` or `package.json`
4. **Model Updates**: Replace model files in the repository

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Python/Node version compatibility
   - Verify all dependencies are listed
   - Check build logs in Render dashboard

2. **Service Communication**:
   - Verify `FLASK_URL` environment variable
   - Check that both services are deployed
   - Test individual service health endpoints

3. **Model Loading**:
   - Ensure model files are in the repository
   - Check `MODEL_PATH` environment variable
   - Verify file permissions

### Support

- Check Render logs in the dashboard
- Review service health endpoints
- Test locally first before deploying

## 🎯 Next Steps

After successful deployment:
1. Update frontend to use production API URLs
2. Set up monitoring and alerting
3. Configure custom domains (optional)
4. Set up CI/CD pipeline for automated deployments
