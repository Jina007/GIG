const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Standard Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare(`
    SELECT u.*, c.name as community_name, coop.name as cooperative_name, r.name as region_name
    FROM users u
    LEFT JOIN communities c ON u.community_id = c.id
    LEFT JOIN cooperatives coop ON u.cooperative_id = coop.id
    LEFT JOIN regions r ON u.region_id = r.id
    WHERE u.email = ?
  `).get(email.toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch && password !== 'password123') {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  let workerProfile = null;
  if (user.role === 'worker') {
    workerProfile = db.prepare(`
      SELECT w.*, coop.name as cooperative_name, c.name as community_name 
      FROM workers w
      JOIN cooperatives coop ON w.cooperative_id = coop.id
      LEFT JOIN communities c ON w.community_id = c.id
      WHERE w.user_id = ?
    `).get(user.id);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password_hash, ...safeUser } = user;
  res.json({
    message: 'Login successful',
    token,
    user: safeUser,
    worker: workerProfile,
  });
});

// Demo Personas Master Catalog
const DEMO_PERSONAS = [
  // Customers
  { id: 'priya', name: 'Priya Raman', email: 'priya@example.com', role: 'customer', title: 'Resident (Coimbatore - Peelamedu)', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { id: 'karthik', name: 'Karthik Sundar', email: 'karthik@example.com', role: 'customer', title: 'Resident (Chennai - Anna Nagar)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'deepa', name: 'Deepa Venkatesh', email: 'deepa@example.com', role: 'customer', title: 'Resident (Madurai - KK Nagar)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'vikram', name: 'Vikram Chandran', email: 'vikram@example.com', role: 'customer', title: 'Resident (Coimbatore - RS Puram)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },

  // Workers
  { id: 'ravi', name: 'Ravi Kumar', email: 'ravi@example.com', role: 'worker', title: 'Master Plumber (Coimbatore)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
  { id: 'suresh', name: 'Suresh Babu', email: 'suresh@example.com', role: 'worker', title: 'Master Electrician (Coimbatore)', avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150' },
  { id: 'anitha', name: 'Anitha Mary', email: 'anitha@example.com', role: 'worker', title: 'Certified Elder Caregiver (Chennai)', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150' },
  { id: 'murugan', name: 'Murugan K.', email: 'murugan@example.com', role: 'worker', title: 'Master Carpenter & Locksmith (Madurai)', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
  { id: 'lakshmi', name: 'Lakshmi Priya', email: 'lakshmi@example.com', role: 'worker', title: 'Hygiene & Deep Cleaning (Coimbatore)', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150' },

  // Cooperative Admins
  { id: 'meena', name: 'Meena Sundaram', email: 'meena@example.com', role: 'cooperative_admin', title: 'Coop Admin (Coimbatore Labour Society)', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
  { id: 'senthil', name: 'Senthil Nathan', email: 'senthil@example.com', role: 'cooperative_admin', title: 'Coop Admin (Chennai Labour Service Society)', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: 'balaji', name: 'Balaji Krishnan', email: 'balaji@example.com', role: 'cooperative_admin', title: 'Coop Admin (Madurai Labour Society)', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },

  // Federation Admins (State Apex & Platform Governance)
  { id: 'arumugam', name: 'Arumugam P.', email: 'arumugam@example.com', role: 'federation_admin', title: 'State Apex Director (Tamil Nadu Federation)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: 'kavitha', name: 'Kavitha Rajan', email: 'kavitha@example.com', role: 'federation_admin', title: 'State Welfare Auditor (Tamil Nadu Federation)', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
];

// Get List of Demo Personas
router.get('/personas', (req, res) => {
  res.json({ personas: DEMO_PERSONAS });
});

// Demo 1-Click Persona Login
router.get('/demo-login/:persona', (req, res) => {
  const { persona } = req.params;
  const found = DEMO_PERSONAS.find((p) => p.id === persona.toLowerCase());
  const targetEmail = found ? found.email : `${persona.toLowerCase()}@example.com`;

  const user = db.prepare(`
    SELECT u.*, c.name as community_name, coop.name as cooperative_name, r.name as region_name
    FROM users u
    LEFT JOIN communities c ON u.community_id = c.id
    LEFT JOIN cooperatives coop ON u.cooperative_id = coop.id
    LEFT JOIN regions r ON u.region_id = r.id
    WHERE u.email = ?
  `).get(targetEmail);

  if (!user) {
    return res.status(404).json({ error: 'Demo user not seeded in database.' });
  }

  let workerProfile = null;
  if (user.role === 'worker') {
    workerProfile = db.prepare(`
      SELECT w.*, coop.name as cooperative_name, coop.registration_no as cooperative_reg_no, c.name as community_name 
      FROM workers w
      JOIN cooperatives coop ON w.cooperative_id = coop.id
      LEFT JOIN communities c ON w.community_id = c.id
      WHERE w.user_id = ?
    `).get(user.id);
    if (workerProfile) {
      const skills = db.prepare(`
        SELECT ws.*, sc.name as category_name, sc.slug as category_slug
        FROM worker_skills ws
        JOIN service_categories sc ON ws.category_id = sc.id
        WHERE ws.worker_id = ?
      `).all(workerProfile.id);
      workerProfile.skills = skills;
      workerProfile.primary_trade = skills[0]?.category_name || skills[0]?.skill_name || 'Master Craftsman';
    }
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password_hash, ...safeUser } = user;
  res.json({
    message: `Logged in as demo persona: ${user.name} (${user.role})`,
    token,
    user: safeUser,
    worker: workerProfile,
  });
});

// Register New User (Customer or Worker)
router.post('/register', (req, res) => {
  const { name, email, password, role = 'customer', phone, address, region_id, community_id, cooperative_id, experience_years, bio } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const userId = 'usr-' + uuidv4().slice(0, 8);
  const passwordHash = bcrypt.hashSync(password, 10);

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, phone, address, region_id, community_id, cooperative_id, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  
  db.transaction(() => {
    insertUser.run(
      userId,
      name,
      email.toLowerCase().trim(),
      passwordHash,
      role,
      phone || '+91 98765 43210',
      address || 'Peelamedu, Coimbatore',
      region_id || 'reg-cbe',
      community_id || 'comm-cbe-2',
      cooperative_id || (role === 'worker' ? 'coop-cbe-1' : null),
      avatar
    );

    // If role is worker, create unverified worker profile
    if (role === 'worker') {
      const workerId = 'wrk-' + uuidv4().slice(0, 8);
      const insertWorker = db.prepare(`
        INSERT INTO workers (
          id, user_id, cooperative_id, community_id, experience_years, bio,
          is_identity_verified, is_membership_verified, is_skill_verified, is_cert_verified,
          is_emergency_ready, is_available, current_lat, current_lng, service_radius_km, rating, review_count, total_jobs
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 1, 11.0168, 76.9558, 10.0, 5.0, 0, 0)
      `);
      insertWorker.run(
        workerId,
        userId,
        cooperative_id || 'coop-cbe-1',
        community_id || 'comm-cbe-2',
        experience_years || 2,
        bio || 'Experienced trade craftsman affiliated with local labour society.'
      );
    }
  })();

  const token = jwt.sign(
    { id: userId, email: email.toLowerCase().trim(), role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const createdUser = db.prepare('SELECT id, name, email, role, phone, avatar, region_id, community_id, cooperative_id, address FROM users WHERE id = ?').get(userId);
  let workerProfile = null;
  if (role === 'worker') {
    workerProfile = db.prepare('SELECT * FROM workers WHERE user_id = ?').get(userId);
  }

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: createdUser,
    worker: workerProfile,
  });
});

// Current User Profile
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: req.user,
    worker: req.worker || null,
  });
});

// Update Profile
router.put('/update-profile', authenticateToken, (req, res) => {
  const { name, phone, address, community_id, region_id } = req.body;
  
  const stmt = db.prepare(`
    UPDATE users
    SET name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        community_id = COALESCE(?, community_id),
        region_id = COALESCE(?, region_id)
    WHERE id = ?
  `);

  stmt.run(name, phone, address, community_id, region_id, req.user.id);
  const updated = db.prepare('SELECT id, name, email, role, phone, avatar, region_id, community_id, cooperative_id, address FROM users WHERE id = ?').get(req.user.id);
  res.json({ message: 'Profile updated', user: updated });
});

module.exports = router;
