const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Process Sandbox Payment & Generate Digital Invoice
router.post('/process', authenticateToken, (req, res) => {
  const { bookingId, paymentMethod = 'UPI_SANDBOX' } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required.' });
  }

  const booking = db.prepare(`
    SELECT 
      b.*,
      cust.name as customer_name,
      cust.phone as customer_phone,
      cust.address as customer_address,
      w_user.name as worker_name,
      coop.name as cooperative_name,
      s.name as service_name
    FROM bookings b
    JOIN users cust ON b.customer_id = cust.id
    LEFT JOIN workers w ON b.worker_id = w.id
    LEFT JOIN users w_user ON w.user_id = w_user.id
    JOIN cooperatives coop ON b.cooperative_id = coop.id
    JOIN services s ON b.service_id = s.id
    WHERE b.id = ?
  `).get(bookingId);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (booking.payment_status === 'PAID') {
    return res.status(400).json({ error: 'Payment has already been processed for this booking.' });
  }

  const paymentId = 'pay-' + uuidv4().slice(0, 8);
  const txnId = 'TXN-UPI-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
  const invoiceNo = 'INV-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);

  db.transaction(() => {
    // 1. Insert Payment Record
    db.prepare(`
      INSERT INTO payments (
        id, booking_id, customer_id, worker_id, cooperative_id,
        amount, platform_fee, cooperative_fee, worker_payout, taxes,
        payment_method, transaction_id, status, invoice_no, paid_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', ?, CURRENT_TIMESTAMP)
    `).run(
      paymentId,
      booking.id,
      booking.customer_id,
      booking.worker_id,
      booking.cooperative_id,
      booking.total_amount,
      booking.platform_fee,
      booking.cooperative_fee,
      booking.worker_payout,
      booking.taxes,
      paymentMethod,
      txnId,
      invoiceNo
    );

    // 2. Insert Invoice Record
    db.prepare(`
      INSERT INTO invoices (
        id, invoice_no, booking_id, payment_id,
        customer_name, customer_phone, customer_address,
        worker_name, worker_cooperative_name, service_name,
        base_amount, platform_fee, cooperative_fee, taxes, total_amount, is_emergency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'inv-' + uuidv4().slice(0, 8),
      invoiceNo,
      booking.id,
      paymentId,
      booking.customer_name,
      booking.customer_phone,
      booking.customer_address,
      booking.worker_name || 'Assigned Cooperative Worker',
      booking.cooperative_name,
      booking.service_name,
      booking.total_amount - booking.taxes,
      booking.platform_fee,
      booking.cooperative_fee,
      booking.taxes,
      booking.total_amount,
      booking.is_emergency
    );

    // 3. Update Booking Payment Status
    db.prepare(`
      UPDATE bookings
      SET payment_status = 'PAID',
          payment_method = ?,
          status = CASE WHEN status = 'REQUESTED' THEN 'ACCEPTED' ELSE status END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(paymentMethod, booking.id);

    // 4. Send Notifications
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, action_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'notif-' + uuidv4().slice(0, 8),
      booking.customer_id,
      'Payment Received — Receipt & Invoice Ready',
      `Payment of ₹${booking.total_amount} confirmed for booking #${booking.booking_code}. Invoice #${invoiceNo} is ready to download.`,
      'PAYMENT',
      `/bookings/${booking.id}`
    );

    if (booking.worker_id) {
      const workerUser = db.prepare('SELECT user_id FROM workers WHERE id = ?').get(booking.worker_id);
      if (workerUser) {
        db.prepare(`
          INSERT INTO notifications (id, user_id, title, message, type, action_url)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          'notif-' + uuidv4().slice(0, 8),
          workerUser.user_id,
          'Payout Credited to Cooperative Account',
          `Payout of ₹${booking.worker_payout} for job #${booking.booking_code} has been settled to your account.`,
          'PAYMENT',
          `/worker-dashboard`
        );
      }
    }
  })();

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
  const invoice = db.prepare('SELECT * FROM invoices WHERE invoice_no = ?').get(invoiceNo);

  res.json({
    message: 'Payment completed successfully. Digital invoice generated.',
    payment,
    invoice,
  });
});

// Get Invoice by Booking ID
router.get('/invoice/:bookingId', authenticateToken, (req, res) => {
  const { bookingId } = req.params;
  const invoice = db.prepare(`
    SELECT inv.*, b.booking_code, b.created_at as booking_date, pay.transaction_id, pay.payment_method, pay.paid_at
    FROM invoices inv
    JOIN bookings b ON inv.booking_id = b.id
    LEFT JOIN payments pay ON inv.payment_id = pay.id
    WHERE inv.booking_id = ?
  `).get(bookingId);

  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found for this booking.' });
  }

  res.json({ invoice });
});

module.exports = router;
