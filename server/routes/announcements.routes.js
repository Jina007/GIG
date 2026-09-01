const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken, optionalAuthenticateToken, requireRole } = require('../middleware/auth');

// Get Announcements
router.get('/', optionalAuthenticateToken, (req, res) => {
  const { cooperative_id, target_audience } = req.query;

  let query = `
    SELECT a.*, coop.name as cooperative_name, f.name as federation_name
    FROM announcements a
    LEFT JOIN cooperatives coop ON a.cooperative_id = coop.id
    LEFT JOIN federations f ON a.federation_id = f.id
    WHERE 1=1
  `;
  const params = [];

  if (cooperative_id) {
    query += ` AND (a.cooperative_id = ? OR a.cooperative_id IS NULL)`;
    params.push(cooperative_id);
  }

  if (target_audience) {
    query += ` AND (a.target_audience = ? OR a.target_audience = 'ALL')`;
    params.push(target_audience);
  }

  query += ` ORDER BY a.created_at DESC LIMIT 20`;

  const announcements = db.prepare(query).all(...params);
  res.json({ count: announcements.length, announcements });
});

// Create Announcement (Cooperative Admin or Federation Admin)
router.post('/create', authenticateToken, requireRole(['cooperative_admin', 'federation_admin']), (req, res) => {
  const { title, content, targetAudience = 'ALL', priority = 'NORMAL', cooperativeId, federationId } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const id = 'ann-' + uuidv4().slice(0, 8);
  const stmt = db.prepare(`
    INSERT INTO announcements (id, cooperative_id, federation_id, title, content, target_audience, priority, author_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    cooperativeId || req.user.cooperative_id || null,
    federationId || 'fed-tn-1',
    title,
    content,
    targetAudience,
    priority,
    req.user.name
  );

  const created = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);
  res.status(201).json({ message: 'Announcement published successfully', announcement: created });
});

module.exports = router;
