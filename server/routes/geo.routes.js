const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalAuthenticateToken } = require('../middleware/auth');
const { calculateDistance } = require('../services/matchingEngine');

// Get Regions (Districts)
router.get('/regions', (req, res) => {
  const regions = db.prepare(`
    SELECT r.*, COUNT(DISTINCT c.id) as cooperatives_count, COUNT(DISTINCT comm.id) as communities_count
    FROM regions r
    LEFT JOIN cooperatives c ON c.region_id = r.id
    LEFT JOIN communities comm ON comm.region_id = r.id
    GROUP BY r.id
    ORDER BY r.name ASC
  `).all();

  res.json({ regions });
});

// Get Communities
router.get('/communities', (req, res) => {
  const { region_id } = req.query;
  let query = `
    SELECT c.*, r.name as region_name, coop.name as cooperative_name
    FROM communities c
    JOIN regions r ON c.region_id = r.id
    LEFT JOIN cooperatives coop ON c.cooperative_id = coop.id
    WHERE 1=1
  `;
  const params = [];

  if (region_id) {
    query += ` AND c.region_id = ?`;
    params.push(region_id);
  }

  query += ` ORDER BY c.name ASC`;
  const communities = db.prepare(query).all(...params);

  res.json({ communities });
});

// Map View: Nearby Workers with Privacy Preserving Coordinates
router.get('/nearby-workers', optionalAuthenticateToken, (req, res) => {
  const { lat = 11.0168, lng = 76.9558, category_id, radius_km = 15 } = req.query;
  const userLat = Number(lat);
  const userLng = Number(lng);
  const maxRadius = Number(radius_km);

  let query = `
    SELECT 
      w.id,
      w.user_id,
      w.experience_years,
      w.is_identity_verified,
      w.is_membership_verified,
      w.is_skill_verified,
      w.is_emergency_ready,
      w.is_available,
      w.service_radius_km,
      w.rating,
      w.review_count,
      w.total_jobs,
      w.current_lat,
      w.current_lng,
      u.name,
      u.avatar,
      coop.name as cooperative_name,
      coop.registration_no as cooperative_reg_no,
      c.name as community_name
    FROM workers w
    JOIN users u ON w.user_id = u.id
    JOIN cooperatives coop ON w.cooperative_id = coop.id
    LEFT JOIN communities c ON w.community_id = c.id
    WHERE coop.status = 'ACTIVE'
  `;

  const workers = db.prepare(query).all();

  const skillsStmt = db.prepare(`
    SELECT ws.skill_name, sc.name as category_name, sc.id as category_id, sc.icon as category_icon
    FROM worker_skills ws
    JOIN service_categories sc ON ws.category_id = sc.id
    WHERE ws.worker_id = ?
  `);

  const nearby = workers
    .map((w) => {
      const skills = skillsStmt.all(w.id);
      const distanceKm = calculateDistance(userLat, userLng, w.current_lat, w.current_lng);

      // Privacy protection: Jitter coords slightly (+/- 0.002 deg approx 200m) if worker is off-duty
      let displayLat = w.current_lat;
      let displayLng = w.current_lng;

      if (w.is_available === 0) {
        // Off-duty privacy blur
        displayLat += (Math.sin(w.id.charCodeAt(0)) * 0.003);
        displayLng += (Math.cos(w.id.charCodeAt(0)) * 0.003);
      }

      return {
        ...w,
        current_lat: Number(displayLat.toFixed(4)),
        current_lng: Number(displayLng.toFixed(4)),
        distance_km: distanceKm,
        skills,
      };
    })
    .filter((w) => {
      if (w.distance_km > maxRadius) return false;
      if (category_id && !w.skills.some((s) => s.category_id === category_id)) return false;
      return true;
    })
    .sort((a, b) => a.distance_km - b.distance_km);

  res.json({ count: nearby.length, workers: nearby });
});

module.exports = router;
