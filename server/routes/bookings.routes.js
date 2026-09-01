const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken, optionalAuthenticateToken, requireRole } = require('../middleware/auth');
const { rankWorkersForJob } = require('../services/matchingEngine');

// Smart Match Candidates for a Service Request
router.post('/match-workers', optionalAuthenticateToken, (req, res) => {
  const { categoryId, serviceId, customerLat, customerLng, isEmergency, communityId, regionId } = req.body;

  let query = `
    SELECT 
      w.*,
      u.name,
      u.email,
      u.phone,
      u.avatar,
      coop.name as cooperative_name,
      coop.registration_no as cooperative_reg_no,
      c.name as community_name,
      r.name as region_name
    FROM workers w
    JOIN users u ON w.user_id = u.id
    JOIN cooperatives coop ON w.cooperative_id = coop.id
    LEFT JOIN communities c ON w.community_id = c.id
    LEFT JOIN regions r ON coop.region_id = r.id
    WHERE coop.status = 'ACTIVE'
  `;
  const params = [];

  if (regionId) {
    query += ` AND coop.region_id = ?`;
    params.push(regionId);
  }

  const allWorkers = db.prepare(query).all(...params);

  // Attach skills
  const skillsStmt = db.prepare(`
    SELECT ws.*, sc.name as category_name, sc.slug as category_slug
    FROM worker_skills ws
    JOIN service_categories sc ON ws.category_id = sc.id
    WHERE ws.worker_id = ?
  `);

  const enrichedWorkers = allWorkers.map((w) => ({
    ...w,
    skills: skillsStmt.all(w.id),
  }));

  // Fetch previous workers hired by this customer if authenticated
  let previousWorkerIds = [];
  if (req.user) {
    const pastBookings = db.prepare(`
      SELECT DISTINCT worker_id FROM bookings WHERE customer_id = ? AND status = 'COMPLETED'
    `).all(req.user.id);
    previousWorkerIds = pastBookings.map((b) => b.worker_id).filter(Boolean);
  }

  const rankedWorkers = rankWorkersForJob(enrichedWorkers, {
    customerLat: customerLat || 11.0168,
    customerLng: customerLng || 76.9558,
    categoryId,
    serviceId,
    isEmergency: !!isEmergency,
    customerId: req.user?.id,
    previousWorkerIds,
  });

  res.json({
    count: rankedWorkers.length,
    workers: rankedWorkers,
    serviceDetails: serviceId ? db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId) : null,
  });
});

// Create a new Booking
router.post('/create', authenticateToken, (req, res) => {
  const {
    workerId,
    serviceId,
    categoryId,
    cooperativeId,
    isEmergency = false,
    problemTitle,
    description,
    photos = [],
    scheduledAt,
    customerLat,
    customerLng,
    customerAddress,
    customerPhone,
    matchScore = 95.0,
    matchFactors = [],
  } = req.body;

  if (!serviceId || !problemTitle) {
    return res.status(400).json({ error: 'Service ID and problem title are required.' });
  }

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
  if (!service) {
    return res.status(404).json({ error: 'Selected service not found.' });
  }

  const actualWorker = workerId ? db.prepare(`
    SELECT w.*, coop.id as coop_id 
    FROM workers w 
    JOIN cooperatives coop ON w.cooperative_id = coop.id 
    WHERE w.id = ?
  `).get(workerId) : null;

  const finalCoopId = cooperativeId || (actualWorker ? actualWorker.cooperative_id : 'coop-cbe-1');
  const finalCatId = categoryId || service.category_id;

  // Prevent double booking on worker if already busy
  if (actualWorker && actualWorker.active_workload >= 3 && !isEmergency) {
    return res.status(400).json({ error: 'This worker is currently at peak capacity. Please select another verified cooperative worker.' });
  }

  // Price calculations
  let basePrice = service.base_price;
  if (isEmergency) {
    basePrice = Math.round(basePrice * (service.emergency_multiplier || 1.5));
  }

  const platformFee = Math.round(basePrice * 0.05); // 5% platform maintenance
  const cooperativeFee = Math.round(basePrice * 0.07); // 7% cooperative welfare & admin fund
  const taxes = Math.round(basePrice * 0.03); // 3% statutory tax
  const workerPayout = basePrice - platformFee - cooperativeFee; // 88% direct worker payout
  const totalAmount = basePrice + taxes;

  const bookingId = 'bk-' + uuidv4().slice(0, 8);
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const bookingCode = `SG-${isEmergency ? 'EMG' : 'REG'}-${randNum}`;

  const insertBooking = db.prepare(`
    INSERT INTO bookings (
      id, booking_code, customer_id, worker_id, cooperative_id, service_id, category_id,
      status, is_emergency, problem_title, description, photos_json, scheduled_at,
      customer_lat, customer_lng, customer_address, customer_phone,
      total_amount, platform_fee, cooperative_fee, worker_payout, taxes,
      payment_status, payment_method, match_score, match_factors_json
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      'REQUESTED', ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      'PENDING', 'UPI_SANDBOX', ?, ?
    )
  `);

  const insertHistory = db.prepare(`
    INSERT INTO booking_status_history (id, booking_id, status, notes, changed_by_user_id)
    VALUES (?, ?, 'REQUESTED', 'Service request initiated by customer', ?)
  `);

  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, action_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    insertBooking.run(
      bookingId,
      bookingCode,
      req.user.id,
      workerId || null,
      finalCoopId,
      serviceId,
      finalCatId,
      isEmergency ? 1 : 0,
      problemTitle,
      description || '',
      JSON.stringify(photos),
      scheduledAt || new Date().toISOString(),
      customerLat || 11.0168,
      customerLng || 76.9558,
      customerAddress || req.user.address || 'Peelamedu, Coimbatore',
      customerPhone || req.user.phone || '+91 98765 43210',
      totalAmount,
      platformFee,
      cooperativeFee,
      workerPayout,
      taxes,
      matchScore,
      JSON.stringify(matchFactors)
    );

    insertHistory.run('bsh-' + uuidv4().slice(0, 8), bookingId, req.user.id);

    // If worker assigned, increment their active workload and notify them
    if (actualWorker) {
      db.prepare('UPDATE workers SET active_workload = active_workload + 1 WHERE id = ?').run(actualWorker.id);
      
      // Notify Worker
      insertNotification.run(
        'notif-' + uuidv4().slice(0, 8),
        actualWorker.user_id,
        isEmergency ? '⚡ URGENT: Emergency Service Request' : 'New Job Booking Request',
        `New request: ${problemTitle} from ${req.user.name} (${customerAddress || 'Peelamedu'}). Estimated payout: ₹${workerPayout}`,
        'BOOKING',
        `/bookings/${bookingId}`
      );
    }

    // Customer Notification
    insertNotification.run(
      'notif-' + uuidv4().slice(0, 8),
      req.user.id,
      'Booking Request Submitted',
      `Your booking #${bookingCode} for ${service.name} has been placed. Waiting for worker confirmation.`,
      'BOOKING',
      `/bookings/${bookingId}`
    );
  })();

  const created = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
  res.status(201).json({
    message: 'Booking created successfully',
    booking: {
      ...created,
      match_factors: JSON.parse(created.match_factors_json || '[]'),
      photos: JSON.parse(created.photos_json || '[]'),
    }
  });
});

// Get Bookings List (Role-aware)
router.get('/', authenticateToken, (req, res) => {
  const { status, limit = 50 } = req.query;
  const user = req.user;

  let query = `
    SELECT 
      b.*,
      cust.name as customer_name,
      cust.email as customer_email,
      cust.phone as customer_phone,
      cust.avatar as customer_avatar,
      w_user.name as worker_name,
      w_user.email as worker_email,
      w_user.phone as worker_phone,
      w_user.avatar as worker_avatar,
      w.rating as worker_rating,
      w.total_jobs as worker_total_jobs,
      w.current_lat as worker_lat,
      w.current_lng as worker_lng,
      coop.name as cooperative_name,
      s.name as service_name,
      sc.name as category_name,
      sc.icon as category_icon
    FROM bookings b
    JOIN users cust ON b.customer_id = cust.id
    LEFT JOIN workers w ON b.worker_id = w.id
    LEFT JOIN users w_user ON w.user_id = w_user.id
    JOIN cooperatives coop ON b.cooperative_id = coop.id
    JOIN services s ON b.service_id = s.id
    JOIN service_categories sc ON b.category_id = sc.id
    WHERE 1=1
  `;
  const params = [];

  if (user.role === 'customer') {
    query += ` AND b.customer_id = ?`;
    params.push(user.id);
  } else if (user.role === 'worker') {
    query += ` AND b.worker_id = (SELECT id FROM workers WHERE user_id = ?)`;
    params.push(user.id);
  } else if (user.role === 'cooperative_admin') {
    query += ` AND b.cooperative_id = ?`;
    params.push(user.cooperative_id || 'coop-cbe-1');
  }
  // Federation & Super Admins get all records

  if (status) {
    query += ` AND b.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY b.created_at DESC LIMIT ?`;
  params.push(Number(limit));

  const bookings = db.prepare(query).all(...params);

  const formatted = bookings.map((b) => ({
    ...b,
    match_factors: JSON.parse(b.match_factors_json || '[]'),
    photos: JSON.parse(b.photos_json || '[]'),
  }));

  res.json({ count: formatted.length, bookings: formatted });
});

// Get Single Booking Details
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  const booking = db.prepare(`
    SELECT 
      b.*,
      cust.name as customer_name,
      cust.email as customer_email,
      cust.phone as customer_phone,
      cust.avatar as customer_avatar,
      w_user.name as worker_name,
      w_user.email as worker_email,
      w_user.phone as worker_phone,
      w_user.avatar as worker_avatar,
      w.rating as worker_rating,
      w.total_jobs as worker_total_jobs,
      w.experience_years as worker_experience,
      w.is_membership_verified,
      w.is_skill_verified,
      w.current_lat as worker_lat,
      w.current_lng as worker_lng,
      coop.name as cooperative_name,
      coop.registration_no as cooperative_reg_no,
      coop.phone as cooperative_phone,
      coop.address as cooperative_address,
      s.name as service_name,
      s.estimated_time as service_estimated_time,
      sc.name as category_name,
      sc.icon as category_icon
    FROM bookings b
    JOIN users cust ON b.customer_id = cust.id
    LEFT JOIN workers w ON b.worker_id = w.id
    LEFT JOIN users w_user ON w.user_id = w_user.id
    JOIN cooperatives coop ON b.cooperative_id = coop.id
    JOIN services s ON b.service_id = s.id
    JOIN service_categories sc ON b.category_id = sc.id
    WHERE b.id = ? OR b.booking_code = ?
  `).get(id, id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  // Fetch status history timeline
  const statusHistory = db.prepare(`
    SELECT bsh.*, u.name as changed_by_name 
    FROM booking_status_history bsh
    LEFT JOIN users u ON bsh.changed_by_user_id = u.id
    WHERE bsh.booking_id = ?
    ORDER BY bsh.created_at ASC
  `).all(booking.id);

  // Fetch payment & invoice if available
  const payment = db.prepare('SELECT * FROM payments WHERE booking_id = ?').get(booking.id);
  const invoice = db.prepare('SELECT * FROM invoices WHERE booking_id = ?').get(booking.id);
  const review = db.prepare('SELECT * FROM reviews WHERE booking_id = ?').get(booking.id);

  res.json({
    booking: {
      ...booking,
      match_factors: JSON.parse(booking.match_factors_json || '[]'),
      photos: JSON.parse(booking.photos_json || '[]'),
    },
    statusHistory,
    payment,
    invoice,
    review,
  });
});

// Update Booking Status (State Machine)
router.patch('/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const validStatuses = ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  db.transaction(() => {
    // Update booking status
    const updateStmt = db.prepare(`
      UPDATE bookings 
      SET status = ?, 
          completed_at = CASE WHEN ? = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE completed_at END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateStmt.run(status, status, id);

    // Insert history record
    db.prepare(`
      INSERT INTO booking_status_history (id, booking_id, status, notes, changed_by_user_id)
      VALUES (?, ?, ?, ?, ?)
    `).run('bsh-' + uuidv4().slice(0, 8), id, status, notes || `Status updated to ${status}`, req.user.id);

    // If completed or cancelled, adjust worker workload
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      if (booking.worker_id) {
        db.prepare('UPDATE workers SET active_workload = MAX(0, active_workload - 1) WHERE id = ?').run(booking.worker_id);
      }
    }

    if (status === 'COMPLETED') {
      if (booking.worker_id) {
        db.prepare('UPDATE workers SET total_jobs = total_jobs + 1 WHERE id = ?').run(booking.worker_id);
      }

      // Notify customer to pay & review
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, action_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        'notif-' + uuidv4().slice(0, 8),
        booking.customer_id,
        'Job Completed — Please Settle Payment & Rate Worker',
        `Service #${booking.booking_code} has been marked completed. Total payable: ₹${booking.total_amount}`,
        'PAYMENT',
        `/bookings/${id}`
      );
    } else {
      // Notify customer about on the way / arrived
      const statusLabels = {
        ACCEPTED: 'Worker Accepted Your Booking',
        ON_THE_WAY: 'Worker is On The Way',
        ARRIVED: 'Worker has Arrived at Your Location',
        IN_PROGRESS: 'Work has Commenced',
      };
      if (statusLabels[status]) {
        db.prepare(`
          INSERT INTO notifications (id, user_id, title, message, type, action_url)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          'notif-' + uuidv4().slice(0, 8),
          booking.customer_id,
          statusLabels[status],
          `Status of booking #${booking.booking_code} updated to: ${status}`,
          'BOOKING',
          `/bookings/${id}`
        );
      }
    }
  })();

  const updatedBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  res.json({
    message: `Booking status transitioned to ${status}`,
    booking: updatedBooking,
  });
});

module.exports = router;
