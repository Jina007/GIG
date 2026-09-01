const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get Welfare Overview & Records for a Worker
router.get('/worker/:workerId', authenticateToken, (req, res) => {
  const { workerId } = req.params;

  const worker = db.prepare(`
    SELECT w.*, u.name as worker_name, coop.name as cooperative_name
    FROM workers w
    JOIN users u ON w.user_id = u.id
    JOIN cooperatives coop ON w.cooperative_id = coop.id
    WHERE w.id = ? OR w.user_id = ?
  `).get(workerId, workerId);

  if (!worker) {
    return res.status(404).json({ error: 'Worker profile not found.' });
  }

  const welfareRecords = db.prepare('SELECT * FROM welfare_records WHERE worker_id = ?').all(worker.id);
  const trainingRecords = db.prepare('SELECT * FROM training_records WHERE worker_id = ?').all(worker.id);

  const totalCoverage = welfareRecords.reduce((acc, r) => acc + (r.coverage_amount || 0), 0);
  const totalDisbursed = welfareRecords.reduce((acc, r) => acc + (r.benefits_disbursed || 0), 0);

  res.json({
    worker,
    welfareRecords,
    trainingRecords,
    summary: {
      insuranceStatus: welfareRecords.some(r => r.scheme_type === 'HEALTH_INSURANCE' && r.status === 'ACTIVE') ? 'ACTIVE' : 'ENROLLED',
      welfareFundStatus: 'ACTIVE_MEMBER',
      totalCoverageAmount: totalCoverage,
      totalBenefitsDisbursed: totalDisbursed,
      trainingsCompletedCount: trainingRecords.length,
    }
  });
});

// Add Welfare Record (Cooperative Admin)
router.post('/record/add', authenticateToken, requireRole(['cooperative_admin', 'federation_admin']), (req, res) => {
  const { workerId, cooperativeId, schemeName, schemeType, policyNo, coverageAmount, validityDate, benefitsDisbursed } = req.body;

  if (!workerId || !schemeName || !schemeType) {
    return res.status(400).json({ error: 'Worker ID, scheme name, and scheme type are required.' });
  }

  const id = 'wlf-' + uuidv4().slice(0, 8);
  const stmt = db.prepare(`
    INSERT INTO welfare_records (
      id, worker_id, cooperative_id, scheme_name, scheme_type,
      policy_no, coverage_amount, validity_date, status, benefits_disbursed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
  `);

  stmt.run(
    id,
    workerId,
    cooperativeId || 'coop-cbe-1',
    schemeName,
    schemeType,
    policyNo || 'POL-COOP-' + Math.floor(100000 + Math.random() * 900000),
    coverageAmount || 200000,
    validityDate || '2027-12-31',
    benefitsDisbursed || 0
  );

  const created = db.prepare('SELECT * FROM welfare_records WHERE id = ?').get(id);
  res.status(201).json({ message: 'Welfare record created successfully', record: created });
});

// Add Training Record
router.post('/training/add', authenticateToken, requireRole(['cooperative_admin', 'federation_admin']), (req, res) => {
  const { workerId, trainingName, institution, completedDate, validityDate, certificateNo } = req.body;

  if (!workerId || !trainingName || !institution) {
    return res.status(400).json({ error: 'Worker ID, training name, and institution are required.' });
  }

  const id = 'trn-' + uuidv4().slice(0, 8);
  const stmt = db.prepare(`
    INSERT INTO training_records (
      id, worker_id, training_name, institution, completed_date, validity_date, status, certificate_no
    ) VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?)
  `);

  stmt.run(
    id,
    workerId,
    trainingName,
    institution,
    completedDate || '2025-06-15',
    validityDate || '2028-06-15',
    certificateNo || 'NSDC-CERT-' + Math.floor(10000 + Math.random() * 90000)
  );

  const created = db.prepare('SELECT * FROM training_records WHERE id = ?').get(id);
  res.status(201).json({ message: 'Training record added successfully', record: created });
});

module.exports = router;
