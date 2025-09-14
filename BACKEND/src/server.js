const express = require("express");
const app = require("./app");
const path = require("path");

const PORT = process.env.PORT || 5000;

// Serve frontend build when in production
if (process.env.NODE_ENV === "production" && process.env.FRONTEND_DIR) {
  const staticPath = path.join(process.cwd(), process.env.FRONTEND_DIR);
  app.use(express.static(staticPath));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
