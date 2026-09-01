const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all service categories with sub-services
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM service_categories ORDER BY name ASC').all();
  const services = db.prepare('SELECT * FROM services ORDER BY base_price ASC').all();

  const enriched = categories.map((cat) => ({
    ...cat,
    services: services.filter((s) => s.category_id === cat.id),
  }));

  res.json({ categories: enriched });
});

// Get single category by slug or id
router.get('/categories/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  const category = db.prepare('SELECT * FROM service_categories WHERE id = ? OR slug = ?').get(slugOrId, slugOrId);

  if (!category) {
    return res.status(404).json({ error: 'Service category not found.' });
  }

  const services = db.prepare('SELECT * FROM services WHERE category_id = ?').all(category.id);
  res.json({ category, services });
});

// Add new service category (Cooperative Admin or Federation Admin)
router.post('/categories', authenticateToken, requireRole(['cooperative_admin', 'federation_admin']), (req, res) => {
  const { name, icon, description, base_price, is_emergency_supported, unit } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const id = 'cat-' + uuidv4().slice(0, 8);

  const stmt = db.prepare(`
    INSERT INTO service_categories (id, name, slug, icon, description, base_price, unit, is_emergency_supported)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, name, slug, icon || 'Wrench', description || '', base_price || 300, unit || 'per service', is_emergency_supported ? 1 : 0);

  const created = db.prepare('SELECT * FROM service_categories WHERE id = ?').get(id);
  res.status(201).json({ message: 'Service category created', category: created });
});

// Add sub-service
router.post('/', authenticateToken, requireRole(['cooperative_admin', 'federation_admin']), (req, res) => {
  const { category_id, name, description, estimated_time, base_price, emergency_multiplier } = req.body;

  if (!category_id || !name || !base_price) {
    return res.status(400).json({ error: 'Category ID, name, and base price are required.' });
  }

  const id = 'srv-' + uuidv4().slice(0, 8);
  const stmt = db.prepare(`
    INSERT INTO services (id, category_id, name, description, estimated_time, base_price, emergency_multiplier)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, category_id, name, description || '', estimated_time || '1-2 hours', base_price, emergency_multiplier || 1.5);

  const created = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  res.status(201).json({ message: 'Sub-service created successfully', service: created });
});

module.exports = router;
