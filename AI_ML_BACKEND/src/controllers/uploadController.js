const path = require("path");

exports.uploadHandler = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  return res.json({ filename: req.file.filename, path: `/uploads/${req.file.filename}` });
};
