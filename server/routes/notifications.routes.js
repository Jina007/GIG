const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get current user notifications
router.get('/', authenticateToken, (req, res) => {
  const notifications = db.prepare(`
    SELECT * FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 30
  `).all(req.user.id);

  const unreadCount = notifications.filter(n => n.is_read === 0).length;

  res.json({ count: notifications.length, unreadCount, notifications });
});

// Mark all as read
router.patch('/mark-all-read', authenticateToken, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'All notifications marked as read' });
});

// Mark single as read
router.patch('/:id/read', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, req.user.id);
  res.json({ message: 'Notification marked as read' });
});

module.exports = router;
