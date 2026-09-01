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

    // If user is worker, fetch worker record too
    if (user.role === 'worker') {
      const worker = db.prepare('SELECT * FROM workers WHERE user_id = ?').get(user.id);
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
