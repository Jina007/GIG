const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all Cooperatives with summary stats
router.get('/', (req, res) => {
  const { region_id } = req.query;

  let query = `
    SELECT 
      coop.*,
      r.name as region_name,
      f.name as federation_name,
      (SELECT COUNT(*) FROM workers WHERE cooperative_id = coop.id) as total_workers,
      (SELECT COUNT(*) FROM workers WHERE cooperative_id = coop.id AND is_available = 1) as active_workers,
      (SELECT COUNT(*) FROM bookings WHERE cooperative_id = coop.id AND status = 'COMPLETED') as completed_jobs,
      (SELECT COALESCE(AVG(rating), 4.8) FROM workers WHERE cooperative_id = coop.id) as avg_rating
    FROM cooperatives coop
    JOIN regions r ON coop.region_id = r.id
    JOIN federations f ON coop.federation_id = f.id
    WHERE 1=1
  `;
  const params = [];

  if (region_id) {
    query += ` AND coop.region_id = ?`;
    params.push(region_id);
  }

  query += ` ORDER BY coop.name ASC`;

  const coops = db.prepare(query).all(...params);
  res.json({ count: coops.length, cooperatives: coops });
});

// Get Single Cooperative Details & Dashboard Stats
router.get('/:id/stats', (req, res) => {
  const { id } = req.params;

  const coop = db.prepare(`
    SELECT coop.*, r.name as region_name, f.name as federation_name
    FROM cooperatives coop
    JOIN regions r ON coop.region_id = r.id
    JOIN federations f ON coop.federation_id = f.id
    WHERE coop.id = ?
  `).get(id);

  if (!coop) {
    return res.status(404).json({ error: 'Cooperative society not found.' });
  }

  // Key KPI Cards
  const totalWorkers = db.prepare('SELECT COUNT(*) as count FROM workers WHERE cooperative_id = ?').get(id).count;
  const activeWorkers = db.prepare('SELECT COUNT(*) as count FROM workers WHERE cooperative_id = ? AND is_available = 1').get(id).count;
  const pendingVerifications = db.prepare(`
    SELECT COUNT(*) as count FROM workers 
    WHERE cooperative_id = ? AND (is_membership_verified = 0 OR is_skill_verified = 0 OR is_identity_verified = 0)
  `).get(id).count;

  const activeJobs = db.prepare(`
    SELECT COUNT(*) as count FROM bookings 
    WHERE cooperative_id = ? AND status IN ('REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS')
  `).get(id).count;

  const completedJobs = db.prepare(`
    SELECT COUNT(*) as count FROM bookings WHERE cooperative_id = ? AND status = 'COMPLETED'
  `).get(id).count;

  const emergencyJobs = db.prepare(`
    SELECT COUNT(*) as count FROM bookings WHERE cooperative_id = ? AND is_emergency = 1
  `).get(id).count;

  const earningsData = db.prepare(`
    SELECT 
      COALESCE(SUM(total_amount), 0) as gross_volume,
      COALESCE(SUM(cooperative_fee), 0) as cooperative_fund,
      COALESCE(SUM(worker_payout), 0) as total_worker_payouts
    FROM bookings 
    WHERE cooperative_id = ? AND payment_status = 'PAID'
  `).get(id);

  const avgRating = db.prepare('SELECT COALESCE(AVG(rating), 4.8) as avg_rating FROM workers WHERE cooperative_id = ?').get(id).avg_rating;

  // Chart Data 1: Jobs by Service Category
  const jobsByCategory = db.prepare(`
    SELECT sc.name, COUNT(b.id) as count
    FROM bookings b
    JOIN service_categories sc ON b.category_id = sc.id
    WHERE b.cooperative_id = ?
    GROUP BY sc.name
    ORDER BY count DESC
    LIMIT 7
  `).all(id);

  // Chart Data 2: Jobs by Community
  const jobsByCommunity = db.prepare(`
    SELECT c.name, COUNT(b.id) as count
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    LEFT JOIN communities c ON u.community_id = c.id
    WHERE b.cooperative_id = ? AND c.name IS NOT NULL
    GROUP BY c.name
    ORDER BY count DESC
    LIMIT 6
  `).all(id);

  // Chart Data 3: Monthly Revenue & Jobs Trend
  const monthlyTrends = db.prepare(`
    SELECT 
      strftime('%Y-%m', created_at) as month,
      COUNT(id) as total_jobs,
      COALESCE(SUM(total_amount), 0) as revenue,
      COALESCE(SUM(cooperative_fee), 0) as cooperative_fee
    FROM bookings
    WHERE cooperative_id = ?
    GROUP BY strftime('%Y-%m', created_at)
    ORDER BY month ASC
    LIMIT 6
  `).all(id);

  // Welfare Metrics
  const activeWelfareSchemes = db.prepare(`
    SELECT COUNT(DISTINCT scheme_name) as schemes_count, COALESCE(SUM(benefits_disbursed), 0) as total_benefits_disbursed
    FROM welfare_records
    WHERE cooperative_id = ?
  `).get(id);

  // Open Complaints
  const openComplaintsCount = db.prepare(`
    SELECT COUNT(*) as count FROM complaints WHERE cooperative_id = ? AND status IN ('OPEN', 'UNDER_REVIEW')
  `).get(id).count;

  res.json({
    cooperative: coop,
    kpis: {
      totalWorkers,
      activeWorkers,
      pendingVerifications,
      activeJobs,
      completedJobs,
      emergencyJobs,
      grossVolume: earningsData.gross_volume,
      cooperativeFund: earningsData.cooperative_fund,
      workerPayouts: earningsData.total_worker_payouts,
      avgRating: Number(avgRating.toFixed(1)),
      activeWelfareSchemes: activeWelfareSchemes.schemes_count,
      totalBenefitsDisbursed: activeWelfareSchemes.total_benefits_disbursed,
      openComplaints: openComplaintsCount,
    },
    charts: {
      jobsByCategory,
      jobsByCommunity,
      monthlyTrends,
    }
  });
});

// Get Workers of this Cooperative (with verification status for admin)
router.get('/:id/workers', (req, res) => {
  const { id } = req.params;
  const { status_filter } = req.query;

  let query = `
    SELECT 
      w.*,
      u.name,
      u.email,
      u.phone,
      u.avatar,
      c.name as community_name
    FROM workers w
    JOIN users u ON w.user_id = u.id
    LEFT JOIN communities c ON w.community_id = c.id
    WHERE w.cooperative_id = ?
  `;
  const params = [id];

  if (status_filter === 'pending') {
    query += ` AND (w.is_membership_verified = 0 OR w.is_skill_verified = 0 OR w.is_identity_verified = 0)`;
  } else if (status_filter === 'verified') {
    query += ` AND w.is_membership_verified = 1 AND w.is_skill_verified = 1 AND w.is_identity_verified = 1`;
  }

  query += ` ORDER BY w.created_at DESC`;

  const workers = db.prepare(query).all(...params);

  // Attach skills and certs
  const skillsStmt = db.prepare('SELECT ws.*, sc.name as category_name FROM worker_skills ws JOIN service_categories sc ON ws.category_id = sc.id WHERE ws.worker_id = ?');
  const certsStmt = db.prepare('SELECT * FROM certifications WHERE worker_id = ?');

  const enriched = workers.map(w => ({
    ...w,
    skills: skillsStmt.all(w.id),
    certifications: certsStmt.all(w.id),
  }));

  res.json({ count: enriched.length, workers: enriched });
});

// Verify / Update Worker Credentials (Cooperative Admin Action)
router.post('/verify-worker', authenticateToken, requireRole(['cooperative_admin', 'federation_admin']), (req, res) => {
  const {
    workerId,
    isIdentityVerified,
    isMembershipVerified,
    isSkillVerified,
    isCertVerified,
    isEmergencyReady,
  } = req.body;

  if (!workerId) {
    return res.status(400).json({ error: 'Worker ID is required.' });
  }

  const worker = db.prepare('SELECT * FROM workers WHERE id = ?').get(workerId);
  if (!worker) {
    return res.status(404).json({ error: 'Worker not found.' });
  }

  const stmt = db.prepare(`
    UPDATE workers
    SET is_identity_verified = COALESCE(?, is_identity_verified),
        is_membership_verified = COALESCE(?, is_membership_verified),
        is_skill_verified = COALESCE(?, is_skill_verified),
        is_cert_verified = COALESCE(?, is_cert_verified),
        is_emergency_ready = COALESCE(?, is_emergency_ready),
        verified_by = ?,
        verified_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    isIdentityVerified !== undefined ? (isIdentityVerified ? 1 : 0) : null,
    isMembershipVerified !== undefined ? (isMembershipVerified ? 1 : 0) : null,
    isSkillVerified !== undefined ? (isSkillVerified ? 1 : 0) : null,
    isCertVerified !== undefined ? (isCertVerified ? 1 : 0) : null,
    isEmergencyReady !== undefined ? (isEmergencyReady ? 1 : 0) : null,
    req.user.id,
    workerId
  );

  // Send Notification to worker
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, action_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'notif-' + uuidv4().slice(0, 8),
    worker.user_id,
    'Cooperative Verification Updated',
    'Your worker verification and membership status has been reviewed and updated by your cooperative society.',
    'WELFARE',
    '/worker-dashboard'
  );

  const updated = db.prepare('SELECT * FROM workers WHERE id = ?').get(workerId);
  res.json({ message: 'Worker verification credentials updated successfully.', worker: updated });
});

module.exports = router;
