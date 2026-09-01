const express = require('express');
const router = express.Router();
const { getDemandForecasts, getWorkforceRecommendations } = require('../services/aiForecastEngine');
const { optionalAuthenticateToken } = require('../middleware/auth');

// Get Demand Forecasts
router.get('/demand', optionalAuthenticateToken, (req, res) => {
  const { region_id, community_id } = req.query;
  const data = getDemandForecasts(region_id, community_id);
  res.json(data);
});

// Get Workforce Recommendations
router.get('/workforce-allocations', optionalAuthenticateToken, (req, res) => {
  const { federation_id } = req.query;
  const recommendations = getWorkforceRecommendations(federation_id);
  res.json({ recommendations });
});

module.exports = router;
