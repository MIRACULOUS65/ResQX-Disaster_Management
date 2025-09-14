# ✅ Render Deployment Checklist

## Pre-Deployment Checklist

### 📁 Repository Preparation
- [ ] All code committed to GitHub
- [ ] `.gitignore` updated (excludes `node_modules/`, `venv/`, `.env`, model files)
- [ ] `render.yaml` configuration file present
- [ ] `DEPLOYMENT.md` guide created
- [ ] Local testing completed successfully

### 🔧 Configuration Files
- [ ] `package.json` with correct dependencies
- [ ] `flask_server/requirements.txt` with all Python packages
- [ ] Environment variables documented in `.env.example`
- [ ] `render.yaml` configured for both services

### 🧪 Testing
- [ ] Local Express server runs on port 5000
- [ ] Local Flask server runs on port 5001
- [ ] Health endpoints respond correctly
- [ ] Prediction endpoints work end-to-end
- [ ] `node test_deployment.js local` passes all tests

## 🚀 Deployment Steps

### Option 1: Automated Deployment (Recommended)
- [ ] Push code to GitHub repository
- [ ] Go to [Render Dashboard](https://dashboard.render.com)
- [ ] Click "New" → "Blueprint"
- [ ] Connect GitHub repository
- [ ] Select branch (usually `main`)
- [ ] Render automatically detects `render.yaml`
- [ ] Wait for both services to deploy

### Option 2: Manual Deployment

#### Flask Service
- [ ] Create new Web Service in Render
- [ ] Connect to GitHub repository
- [ ] Set name: `disaster-flask`
- [ ] Set root directory: `flask_server`
- [ ] Set runtime: Python
- [ ] Set build command: `pip install -r requirements.txt`
- [ ] Set start command: `gunicorn --bind 0.0.0.0:$PORT app:app --workers 2 --timeout 120`
- [ ] Add environment variables:
  - [ ] `FLASK_HOST=0.0.0.0`
  - [ ] `FLASK_PORT=$PORT`
  - [ ] `MODEL_PATH=dataset/model.pkl`
- [ ] Deploy service

#### Express Service
- [ ] Create new Web Service in Render
- [ ] Connect to same GitHub repository
- [ ] Set name: `disaster-express`
- [ ] Set root directory: (leave empty)
- [ ] Set runtime: Node
- [ ] Set build command: `npm install`
- [ ] Set start command: `node src/server.js`
- [ ] Add environment variables:
  - [ ] `PORT=$PORT`
  - [ ] `NODE_ENV=production`
  - [ ] `FLASK_URL=https://disaster-flask.onrender.com`
- [ ] Deploy service

## ✅ Post-Deployment Testing

### Health Checks
- [ ] Flask health: `curl https://disaster-flask.onrender.com/health`
- [ ] Express health: `curl https://disaster-express.onrender.com/api/health`

### End-to-End Testing
- [ ] Test prediction with features:
  ```bash
  curl -X POST https://disaster-express.onrender.com/api/predict \
    -H "Content-Type: application/json" \
    -d '{"features":[0.1,0.2,0.3]}'
  ```
- [ ] Test prediction with filename:
  ```bash
  curl -X POST https://disaster-express.onrender.com/api/predict \
    -H "Content-Type: application/json" \
    -d '{"filename":"earthquake_damage.jpg"}'
  ```

### Automated Testing
- [ ] Update `test_deployment.js` with production URLs
- [ ] Run: `node test_deployment.js production`
- [ ] All tests should pass

## 🔒 Security & Production Hardening

### Express Service
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled (60 requests/minute)
- [ ] Helmet.js security headers active
- [ ] Request body size limited to 5MB

### Flask Service
- [ ] Gunicorn with 2 workers
- [ ] Timeout set to 120 seconds
- [ ] Model loading with fallback
- [ ] Health check endpoint working

### Environment Variables
- [ ] All secrets in Render environment variables (not in code)
- [ ] No `.env` files in repository
- [ ] Production URLs configured correctly

## 📊 Monitoring & Maintenance

### Health Monitoring
- [ ] Flask health endpoint: `/health`
- [ ] Express health endpoint: `/api/health`
- [ ] Set up monitoring alerts (optional)

### Updates
- [ ] Code updates: Push to GitHub → auto-deploy
- [ ] Dependencies: Update `requirements.txt` or `package.json`
- [ ] Environment variables: Update in Render dashboard

## 🎯 Frontend Integration

### API Endpoints
- [ ] Update frontend to use production URLs:
  - [ ] Express API: `https://disaster-express.onrender.com/api/`
  - [ ] Health check: `https://disaster-express.onrender.com/api/health`
  - [ ] Predictions: `https://disaster-express.onrender.com/api/predict`

### CORS Configuration
- [ ] Update Express CORS to allow frontend domain
- [ ] Test frontend-backend communication

## 🚨 Troubleshooting

### Common Issues
- [ ] Build failures: Check Python/Node versions
- [ ] Service communication: Verify `FLASK_URL` environment variable
- [ ] Model loading: Check model file paths and permissions
- [ ] CORS errors: Update CORS configuration for production domains

### Support Resources
- [ ] Render dashboard logs
- [ ] Service health endpoints
- [ ] Local testing first before deploying changes

---

## 🎉 Deployment Complete!

Once all items are checked, your Disaster Management Backend is successfully deployed on Render with:
- ✅ Flask ML service running
- ✅ Express API gateway running  
- ✅ End-to-end communication working
- ✅ Production security measures active
- ✅ Ready for frontend integration
