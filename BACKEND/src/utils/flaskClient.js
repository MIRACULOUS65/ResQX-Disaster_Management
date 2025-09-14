const axios = require("axios");

const FLASK_URL = process.env.FLASK_URL || "http://localhost:5001";

const instance = axios.create({
  baseURL: FLASK_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" }
});

module.exports = instance;
