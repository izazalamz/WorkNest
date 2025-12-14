const express = require("express");
const router = express.Router();

const { getLatestAnalytics } = require("../controllers/analyticsController");

router.get("/analytics/latest", getLatestAnalytics);

module.exports = router;
