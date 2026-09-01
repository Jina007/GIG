const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'sahakari_gig_sih26089_secret_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, role, phone, avatar, region_id, community_id, cooperative_id, address FROM users WHERE id = ?').get(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User session invalid or user not found.' });
    }

    req.user = user;

    // If user is worker, fetch worker record with cooperative and trade skills
    if (user.role === 'worker') {
      const worker = db.prepare(`
        SELECT w.*, coop.name as cooperative_name, coop.registration_no as cooperative_reg_no, c.name as community_name
        FROM workers w
        JOIN cooperatives coop ON w.cooperative_id = coop.id
        LEFT JOIN communities c ON w.community_id = c.id
        WHERE w.user_id = ?
      `).get(user.id);
      if (worker) {
        const skills = db.prepare(`
          SELECT ws.*, sc.name as category_name, sc.slug as category_slug
          FROM worker_skills ws
          JOIN service_categories sc ON ws.category_id = sc.id
          WHERE ws.worker_id = ?
        `).all(worker.id);
        worker.skills = skills;
        worker.primary_trade = skills[0]?.category_name || skills[0]?.skill_name || 'Master Tradesman';
      }
      req.worker = worker;
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, role, phone, avatar, region_id, community_id, cooperative_id, address FROM users WHERE id = ?').get(decoded.id);
    req.user = user || null;
    if (user && user.role === 'worker') {
      req.worker = db.prepare('SELECT * FROM workers WHERE user_id = ?').get(user.id);
    }
  } catch (err) {
    req.user = null;
  }
  next();
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'federation_admin') {
      return res.status(403).json({ 
        error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}` 
      });
    }

    next();
  };
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  optionalAuthenticateToken,
  requireRole,
};
