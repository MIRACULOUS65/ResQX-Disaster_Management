# 🌐 Render Backend Deployment Guide

## Overview
This guide will help you deploy both the Flask ML service and Express API gateway to Render.

## Prerequisites
- GitHub repository with your code
- Render account (free tier available)
- All code committed and pushed to GitHub

## Step 1: Deploy Flask Service (ML Model)

### 1.1 Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Choose the branch (usually `main`)

### 1.2 Configure Flask Service
- **Name**: `disaster-flask`
- **Root Directory**: `flask_server`
- **Runtime**: `Python`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app --workers 2`

### 1.3 Environment Variables
Add these environment variables in Render:
- `FLASK_HOST`: `0.0.0.0`
- `FLASK_PORT`: `$PORT`
- `MODEL_PATH`: `dataset/model.pkl`
- `SCALER_PATH`: `dataset/scaler.pkl`

### 1.4 Deploy
Click **"Deploy"** and wait for the build to complete.

### 1.5 Test Flask Service
Visit: `https://disaster-flask.onrender.com/health`

Expected response:
```json
{
  "status": "ok",
  "model_ready": true
}
```

## Step 2: Deploy Express Service (API Gateway)

### 2.1 Create New Web Service
1. Click **"New"** → **"Web Service"**
2. Connect the same GitHub repository
3. Choose the same branch

### 2.2 Configure Express Service
- **Name**: `disaster-express`
- **Root Directory**: (leave empty - package.json is at root)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node src/server.js`

### 2.3 Environment Variables
Add these environment variables in Render:
- `PORT`: `$PORT` (Render will set this automatically)
- `NODE_ENV`: `production`
- `FLASK_URL`: `https://disaster-flask.onrender.com` (URL from Step 1)

### 2.4 Deploy
Click **"Deploy"** and wait for the build to complete.

### 2.5 Test Express Service
Visit: `https://disaster-express.onrender.com/api/health`

Expected response:
```json
{
  "status": "express-ok"
}
```

## Step 3: Test End-to-End Integration

### 3.1 Test Prediction Endpoint
```bash
curl -X POST https://disaster-express.onrender.com/api/predict \
  -H "Content-Type: application/json" \
  -d '{"features":[0.1,0.2,0.3,0.4,0.5]}'
```

Expected response:
```json
{
  "prediction": 2,
  "disaster_type": "Hurricane",
  "confidence": 0.85,
  "severity": 5,
  "probabilities": [0.1, 0.05, 0.85, 0.0, 0.0]
}
```

## Step 4: Production Hardening

### 4.1 Security Considerations
- ✅ Rate limiting is enabled
- ✅ Helmet security headers are enabled
- ✅ CORS is configured (update frontend URL when ready)
- ✅ Environment variables are used for secrets

### 4.2 Monitoring
- Monitor both services in Render dashboard
- Check logs for any errors
- Set up alerts for service downtime

### 4.3 Scaling
- Free tier has limitations (sleeps after inactivity)
- Consider upgrading to paid plan for production use
- For high traffic, consider using Render's auto-scaling

## Troubleshooting

### Common Issues

1. **Flask service fails to start**
   - Check if model files exist in `dataset/` folder
   - Verify all dependencies are in `requirements.txt`
   - Check build logs for Python errors

2. **Express service can't connect to Flask**
   - Verify `FLASK_URL` environment variable is correct
   - Check if Flask service is running and accessible
   - Test Flask service directly first

3. **CORS errors**
   - Update CORS configuration in `src/app.js`
   - Add your frontend domain to allowed origins

4. **Model not loading**
   - Ensure model files are committed to repository
   - Check file paths in environment variables
   - Verify model was trained successfully

### Debug Commands

Test Flask service directly:
```bash
curl https://disaster-flask.onrender.com/health
```

Test Express service:
```bash
curl https://disaster-express.onrender.com/api/health
```

## Next Steps

1. Update your frontend to use the new API endpoints
2. Configure domain names if needed
3. Set up monitoring and alerts
4. Consider implementing authentication for production use

## Support

If you encounter issues:
1. Check Render service logs
2. Verify all environment variables are set correctly
3. Test each service individually
4. Check GitHub repository for latest code

---

✅ **Deployment Complete!** Your backend services are now running on Render.
