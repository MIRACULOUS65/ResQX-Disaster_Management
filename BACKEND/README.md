# Disaster Management Backend

A backend composed of Flask (ML service) + Express (API + orchestration) for disaster prediction and management.

## Architecture

- **Flask**: ML microservice exposing `/predict`, `/train`, and `/health` endpoints
- **Express**: API gateway that proxies requests to Flask, handles uploads, security, and monitoring

## Local Development

### Prerequisites

- Node.js 18.x+ and npm
- Python 3.8+ (3.10 recommended) and pip
- git

### Setup and Run

1. **Clone and setup Flask:**
   ```bash
   cd flask_server
   python -m venv venv
   source venv/bin/activate      # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   python app.py                 # runs at http://localhost:5001
   ```

2. **Setup and run Express:**
   ```bash
   cd ../
   npm install
   npm run dev                   # runs at http://localhost:5000
   ```

3. **Test end-to-end:**
   ```bash
   curl -X POST http://localhost:5000/api/predict \
     -H "Content-Type: application/json" \
     -d '{"features":[0.1,0.2,0.3]}'
   ```

### Environment Variables

**Express (.env):**
- `PORT=5000`
- `FLASK_URL=http://localhost:5001`
- `NODE_ENV=development`
- `FRONTEND_DIR=frontend/dist` (optional, for serving frontend in production)

**Flask (flask_server/.env):**
- `FLASK_HOST=0.0.0.0`
- `FLASK_PORT=5001`
- `MODEL_PATH=dataset/model.pkl`

## API Endpoints

### Express API (`/api/*`)
- `GET /api/health` - Express health check
- `POST /api/predict` - Proxy to Flask prediction
- `POST /api/upload` - File upload handler

### Flask ML Service
- `GET /health` - Flask health check with model status
- `POST /predict` - ML prediction endpoint
- `POST /train` - Model training endpoint (not implemented)

## Deployment to Render

### Option 1: Using render.yaml (Infrastructure as Code)

1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Render will automatically detect the `render.yaml` and create two services:
   - `disaster-flask` (Python service)
   - `disaster-express` (Node.js service)

### Option 2: Manual Setup

1. **Create Flask Service:**
   - Environment: Python
   - Build Command: `pip install -r flask_server/requirements.txt`
   - Start Command: `gunicorn --bind 0.0.0.0:$PORT flask_server.app:app --workers 2`
   - Environment Variables:
     - `FLASK_HOST=0.0.0.0`
     - `FLASK_PORT=$PORT`
     - `MODEL_PATH=dataset/model.pkl`

2. **Create Express Service:**
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node src/server.js`
   - Environment Variables:
     - `PORT=$PORT`
     - `FLASK_URL=https://your-flask-service.onrender.com`
     - `NODE_ENV=production`

## Testing

### Health Checks
- `GET /api/health` → `{"status":"express-ok"}`
- `GET /health` (Flask) → `{"status":"ok","model_ready":true/false}`

### Prediction Test
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"features":[0.1,0.2,0.3]}'
```

### File Upload Test
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@test-image.jpg"
```

## Security & Production Notes

- Use helmet() and cors() with whitelisted origins in production
- Rate limiting is enabled (60 requests/minute per IP)
- Body size limited to 5MB
- Store secrets in Render environment variables
- For large models, consider cloud storage (S3/GCS)
- Add logging (winston) and error reporting (Sentry) for production

## Project Structure

```
AI_ML_BACKEND/
├── flask_server/           # Flask ML microservice
│   ├── dataset/           # Model files
│   ├── app.py            # Flask application
│   ├── train.py          # Training script
│   ├── test_prediction.py # Test script
│   └── requirements.txt   # Python dependencies
├── src/                   # Express backend
│   ├── controllers/       # Request handlers
│   ├── middlewares/       # Express middlewares
│   ├── routes/           # API routes
│   ├── utils/            # Utilities (Flask client)
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── uploads/              # Runtime uploads (gitignored)
├── public/               # Static files (optional)
├── .env.example          # Environment variables template
├── render.yaml           # Render deployment config
└── README.md            # This file
```