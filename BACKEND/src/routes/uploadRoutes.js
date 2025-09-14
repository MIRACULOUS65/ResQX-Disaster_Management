const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadHandler } = require("../controllers/uploadController");

const uploadDir = path.join(process.cwd(), "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = express.Router();
router.post("/", upload.single("file"), uploadHandler);

module.exports = router;
