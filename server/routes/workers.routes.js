const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, optionalAuthenticateToken, requireRole } = require('../middleware/auth');

// Get all workers with query filters
router.get('/', optionalAuthenticateToken, (req, res) => {
  const { category_id, region_id, community_id, cooperative_id, emergency_only, available_only } = req.query;

  let query = `
    SELECT 
      w.*,
      u.name,
      u.email,
      u.phone,
      u.avatar,
      coop.name as cooperative_name,
      coop.registration_no as cooperative_reg_no,
      coop.phone as cooperative_phone,
      c.name as community_name,
      r.name as region_name,
      r.id as region_id
    FROM workers w
    JOIN users u ON w.user_id = u.id
    JOIN cooperatives coop ON w.cooperative_id = coop.id
    LEFT JOIN communities c ON w.community_id = c.id
    LEFT JOIN regions r ON coop.region_id = r.id
    WHERE 1=1
  `;
  const params = [];

  if (cooperative_id) {
    query += ` AND w.cooperative_id = ?`;
    params.push(cooperative_id);
  }
  if (community_id) {
    query += ` AND w.community_id = ?`;
    params.push(community_id);
  }
  if (region_id) {
    query += ` AND coop.region_id = ?`;
    params.push(region_id);
  }
  if (emergency_only === 'true') {
    query += ` AND w.is_emergency_ready = 1`;
  }
  if (available_only === 'true') {
    query += ` AND w.is_available = 1`;
  }

  query += ` ORDER BY w.rating DESC, w.total_jobs DESC`;

  const workers = db.prepare(query).all(...params);

  // Attach skills to each worker
  const workerSkillsStmt = db.prepare(`
    SELECT ws.*, sc.name as category_name, sc.icon as category_icon, sc.slug as category_slug
    FROM worker_skills ws
    JOIN service_categories sc ON ws.category_id = sc.id
    WHERE ws.worker_id = ?
  `);

  const enrichedWorkers = workers.map((w) => {
    const skills = workerSkillsStmt.all(w.id);
    return {
      ...w,
      skills,
    };
  });

  // Filter by category if requested
  const filtered = category_id
    ? enrichedWorkers.filter((w) => w.skills.some((s) => s.category_id === category_id))
    : enrichedWorkers;

  res.json({ count: filtered.length, workers: filtered });
});

// Get single worker detailed trust profile
router.get('/:id/trust-profile', (req, res) => {
  const { id } = req.params;

  const worker = db.prepare(`
    SELECT 
      w.*,
      u.name,
      u.email,
      u.phone,
      u.avatar,
      coop.name as cooperative_name,
      coop.registration_no as cooperative_reg_no,
      coop.address as cooperative_address,
      coop.phone as cooperative_phone,
      coop.established_year as cooperative_est_year,
      c.name as community_name,
      c.postal_code as community_pincode,
      r.name as region_name
    FROM workers w
    JOIN users u ON w.user_id = u.id
    JOIN cooperatives coop ON w.cooperative_id = coop.id
    LEFT JOIN communities c ON w.community_id = c.id
    LEFT JOIN regions r ON coop.region_id = r.id
    WHERE w.id = ? OR w.user_id = ?
  `).get(id, id);

  if (!worker) {
    return res.status(404).json({ error: 'Worker profile not found.' });
  }

  // Fetch skills
  const skills = db.prepare(`
    SELECT ws.*, sc.name as category_name, sc.icon as category_icon, sc.slug as category_slug
    FROM worker_skills ws
    JOIN service_categories sc ON ws.category_id = sc.id
    WHERE ws.worker_id = ?
  `).all(worker.id);

  // Fetch certifications
  const certifications = db.prepare(`
    SELECT * FROM certifications WHERE worker_id = ?
  `).all(worker.id);

  // Fetch welfare schemes
  const welfareRecords = db.prepare(`
    SELECT * FROM welfare_records WHERE worker_id = ?
  `).all(worker.id);

  // Fetch training records
  const trainingRecords = db.prepare(`
    SELECT * FROM training_records WHERE worker_id = ?
  `).all(worker.id);

  // Fetch recent reviews
  const reviews = db.prepare(`
    SELECT r.*, u.name as customer_name, u.avatar as customer_avatar
    FROM reviews r
    JOIN users u ON r.customer_id = u.id
    WHERE r.worker_id = ?
    ORDER BY r.created_at DESC
    LIMIT 10
  `).all(worker.id);

  // Fetch complaints record count (Clean trust record)
  const complaintCount = db.prepare(`
    SELECT COUNT(*) as count FROM complaints WHERE worker_id = ? AND status IN ('OPEN', 'RESOLVED')
  `).get(worker.id).count;

  res.json({
    worker,
    skills,
    certifications,
    welfareRecords,
    trainingRecords,
    reviews,
    complaintCount,
    trustVerification: {
      isIdentityVerified: worker.is_identity_verified === 1,
      isMembershipVerified: worker.is_membership_verified === 1,
      isSkillVerified: worker.is_skill_verified === 1,
      isCertVerified: worker.is_cert_verified === 1,
      cooperativeName: worker.cooperative_name,
      registrationNo: worker.cooperative_reg_no,
      verifiedDate: worker.verified_at || '2024-03-15',
    },
    communityStats: {
      servingCommunityName: worker.community_name,
      totalJobs: worker.total_jobs,
      repeatCustomers: worker.repeat_customers_count,
      rating: worker.rating,
      reviewCount: worker.review_count,
      activeWorkload: worker.active_workload,
      yearsExperience: worker.experience_years,
    }
  });
});

// Toggle worker availability
router.patch('/status/toggle-availability', authenticateToken, requireRole('worker'), (req, res) => {
  const worker = db.prepare('SELECT * FROM workers WHERE user_id = ?').get(req.user.id);
  if (!worker) {
    return res.status(404).json({ error: 'Worker profile not found.' });
  }

  const newStatus = worker.is_available === 1 ? 0 : 1;
  db.prepare('UPDATE workers SET is_available = ? WHERE id = ?').run(newStatus, worker.id);

  res.json({
    message: `Availability status updated to ${newStatus === 1 ? 'AVAILABLE' : 'OFF_DUTY'}`,
    is_available: newStatus,
  });
});

// Toggle emergency readiness
router.patch('/status/toggle-emergency', authenticateToken, requireRole('worker'), (req, res) => {
  const worker = db.prepare('SELECT * FROM workers WHERE user_id = ?').get(req.user.id);
  if (!worker) {
    return res.status(404).json({ error: 'Worker profile not found.' });
  }

  const newStatus = worker.is_emergency_ready === 1 ? 0 : 1;
  db.prepare('UPDATE workers SET is_emergency_ready = ? WHERE id = ?').run(newStatus, worker.id);

  res.json({
    message: `Emergency readiness updated to ${newStatus === 1 ? 'READY' : 'STANDARD'}`,
    is_emergency_ready: newStatus,
  });
});

// Update location / service radius
router.patch('/status/update-location', authenticateToken, requireRole('worker'), (req, res) => {
  const { current_lat, current_lng, service_radius_km } = req.body;
  const worker = db.prepare('SELECT * FROM workers WHERE user_id = ?').get(req.user.id);
  if (!worker) {
    return res.status(404).json({ error: 'Worker profile not found.' });
  }

  db.prepare(`
    UPDATE workers
    SET current_lat = COALESCE(?, current_lat),
        current_lng = COALESCE(?, current_lng),
        service_radius_km = COALESCE(?, service_radius_km)
    WHERE id = ?
  `).run(current_lat, current_lng, service_radius_km, worker.id);

  res.json({ message: 'Worker location and radius updated successfully.' });
});

// Worker Earnings & Analytics Summary
router.get('/analytics/earnings', authenticateToken, requireRole('worker'), (req, res) => {
  const worker = db.prepare('SELECT * FROM workers WHERE user_id = ?').get(req.user.id);
  if (!worker) {
    return res.status(404).json({ error: 'Worker profile not found.' });
  }

  const earningsSummary = db.prepare(`
    SELECT 
      COUNT(*) as completed_jobs,
      COALESCE(SUM(worker_payout), 0) as total_earnings,
      COALESCE(AVG(worker_payout), 0) as avg_job_payout
    FROM bookings
    WHERE worker_id = ? AND status = 'COMPLETED' AND payment_status = 'PAID'
  `).get(worker.id);

  const monthlyPayouts = db.prepare(`
    SELECT 
      strftime('%Y-%m', paid_at) as month,
      SUM(worker_payout) as total_payout,
      COUNT(*) as jobs_count
    FROM payments
    WHERE worker_id = ?
    GROUP BY strftime('%Y-%m', paid_at)
    ORDER BY month DESC
    LIMIT 6
  `).all(worker.id);

  const activeJobs = db.prepare(`
    SELECT b.*, u.name as customer_name, u.phone as customer_phone, s.name as service_name, sc.name as category_name
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN services s ON b.service_id = s.id
    JOIN service_categories sc ON b.category_id = sc.id
    WHERE b.worker_id = ? AND b.status IN ('ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS')
    ORDER BY b.scheduled_at ASC
  `).all(worker.id);

  res.json({
    summary: earningsSummary,
    monthlyPayouts,
    activeJobs,
  });
});

module.exports = router;
