const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Submit a Review & Rating
router.post('/submit', authenticateToken, (req, res) => {
  const {
    bookingId,
    rating,
    comment,
    punctualityRating = 5,
    qualityRating = 5,
    behaviorRating = 5,
    markAsFavorite = false,
  } = req.body;

  if (!bookingId || !rating) {
    return res.status(400).json({ error: 'Booking ID and overall rating (1-5) are required.' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (booking.customer_id !== req.user.id) {
    return res.status(403).json({ error: 'Only the customer who placed this booking can submit a review.' });
  }

  const existingReview = db.prepare('SELECT id FROM reviews WHERE booking_id = ?').get(bookingId);
  if (existingReview) {
    return res.status(400).json({ error: 'A review has already been submitted for this booking.' });
  }

  const reviewId = 'rev-' + uuidv4().slice(0, 8);

  db.transaction(() => {
    // 1. Insert Review
    db.prepare(`
      INSERT INTO reviews (
        id, booking_id, customer_id, worker_id, rating, comment,
        punctuality_rating, quality_rating, behavior_rating, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      reviewId,
      bookingId,
      req.user.id,
      booking.worker_id,
      rating,
      comment || 'Excellent cooperative service!',
      punctualityRating,
      qualityRating,
      behaviorRating
    );

    // 2. Update Worker Aggregate Rating & Review Count
    if (booking.worker_id) {
      const stats = db.prepare(`
        SELECT COUNT(*) as count, AVG(rating) as avg_rating
        FROM reviews
        WHERE worker_id = ?
      `).get(booking.worker_id);

      // Check repeat customer count
      const repeatCustomerCount = db.prepare(`
        SELECT COUNT(DISTINCT customer_id) as repeats
        FROM bookings
        WHERE worker_id = ? AND status = 'COMPLETED'
        GROUP BY customer_id
        HAVING COUNT(*) > 1
      `).all(booking.worker_id).length;

      db.prepare(`
        UPDATE workers
        SET rating = ROUND(?, 1),
            review_count = ?,
            repeat_customers_count = ?
        WHERE id = ?
      `).run(stats.avg_rating || rating, stats.count || 1, repeatCustomerCount, booking.worker_id);

      // Handle Favorite Worker
      if (markAsFavorite) {
        db.prepare(`
          INSERT OR IGNORE INTO favorite_workers (id, customer_id, worker_id)
          VALUES (?, ?, ?)
        `).run('fav-' + uuidv4().slice(0, 8), req.user.id, booking.worker_id);
      }
    }
  })();

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);
  res.status(201).json({
    message: 'Review submitted successfully. Thank you for supporting cooperative gig workers!',
    review,
  });
});

// Toggle Favorite Worker
router.post('/favorite/toggle', authenticateToken, (req, res) => {
  const { workerId } = req.body;
  if (!workerId) {
    return res.status(400).json({ error: 'Worker ID is required.' });
  }

  const existing = db.prepare('SELECT id FROM favorite_workers WHERE customer_id = ? AND worker_id = ?').get(req.user.id, workerId);

  if (existing) {
    db.prepare('DELETE FROM favorite_workers WHERE id = ?').run(existing.id);
    return res.json({ message: 'Removed from favorite workers.', isFavorite: false });
  } else {
    db.prepare('INSERT INTO favorite_workers (id, customer_id, worker_id) VALUES (?, ?, ?)').run(
      'fav-' + uuidv4().slice(0, 8),
      req.user.id,
      workerId
    );
    return res.json({ message: 'Added to trusted favorite workers.', isFavorite: true });
  }
});

// Get Customer Favorite Workers
router.get('/favorites', authenticateToken, (req, res) => {
  const favorites = db.prepare(`
    SELECT 
      w.*,
      u.name,
      u.phone,
      u.avatar,
      coop.name as cooperative_name,
      c.name as community_name
    FROM favorite_workers fw
    JOIN workers w ON fw.worker_id = w.id
    JOIN users u ON w.user_id = u.id
    JOIN cooperatives coop ON w.cooperative_id = coop.id
    LEFT JOIN communities c ON w.community_id = c.id
    WHERE fw.customer_id = ?
  `).all(req.user.id);

  res.json({ count: favorites.length, favorites });
});

module.exports = router;
