const flask = require("../utils/flaskClient");

exports.proxyPredict = async (req, res, next) => {
  try {
    const response = await flask.post("/predict", req.body);
    res.json(response.data);
  } catch (err) {
    // Enhance error information for debugging
    console.error("predictController error:", err?.message || err);
    if (err.response) {
      // forward flask status/body
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
};
