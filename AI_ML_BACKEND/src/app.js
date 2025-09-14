const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const predictRoutes = require("./routes/predictRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const { errorHandler } = require("./middlewares/errorHandler");
const rateLimiter = require("./middlewares/rateLimiter");

const app = express();

app.use(helmet());
app.use(morgan("combined"));
// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.onrender.com'] // Replace with your frontend URL
    : true, // Allow all origins in development
  credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Basic rate limiter
app.use(rateLimiter);

// Routes
app.use("/api/predict", predictRoutes);
app.use("/api/upload", uploadRoutes);

// Health
app.get("/api/health", (req, res) => res.json({ status: "express-ok" }));

// Error handler should be last
app.use(errorHandler);

module.exports = app;