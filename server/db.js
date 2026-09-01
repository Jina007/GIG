const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for fast concurrency
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

function initSchema() {
  db.exec(`
    -- Federations Table
    CREATE TABLE IF NOT EXISTS federations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      state TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      contact_email TEXT,
      contact_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Regions / Districts Table
    CREATE TABLE IF NOT EXISTS regions (
      id TEXT PRIMARY KEY,
      federation_id TEXT REFERENCES federations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      state TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL
    );

    -- Cooperatives Table
    CREATE TABLE IF NOT EXISTS cooperatives (
      id TEXT PRIMARY KEY,
      federation_id TEXT REFERENCES federations(id) ON DELETE CASCADE,
      region_id TEXT REFERENCES regions(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      registration_no TEXT UNIQUE NOT NULL,
      address TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      service_radius_km REAL DEFAULT 15.0,
      phone TEXT,
      email TEXT,
      established_year INTEGER,
      bank_account_masked TEXT,
      status TEXT DEFAULT 'ACTIVE', -- ACTIVE, PENDING_REVIEW, SUSPENDED
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Communities Table
    CREATE TABLE IF NOT EXISTS communities (
      id TEXT PRIMARY KEY,
      region_id TEXT REFERENCES regions(id) ON DELETE CASCADE,
      cooperative_id TEXT REFERENCES cooperatives(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      postal_code TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      radius_km REAL DEFAULT 5.0
    );

    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('customer', 'worker', 'cooperative_admin', 'federation_admin')),
      phone TEXT,
      avatar TEXT,
      region_id TEXT REFERENCES regions(id) ON DELETE SET NULL,
      community_id TEXT REFERENCES communities(id) ON DELETE SET NULL,
      cooperative_id TEXT REFERENCES cooperatives(id) ON DELETE SET NULL,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Service Categories Table
    CREATE TABLE IF NOT EXISTS service_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT NOT NULL,
      description TEXT,
      base_price REAL DEFAULT 250,
      unit TEXT DEFAULT 'per service',
      is_emergency_supported INTEGER DEFAULT 0
    );

    -- Services Table
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      category_id TEXT REFERENCES service_categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      estimated_time TEXT DEFAULT '1-2 hours',
      base_price REAL NOT NULL,
      emergency_multiplier REAL DEFAULT 1.5
    );

    -- Workers Table
    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      cooperative_id TEXT REFERENCES cooperatives(id) ON DELETE CASCADE,
      community_id TEXT REFERENCES communities(id) ON DELETE SET NULL,
      experience_years INTEGER DEFAULT 3,
      bio TEXT,
      is_identity_verified INTEGER DEFAULT 0,
      is_membership_verified INTEGER DEFAULT 0,
      is_skill_verified INTEGER DEFAULT 0,
      is_cert_verified INTEGER DEFAULT 0,
      is_emergency_ready INTEGER DEFAULT 0,
      is_available INTEGER DEFAULT 1,
      current_lat REAL NOT NULL,
      current_lng REAL NOT NULL,
      service_radius_km REAL DEFAULT 10.0,
      rating REAL DEFAULT 4.8,
      review_count INTEGER DEFAULT 0,
      total_jobs INTEGER DEFAULT 0,
      repeat_customers_count INTEGER DEFAULT 0,
      active_workload INTEGER DEFAULT 0,
      verified_by TEXT REFERENCES users(id),
      verified_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Worker Skills Table
    CREATE TABLE IF NOT EXISTS worker_skills (
      id TEXT PRIMARY KEY,
      worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
      category_id TEXT REFERENCES service_categories(id) ON DELETE CASCADE,
      skill_name TEXT NOT NULL,
      proficiency_level TEXT DEFAULT 'EXPERT', -- APPRENTICE, JOURNEYMAN, EXPERT, MASTER
      is_verified INTEGER DEFAULT 0,
      verified_date DATETIME
    );

    -- Certifications Table
    CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY,
      worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      issuing_body TEXT NOT NULL,
      issue_date TEXT,
      expiry_date TEXT,
      certificate_url TEXT,
      is_verified INTEGER DEFAULT 0
    );

    -- Bookings Table
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      booking_code TEXT UNIQUE NOT NULL,
      customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      worker_id TEXT REFERENCES workers(id) ON DELETE SET NULL,
      cooperative_id TEXT REFERENCES cooperatives(id) ON DELETE CASCADE,
      service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
      category_id TEXT REFERENCES service_categories(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'REQUESTED' CHECK(status IN ('REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED')),
      is_emergency INTEGER DEFAULT 0,
      problem_title TEXT NOT NULL,
      description TEXT,
      photos_json TEXT DEFAULT '[]',
      scheduled_at DATETIME NOT NULL,
      completed_at DATETIME,
      customer_lat REAL NOT NULL,
      customer_lng REAL NOT NULL,
      customer_address TEXT NOT NULL,
      customer_phone TEXT,
      total_amount REAL NOT NULL,
      platform_fee REAL DEFAULT 0,
      cooperative_fee REAL DEFAULT 0,
      worker_payout REAL DEFAULT 0,
      taxes REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'PENDING' CHECK(payment_status IN ('PENDING', 'PAID', 'REFUNDED')),
      payment_method TEXT DEFAULT 'UPI_SANDBOX',
      match_score REAL DEFAULT 95.0,
      match_factors_json TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Booking Status History
    CREATE TABLE IF NOT EXISTS booking_status_history (
      id TEXT PRIMARY KEY,
      booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      notes TEXT,
      changed_by_user_id TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Payments Table
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE,
      customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
      cooperative_id TEXT REFERENCES cooperatives(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      platform_fee REAL NOT NULL,
      cooperative_fee REAL NOT NULL,
      worker_payout REAL NOT NULL,
      taxes REAL NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_id TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'COMPLETED',
      invoice_no TEXT UNIQUE NOT NULL,
      paid_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Invoices Table
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_no TEXT UNIQUE NOT NULL,
      booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE,
      payment_id TEXT REFERENCES payments(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      customer_address TEXT,
      worker_name TEXT NOT NULL,
      worker_cooperative_name TEXT NOT NULL,
      service_name TEXT NOT NULL,
      base_amount REAL NOT NULL,
      platform_fee REAL NOT NULL,
      cooperative_fee REAL NOT NULL,
      taxes REAL NOT NULL,
      total_amount REAL NOT NULL,
      is_emergency INTEGER DEFAULT 0,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Reviews & Ratings Table
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE,
      customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
      rating REAL NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      punctuality_rating REAL DEFAULT 5,
      quality_rating REAL DEFAULT 5,
      behavior_rating REAL DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Favorite Workers Table
    CREATE TABLE IF NOT EXISTS favorite_workers (
      id TEXT PRIMARY KEY,
      customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(customer_id, worker_id)
    );

    -- Complaints & Dispute Resolution Table
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      ticket_no TEXT UNIQUE NOT NULL,
      booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
      customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      worker_id TEXT REFERENCES workers(id) ON DELETE SET NULL,
      cooperative_id TEXT REFERENCES cooperatives(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL, -- QUALITY, OVERCHARGING, DELAY, MISBEHAVIOR, NO_SHOW, OTHER
      evidence_photos_json TEXT DEFAULT '[]',
      status TEXT DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'ESCALATED', 'CLOSED')),
      priority TEXT DEFAULT 'MEDIUM' CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
      resolution_notes TEXT,
      resolved_by TEXT REFERENCES users(id),
      escalated_to_federation INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Welfare & Social Security Records
    CREATE TABLE IF NOT EXISTS welfare_records (
      id TEXT PRIMARY KEY,
      worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
      cooperative_id TEXT REFERENCES cooperatives(id) ON DELETE CASCADE,
      scheme_name TEXT NOT NULL,
      scheme_type TEXT NOT NULL, -- HEALTH_INSURANCE, ACCIDENT_COVER, PENSION_SCHEME, WELFARE_FUND, EDUCATION_GRANT
      policy_no TEXT,
      coverage_amount REAL,
      validity_date TEXT,
      status TEXT DEFAULT 'ACTIVE', -- ACTIVE, PENDING_RENEWAL, EXPIRED, CLAIMED
      benefits_disbursed REAL DEFAULT 0,
      documents_json TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Training Records Table
    CREATE TABLE IF NOT EXISTS training_records (
      id TEXT PRIMARY KEY,
      worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
      training_name TEXT NOT NULL,
      institution TEXT NOT NULL,
      completed_date TEXT NOT NULL,
      validity_date TEXT,
      status TEXT DEFAULT 'COMPLETED',
      certificate_no TEXT
    );

    -- AI Demand Forecasts Table
    CREATE TABLE IF NOT EXISTS demand_forecasts (
      id TEXT PRIMARY KEY,
      region_id TEXT REFERENCES regions(id) ON DELETE CASCADE,
      community_id TEXT REFERENCES communities(id) ON DELETE CASCADE,
      service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
      time_period TEXT NOT NULL, -- e.g. "2026-09", "Next 30 Days"
      predicted_requests INTEGER NOT NULL,
      historical_avg INTEGER NOT NULL,
      growth_rate_pct REAL NOT NULL,
      demand_level TEXT NOT NULL CHECK(demand_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      confidence_score REAL DEFAULT 0.92,
      weather_event TEXT,
      seasonal_factor TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- AI Workforce Recommendations Table
    CREATE TABLE IF NOT EXISTS workforce_recommendations (
      id TEXT PRIMARY KEY,
      federation_id TEXT REFERENCES federations(id) ON DELETE CASCADE,
      source_cooperative_id TEXT REFERENCES cooperatives(id) ON DELETE CASCADE,
      target_cooperative_id TEXT REFERENCES cooperatives(id) ON DELETE CASCADE,
      target_community_id TEXT REFERENCES communities(id) ON DELETE CASCADE,
      service_category_id TEXT REFERENCES service_categories(id) ON DELETE CASCADE,
      required_workers INTEGER NOT NULL,
      available_workers INTEGER NOT NULL,
      recommended_deployment_count INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'DEPLOYED')),
      approved_by TEXT REFERENCES users(id),
      approved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Announcements Table
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      cooperative_id TEXT REFERENCES cooperatives(id) ON DELETE CASCADE,
      federation_id TEXT REFERENCES federations(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      target_audience TEXT DEFAULT 'ALL' CHECK(target_audience IN ('ALL', 'WORKERS', 'CUSTOMERS', 'ADMINS')),
      priority TEXT DEFAULT 'NORMAL' CHECK(priority IN ('NORMAL', 'HIGH', 'URGENT')),
      author_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Notifications Table
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'INFO', -- BOOKING, EMERGENCY, PAYMENT, COMPLAINT, WELFARE, ANNOUNCEMENT
      is_read INTEGER DEFAULT 0,
      action_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indices for high performance queries
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_workers_user_id ON workers(user_id);
    CREATE INDEX IF NOT EXISTS idx_workers_coop ON workers(cooperative_id);
    CREATE INDEX IF NOT EXISTS idx_workers_available ON workers(is_available, is_emergency_ready);
    CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_worker ON bookings(worker_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_coop ON bookings(cooperative_id);
    CREATE INDEX IF NOT EXISTS idx_complaints_coop ON complaints(cooperative_id);
    CREATE INDEX IF NOT EXISTS idx_welfare_worker ON welfare_records(worker_id);
    CREATE INDEX IF NOT EXISTS idx_forecast_community ON demand_forecasts(community_id);
  `);

  console.log('[DB] Database schema verified and initialized.');
}

initSchema();

module.exports = db;
