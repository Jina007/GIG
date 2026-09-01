const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Create Complaint (Customer)
router.post('/create', authenticateToken, (req, res) => {
  const { bookingId, title, description, category = 'QUALITY', evidencePhotos = [], priority = 'MEDIUM' } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Complaint title and description are required.' });
  }

  let booking = null;
  let workerId = null;
  let coopId = 'coop-cbe-1';

  if (bookingId) {
    booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    if (booking) {
      workerId = booking.worker_id;
      coopId = booking.cooperative_id;
      // update booking status to disputed
      db.prepare("UPDATE bookings SET status = 'DISPUTED' WHERE id = ?").run(bookingId);
    }
  }

  const ticketNo = 'CMP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const complaintId = 'cmp-' + uuidv4().slice(0, 8);

  const stmt = db.prepare(`
    INSERT INTO complaints (
      id, ticket_no, booking_id, customer_id, worker_id, cooperative_id,
      title, description, category, evidence_photos_json, status, priority
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)
  `);

  stmt.run(
    complaintId,
    ticketNo,
    bookingId || null,
    req.user.id,
    workerId,
    coopId,
    title,
    description,
    category,
    JSON.stringify(evidencePhotos),
    priority
  );

  // Notify Cooperative Admin
  const coopAdmin = db.prepare("SELECT id FROM users WHERE cooperative_id = ? AND role = 'cooperative_admin'").get(coopId);
  if (coopAdmin) {
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, action_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'notif-' + uuidv4().slice(0, 8),
      coopAdmin.id,
      `⚠️ New Customer Complaint Raised: ${ticketNo}`,
      `Complaint "${title}" filed regarding service. Priority: ${priority}`,
      'COMPLAINT',
      `/admin/complaints`
    );
  }

  const created = db.prepare('SELECT * FROM complaints WHERE id = ?').get(complaintId);
  res.status(201).json({
    message: 'Complaint submitted. Your local Labour Cooperative will review and mediate this dispute.',
    complaint: {
      ...created,
      evidence_photos: JSON.parse(created.evidence_photos_json || '[]'),
    }
  });
});

// Get Complaints List (Role-filtered)
router.get('/', authenticateToken, (req, res) => {
  const { status, escalated_only } = req.query;
  const user = req.user;

  let query = `
    SELECT 
      c.*,
      cust.name as customer_name,
      cust.email as customer_email,
      cust.phone as customer_phone,
      w_user.name as worker_name,
      coop.name as cooperative_name,
      b.booking_code,
      s.name as service_name
    FROM complaints c
    JOIN users cust ON c.customer_id = cust.id
    LEFT JOIN workers w ON c.worker_id = w.id
    LEFT JOIN users w_user ON w.user_id = w_user.id
    JOIN cooperatives coop ON c.cooperative_id = coop.id
    LEFT JOIN bookings b ON c.booking_id = b.id
    LEFT JOIN services s ON b.service_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (user.role === 'customer') {
    query += ` AND c.customer_id = ?`;
    params.push(user.id);
  } else if (user.role === 'worker') {
    query += ` AND c.worker_id = (SELECT id FROM workers WHERE user_id = ?)`;
    params.push(user.id);
  } else if (user.role === 'cooperative_admin') {
    query += ` AND c.cooperative_id = ?`;
    params.push(user.cooperative_id || 'coop-cbe-1');
  }

  if (status) {
    query += ` AND c.status = ?`;
    params.push(status);
  }

  if (escalated_only === 'true') {
    query += ` AND c.escalated_to_federation = 1`;
  }

  query += ` ORDER BY c.created_at DESC`;

  const complaints = db.prepare(query).all(...params);

  const formatted = complaints.map(c => ({
    ...c,
    evidence_photos: JSON.parse(c.evidence_photos_json || '[]'),
  }));

  res.json({ count: formatted.length, complaints: formatted });
});

// Update Complaint Status & Resolution (Coop Admin / Federation Admin)
router.patch('/:id/status', authenticateToken, requireRole(['cooperative_admin', 'federation_admin']), (req, res) => {
  const { id } = req.params;
  const { status, resolution_notes, escalate_to_federation } = req.body;

  const validStatuses = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'ESCALATED', 'CLOSED'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found.' });
  }

  const stmt = db.prepare(`
    UPDATE complaints
    SET status = COALESCE(?, status),
        resolution_notes = COALESCE(?, resolution_notes),
        escalated_to_federation = COALESCE(?, escalated_to_federation),
        resolved_by = CASE WHEN ? = 'RESOLVED' THEN ? ELSE resolved_by END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const shouldEscalate = escalate_to_federation ? 1 : (status === 'ESCALATED' ? 1 : null);
  stmt.run(status, resolution_notes, shouldEscalate, status, req.user.id, id);

  // Notify customer
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, action_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'notif-' + uuidv4().slice(0, 8),
    complaint.customer_id,
    `Complaint #${complaint.ticket_no} Updated`,
    `Your complaint status is now: ${status || (shouldEscalate ? 'ESCALATED' : 'UPDATED')}. ${resolution_notes ? 'Note: ' + resolution_notes : ''}`,
    'COMPLAINT',
    `/complaints`
  );

  const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
  res.json({ message: 'Complaint updated successfully.', complaint: updated });
});

module.exports = router;
