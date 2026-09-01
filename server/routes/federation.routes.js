const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getDemandForecasts, getWorkforceRecommendations, updateRecommendationStatus } = require('../services/aiForecastEngine');

// Federation Overview KPIs & Regional Stats
router.get('/overview', authenticateToken, requireRole(['federation_admin']), (req, res) => {
  const federations = db.prepare('SELECT * FROM federations').all();
  const federation = federations[0] || { id: 'fed-tn-1', name: 'Tamil Nadu Labour Cooperatives Federation' };

  const totalCooperatives = db.prepare('SELECT COUNT(*) as count FROM cooperatives WHERE federation_id = ?').get(federation.id).count;
  const totalWorkers = db.prepare(`
    SELECT COUNT(w.id) as count 
    FROM workers w
    JOIN cooperatives c ON w.cooperative_id = c.id
    WHERE c.federation_id = ?
  `).get(federation.id).count;

  const activeJobs = db.prepare(`
    SELECT COUNT(b.id) as count
    FROM bookings b
    JOIN cooperatives c ON b.cooperative_id = c.id
    WHERE c.federation_id = ? AND b.status IN ('REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS')
  `).get(federation.id).count;

  const completedMonth = db.prepare(`
    SELECT COUNT(b.id) as count, COALESCE(SUM(b.total_amount), 0) as gross_volume
    FROM bookings b
    JOIN cooperatives c ON b.cooperative_id = c.id
    WHERE c.federation_id = ? AND b.status = 'COMPLETED'
  `).get(federation.id);

  const avgRating = db.prepare(`
    SELECT COALESCE(AVG(w.rating), 4.8) as avg_rating
    FROM workers w
    JOIN cooperatives c ON w.cooperative_id = c.id
    WHERE c.federation_id = ?
  `).get(federation.id).avg_rating;

  // Cross Cooperative Performance Matrix
  const cooperativesComparison = db.prepare(`
    SELECT 
      coop.id,
      coop.name,
      coop.registration_no,
      r.name as district_name,
      COUNT(DISTINCT w.id) as total_workers,
      COUNT(DISTINCT CASE WHEN w.is_available = 1 THEN w.id END) as active_workers,
      COUNT(DISTINCT CASE WHEN b.status = 'COMPLETED' THEN b.id END) as completed_jobs,
      COALESCE(SUM(CASE WHEN b.payment_status = 'PAID' THEN b.total_amount ELSE 0 END), 0) as total_revenue,
      COALESCE(AVG(w.rating), 4.8) as avg_rating,
      COUNT(DISTINCT comp.id) as complaints_count,
      COUNT(DISTINCT wr.id) as welfare_records_count
    FROM cooperatives coop
    JOIN regions r ON coop.region_id = r.id
    LEFT JOIN workers w ON w.cooperative_id = coop.id
    LEFT JOIN bookings b ON b.cooperative_id = coop.id
    LEFT JOIN complaints comp ON comp.cooperative_id = coop.id AND comp.status IN ('OPEN', 'ESCALATED')
    LEFT JOIN welfare_records wr ON wr.cooperative_id = coop.id AND wr.status = 'ACTIVE'
    WHERE coop.federation_id = ?
    GROUP BY coop.id
    ORDER BY total_workers DESC
  `).all(federation.id);

  // Regional Welfare Aggregate
  const welfareStats = db.prepare(`
    SELECT 
      COUNT(DISTINCT wr.id) as total_policies,
      COALESCE(SUM(wr.coverage_amount), 0) as total_coverage_value,
      COALESCE(SUM(wr.benefits_disbursed), 0) as total_disbursed,
      COUNT(DISTINCT tr.id) as total_trainings_completed
    FROM welfare_records wr
    JOIN cooperatives c ON wr.cooperative_id = c.id
    LEFT JOIN training_records tr ON tr.worker_id = wr.worker_id
    WHERE c.federation_id = ?
  `).get(federation.id);

  // Demand Forecast Summary
  const forecastData = getDemandForecasts();

  res.json({
    federation,
    kpis: {
      totalCooperatives,
      totalWorkers,
      activeJobs,
      completedJobsMonth: completedMonth.count,
      grossVolume: completedMonth.gross_volume,
      avgRating: Number(avgRating.toFixed(1)),
      totalCoverageValue: welfareStats.total_coverage_value,
      totalDisbursed: welfareStats.total_disbursed,
      trainingsCompleted: welfareStats.total_trainings_completed,
    },
    cooperativesComparison,
    forecastSummary: forecastData.summary,
    categoryDemandChart: forecastData.categoryChartData,
  });
});

// Get AI Workforce Recommendations
router.get('/recommendations', authenticateToken, requireRole(['federation_admin', 'cooperative_admin']), (req, res) => {
  const recommendations = getWorkforceRecommendations();
  res.json({ recommendations });
});

// Approve or Reject Workforce Reallocation Recommendation
router.post('/recommendations/:id/action', authenticateToken, requireRole(['federation_admin']), (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'APPROVED' or 'REJECTED' or 'DEPLOYED'

  if (!['APPROVED', 'REJECTED', 'DEPLOYED'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Must be APPROVED, REJECTED, or DEPLOYED.' });
  }

  const result = updateRecommendationStatus(id, action, req.user.id);
  res.json({ message: `Workforce recommendation successfully updated to ${action}`, result });
});

module.exports = router;
