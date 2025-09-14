const express = require("express");
const { proxyPredict } = require("../controllers/predictController");

const router = express.Router();

router.post("/", proxyPredict);

module.exports = router;
