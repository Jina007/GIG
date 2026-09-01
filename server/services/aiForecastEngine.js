/**
 * AI Demand Forecasting & Workforce Allocation Engine
 * SIH26089 - Cooperative Gig Services Platform
 */

const db = require('../db');

/**
 * Generate dynamic demand forecast insights for all communities & service categories
 */
function getDemandForecasts(regionId = null, communityId = null) {
  let query = `
    SELECT 
      df.*,
      c.name as community_name,
      c.postal_code,
      r.name as region_name,
      s.name as service_name,
      sc.name as category_name,
      sc.icon as category_icon,
      sc.slug as category_slug
    FROM demand_forecasts df
    JOIN communities c ON df.community_id = c.id
    JOIN regions r ON df.region_id = r.id
    JOIN services s ON df.service_id = s.id
    JOIN service_categories sc ON s.category_id = sc.id
    WHERE 1=1
  `;
  const params = [];

  if (regionId) {
    query += ` AND df.region_id = ?`;
    params.push(regionId);
  }
  if (communityId) {
    query += ` AND df.community_id = ?`;
    params.push(communityId);
  }

  query += ` ORDER BY df.growth_rate_pct DESC, df.predicted_requests DESC`;

  const forecasts = db.prepare(query).all(...params);

  // Generate aggregate statistics for charts
  const categoryAggregate = {};
  forecasts.forEach(f => {
    if (!categoryAggregate[f.category_name]) {
      categoryAggregate[f.category_name] = {
        category: f.category_name,
        predicted: 0,
        historical: 0,
        highDemandCount: 0,
        icon: f.category_icon,
      };
    }
    categoryAggregate[f.category_name].predicted += f.predicted_requests;
    categoryAggregate[f.category_name].historical += f.historical_avg;
    if (f.demand_level === 'HIGH' || f.demand_level === 'CRITICAL') {
      categoryAggregate[f.category_name].highDemandCount += 1;
    }
  });

  return {
    forecasts,
    categoryChartData: Object.values(categoryAggregate),
    summary: {
      totalPredictedJobs: forecasts.reduce((acc, f) => acc + f.predicted_requests, 0),
      highestDemandCommunity: forecasts[0]?.community_name || 'Peelamedu & Singanallur',
      fastestGrowingService: forecasts[0]?.service_name || 'Plumbing - Pipe Leakage Repair',
      overallGrowthRatePct: Math.round(
        forecasts.reduce((acc, f) => acc + f.growth_rate_pct, 0) / (forecasts.length || 1)
      ),
    }
  };
}

/**
 * Generate inter-cooperative workforce reallocation recommendations
 */
function getWorkforceRecommendations(federationId = null) {
  let query = `
    SELECT 
      wr.*,
      sc_source.name as source_cooperative_name,
      sc_source.address as source_address,
      sc_target.name as target_cooperative_name,
      sc_target.address as target_address,
      tc.name as target_community_name,
      scat.name as category_name,
      scat.icon as category_icon,
      u.name as approver_name
    FROM workforce_recommendations wr
    JOIN cooperatives sc_source ON wr.source_cooperative_id = sc_source.id
    JOIN cooperatives sc_target ON wr.target_cooperative_id = sc_target.id
    JOIN communities tc ON wr.target_community_id = tc.id
    JOIN service_categories scat ON wr.service_category_id = scat.id
    LEFT JOIN users u ON wr.approved_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (federationId) {
    query += ` AND wr.federation_id = ?`;
    params.push(federationId);
  }

  query += ` ORDER BY wr.created_at DESC`;

  return db.prepare(query).all(...params);
}

/**
 * Approve or update recommendation status
 */
function updateRecommendationStatus(recommendationId, status, userId) {
  const stmt = db.prepare(`
    UPDATE workforce_recommendations
    SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(status, userId, recommendationId);

  // If approved/deployed, create an announcement for source and target cooperatives
  const rec = db.prepare(`
    SELECT wr.*, sc.name as category_name, c.name as comm_name 
    FROM workforce_recommendations wr
    JOIN service_categories sc ON wr.service_category_id = sc.id
    JOIN communities c ON wr.target_community_id = c.id
    WHERE wr.id = ?
  `).get(recommendationId);

  if (rec && status === 'APPROVED') {
    const announceStmt = db.prepare(`
      INSERT INTO announcements (id, cooperative_id, federation_id, title, content, target_audience, priority, author_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    announceStmt.run(
      'ann-' + Date.now(),
      rec.target_cooperative_id,
      rec.federation_id,
      `Workforce Allocation Approved: +${rec.recommended_deployment_count} ${rec.category_name} Professionals`,
      `The Federation Admin has approved temporary cross-deployment of ${rec.recommended_deployment_count} ${rec.category_name} workers to ${rec.comm_name} to meet high seasonal demand.`,
      'WORKERS',
      'HIGH',
      'Tamil Nadu Federation Admin'
    );
  }

  return { success: true, status };
}

module.exports = {
  getDemandForecasts,
  getWorkforceRecommendations,
  updateRecommendationStatus,
};
