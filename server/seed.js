/**
 * Comprehensive Database Seeder
 * SIH26089: Cooperative Gig Services Platform
 * 
 * Generates realistic prototype data:
 * - 3 Regions (Coimbatore, Chennai, Madurai)
 * - 3 Labour Cooperatives
 * - 12 Communities
 * - 20+ Service Categories & Sub-services
 * - 5 Demo Key Personas (Priya, Ravi, Meena, Arumugam, Super Admin)
 * - 55+ Verified Cooperative Workers
 * - 105+ Customers
 * - 150+ Historical & Live Bookings with Payments & Reviews
 * - Welfare & Training Records
 * - AI Demand Forecasts & Workforce Recommendations
 */

const bcrypt = require('bcryptjs');
const db = require('./db');

console.log('[SEED] Starting realistic seed process for SIH26089...');

// Clean existing data
db.exec(`
  PRAGMA foreign_keys = OFF;
  DELETE FROM notifications;
  DELETE FROM announcements;
  DELETE FROM workforce_recommendations;
  DELETE FROM demand_forecasts;
  DELETE FROM training_records;
  DELETE FROM welfare_records;
  DELETE FROM complaints;
  DELETE FROM favorite_workers;
  DELETE FROM reviews;
  DELETE FROM invoices;
  DELETE FROM payments;
  DELETE FROM booking_status_history;
  DELETE FROM bookings;
  DELETE FROM certifications;
  DELETE FROM worker_skills;
  DELETE FROM workers;
  DELETE FROM services;
  DELETE FROM service_categories;
  DELETE FROM users;
  DELETE FROM communities;
  DELETE FROM cooperatives;
  DELETE FROM regions;
  DELETE FROM federations;
  PRAGMA foreign_keys = ON;
`);

// 1. Federations
db.prepare(`
  INSERT INTO federations (id, name, state, code, contact_email, contact_phone)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  'fed-tn-1',
  'Tamil Nadu State Labour Cooperatives Federation (TNSLCF)',
  'Tamil Nadu',
  'TN-FED-001',
  'contact@tnlabourcoops.gov.in',
  '+91 44 2859 1000'
);

// 2. Regions
const regions = [
  { id: 'reg-cbe', name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  { id: 'reg-chn', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { id: 'reg-mdu', name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
];

const insertRegion = db.prepare('INSERT INTO regions (id, federation_id, name, state, lat, lng) VALUES (?, ?, ?, ?, ?, ?)');
regions.forEach(r => insertRegion.run(r.id, 'fed-tn-1', r.name, r.state, r.lat, r.lng));

// 3. Cooperatives
const cooperatives = [
  {
    id: 'coop-cbe-1',
    region_id: 'reg-cbe',
    name: 'Coimbatore Labour Cooperative Society Ltd.',
    registration_no: 'TN-CBE-LCS-1994',
    address: '42, Mill Road, Crosscut Corner, Gandhipuram, Coimbatore - 641012',
    lat: 11.0183,
    lng: 76.9632,
    service_radius_km: 18.0,
    phone: '+91 422 249 8811',
    email: 'contact@cbelabourcoop.org',
    established_year: 1994,
    bank_account_masked: 'SBI A/C **** 4892 (IFSC: SBIN0001234)',
    status: 'ACTIVE',
    description: 'Registered Labour Contract and Service Cooperative Society serving Coimbatore district with skilled, verified artisan workers.',
  },
  {
    id: 'coop-chn-1',
    region_id: 'reg-chn',
    name: 'Chennai Labour Service Cooperative Society Ltd.',
    registration_no: 'TN-CHN-LSC-1988',
    address: '18, Anna Salai, Guindy Industrial Estate, Chennai - 600032',
    lat: 13.0067,
    lng: 80.2023,
    service_radius_km: 25.0,
    phone: '+91 44 2235 4400',
    email: 'admin@chennailabourcoop.org',
    established_year: 1988,
    bank_account_masked: 'Indian Bank A/C **** 7731 (IFSC: IDIB000G012)',
    status: 'ACTIVE',
    description: 'Premier metropolitan cooperative society providing certified technicians, electricians, plumbers, and home care specialists across Chennai.',
  },
  {
    id: 'coop-mdu-1',
    region_id: 'reg-mdu',
    name: 'Madurai Labour Cooperative Society Ltd.',
    registration_no: 'TN-MDU-LCS-2002',
    address: '77, West Veli Street, Near Railway Junction, Madurai - 625001',
    lat: 9.9196,
    lng: 78.1139,
    service_radius_km: 15.0,
    phone: '+91 452 234 9922',
    email: 'service@madurailabourcoop.org',
    established_year: 2002,
    bank_account_masked: 'Canara Bank A/C **** 6109 (IFSC: CNRB0002100)',
    status: 'ACTIVE',
    description: 'Heritage temple city cooperative empowering traditional crafts, construction, and household maintenance workers with social security.',
  },
];

const insertCoop = db.prepare(`
  INSERT INTO cooperatives (
    id, federation_id, region_id, name, registration_no, address, lat, lng,
    service_radius_km, phone, email, established_year, bank_account_masked, status, description
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
cooperatives.forEach(c => {
  insertCoop.run(
    c.id, 'fed-tn-1', c.region_id, c.name, c.registration_no, c.address,
    c.lat, c.lng, c.service_radius_km, c.phone, c.email, c.established_year,
    c.bank_account_masked, c.status, c.description
  );
});

// 4. Communities
const communities = [
  // Coimbatore
  { id: 'comm-cbe-1', region_id: 'reg-cbe', cooperative_id: 'coop-cbe-1', name: 'RS Puram & Saibaba Colony', postal_code: '641002', lat: 11.0112, lng: 76.9458, radius_km: 4.5 },
  { id: 'comm-cbe-2', region_id: 'reg-cbe', cooperative_id: 'coop-cbe-1', name: 'Peelamedu & Hopes College', postal_code: '641004', lat: 11.0264, lng: 76.9984, radius_km: 5.0 },
  { id: 'comm-cbe-3', region_id: 'reg-cbe', cooperative_id: 'coop-cbe-1', name: 'Gandhipuram & Ram Nagar', postal_code: '641012', lat: 11.0176, lng: 76.9678, radius_km: 3.5 },
  { id: 'comm-cbe-4', region_id: 'reg-cbe', cooperative_id: 'coop-cbe-1', name: 'Singanallur & Ramanathapuram', postal_code: '641005', lat: 10.9995, lng: 77.0142, radius_km: 5.5 },
  { id: 'comm-cbe-5', region_id: 'reg-cbe', cooperative_id: 'coop-cbe-1', name: 'Saravanampatti & IT Corridor', postal_code: '641035', lat: 11.0797, lng: 76.9997, radius_km: 6.0 },

  // Chennai
  { id: 'comm-chn-1', region_id: 'reg-chn', cooperative_id: 'coop-chn-1', name: 'Anna Nagar & Kilpauk', postal_code: '600040', lat: 13.0850, lng: 80.2100, radius_km: 5.0 },
  { id: 'comm-chn-2', region_id: 'reg-chn', cooperative_id: 'coop-chn-1', name: 'T. Nagar & West Mambalam', postal_code: '600017', lat: 13.0418, lng: 80.2341, radius_km: 4.0 },
  { id: 'comm-chn-3', region_id: 'reg-chn', cooperative_id: 'coop-chn-1', name: 'Adyar, Besant Nagar & Thiruvanmiyur', postal_code: '600020', lat: 13.0012, lng: 80.2565, radius_km: 5.5 },
  { id: 'comm-chn-4', region_id: 'reg-chn', cooperative_id: 'coop-chn-1', name: 'Velachery & OMR IT Belt', postal_code: '600042', lat: 12.9815, lng: 80.2180, radius_km: 6.5 },

  // Madurai
  { id: 'comm-mdu-1', region_id: 'reg-mdu', cooperative_id: 'coop-mdu-1', name: 'KK Nagar & Anna Nagar', postal_code: '625020', lat: 9.9288, lng: 78.1488, radius_km: 4.5 },
  { id: 'comm-mdu-2', region_id: 'reg-mdu', cooperative_id: 'coop-mdu-1', name: 'Goripalayam & Tallakulam', postal_code: '625002', lat: 9.9360, lng: 78.1320, radius_km: 4.0 },
  { id: 'comm-mdu-3', region_id: 'reg-mdu', cooperative_id: 'coop-mdu-1', name: 'Simmakkal & Meenakshi Amman Temple Zone', postal_code: '625001', lat: 9.9210, lng: 78.1180, radius_km: 3.5 },
];

const insertComm = db.prepare('INSERT INTO communities (id, region_id, cooperative_id, name, postal_code, lat, lng, radius_km) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
communities.forEach(c => insertComm.run(c.id, c.region_id, c.cooperative_id, c.name, c.postal_code, c.lat, c.lng, c.radius_km));

// 5. Service Categories
const serviceCategories = [
  { id: 'cat-plumbing', name: 'Plumbing', slug: 'plumbing', icon: 'Droplets', description: 'Leak fixes, pipe installations, tap repairs, sanitary fittings, tank cleaning', base_price: 350, unit: 'per service', is_emergency_supported: 1 },
  { id: 'cat-electrical', name: 'Electrical', slug: 'electrical', icon: 'Zap', description: 'Short circuit repairs, switchboards, fan & light installation, MCB trip troubleshooting', base_price: 300, unit: 'per service', is_emergency_supported: 1 },
  { id: 'cat-carpentry', name: 'Carpentry', slug: 'carpentry', icon: 'Hammer', description: 'Furniture repair, door locks, modular kitchen fixes, custom woodwork', base_price: 450, unit: 'per service', is_emergency_supported: 1 },
  { id: 'cat-painting', name: 'Painting', slug: 'painting', icon: 'Paintbrush', description: 'Interior/exterior wall painting, waterproof coating, touch-up painting', base_price: 800, unit: 'per room', is_emergency_supported: 0 },
  { id: 'cat-cleaning', name: 'Deep Cleaning', slug: 'cleaning', icon: 'Sparkles', description: 'Full house deep cleaning, bathroom sanitization, kitchen chimney degreasing', base_price: 750, unit: 'per service', is_emergency_supported: 0 },
  { id: 'cat-domestic-help', name: 'Domestic Help', slug: 'domestic-help', icon: 'Home', description: 'Daily household assistance, cooking support, vessel washing, floor mopping', base_price: 400, unit: 'per day', is_emergency_supported: 0 },
  { id: 'cat-elder-care', name: 'Elder Care', slug: 'elder-care', icon: 'HeartHandshake', description: 'Compassionate assistance for seniors, medication reminders, mobility support', base_price: 600, unit: 'per shift', is_emergency_supported: 1 },
  { id: 'cat-child-care', name: 'Child Care', slug: 'child-care', icon: 'Baby', description: 'Verified babysitting and attentive child supervision by certified caregivers', base_price: 500, unit: 'per shift', is_emergency_supported: 0 },
  { id: 'cat-driving', name: 'Driver on Demand', slug: 'driving', icon: 'Car', description: 'Professional city and outstation driving assistance with verified commercial license', base_price: 500, unit: 'per trip', is_emergency_supported: 1 },
  { id: 'cat-gardening', name: 'Gardening & Landscaping', slug: 'gardening', icon: 'Trees', description: 'Lawn trimming, organic pest control, plant potting, terrace garden maintenance', base_price: 400, unit: 'per visit', is_emergency_supported: 0 },
  { id: 'cat-appliance-repair', name: 'Appliance Repair', slug: 'appliance-repair', icon: 'Tv', description: 'Washing machine, refrigerator, microwave, water purifier servicing', base_price: 400, unit: 'per appliance', is_emergency_supported: 1 },
  { id: 'cat-ac-repair', name: 'AC Servicing & Gas Refill', slug: 'ac-repair', icon: 'Wind', description: 'Split/Window AC foam jet cleaning, gas charging, cooling coil repair', base_price: 650, unit: 'per unit', is_emergency_supported: 1 },
  { id: 'cat-technician', name: 'Technician Services', slug: 'technician', icon: 'Wrench', description: 'CCTV installation, WiFi router cabling, home theater setup, inverter wiring', base_price: 500, unit: 'per service', is_emergency_supported: 1 },
  { id: 'cat-community-cleaning', name: 'Community Sanitation & Drain Cleaning', slug: 'community-cleaning', icon: 'Trash2', description: 'Neighbourhood garbage clearance, storm drain declogging, community spraying', base_price: 1200, unit: 'per project', is_emergency_supported: 1 },
  { id: 'cat-community-maint', name: 'Community Facility Maintenance', slug: 'community-maintenance', icon: 'Building2', description: 'Apartment society motor maintenance, streetlight bulb replacement, gate repairs', base_price: 1500, unit: 'per society', is_emergency_supported: 1 },
  { id: 'cat-moving-loading', name: 'Moving & Loading Assistance', slug: 'moving-loading', icon: 'Truck', description: 'Heavy furniture shifting, tempo loading/unloading, packaging support', base_price: 850, unit: 'per team/hour', is_emergency_supported: 0 },
  { id: 'cat-masonry', name: 'Masonry & Tile Repair', slug: 'masonry', icon: 'Layers', description: 'Tile regrouting, wall crack plastering, bathroom waterproofing, step fixes', base_price: 600, unit: 'per day', is_emergency_supported: 0 },
  { id: 'cat-pest-control', name: 'Pest Control', slug: 'pest-control', icon: 'Bug', description: 'Eco-friendly termite treatment, cockroach herbal paste, mosquito fogging', base_price: 700, unit: 'per visit', is_emergency_supported: 0 },
  { id: 'cat-locksmith', name: 'Locksmith & Security', slug: 'locksmith', icon: 'KeyRound', description: 'Emergency lock opening, key making, biometric lock installation', base_price: 350, unit: 'per lock', is_emergency_supported: 1 },
  { id: 'cat-water-proofing', name: 'Waterproofing & Roof Sealing', slug: 'water-proofing', icon: 'ShieldAlert', description: 'Terrace leak prevention, chemical coating, rain drain sealing', base_price: 1100, unit: 'per 100 sqft', is_emergency_supported: 0 },
];

const insertCat = db.prepare(`
  INSERT INTO service_categories (id, name, slug, icon, description, base_price, unit, is_emergency_supported)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
serviceCategories.forEach(cat => {
  insertCat.run(cat.id, cat.name, cat.slug, cat.icon, cat.description, cat.base_price, cat.unit, cat.is_emergency_supported);
});

// 6. Sub-services
const subServices = [
  // Plumbing
  { id: 'srv-plumb-1', category_id: 'cat-plumbing', name: 'Tap & Mixer Leakage Repair', description: 'Fix dripping faucets, washers, spindle replacement, mixer valve restoration', estimated_time: '45 mins', base_price: 250, emergency_multiplier: 1.4 },
  { id: 'srv-plumb-2', category_id: 'cat-plumbing', name: 'Burst Pipe & Major Leak Emergency', description: 'Instant shutoff valve access, copper/PVC pipe brazing and replacement', estimated_time: '1-2 hours', base_price: 450, emergency_multiplier: 1.6 },
  { id: 'srv-plumb-3', category_id: 'cat-plumbing', name: 'Washbasin & Sink Drain Declogging', description: 'Chemical-free mechanical drain snake clearing and trap replacement', estimated_time: '1 hour', base_price: 350, emergency_multiplier: 1.4 },
  { id: 'srv-plumb-4', category_id: 'cat-plumbing', name: 'Water Tank Deep Cleaning & Disinfection', description: 'High pressure wash, sludge removal, UV/chemical sterilization', estimated_time: '2-3 hours', base_price: 850, emergency_multiplier: 1.2 },

  // Electrical
  { id: 'srv-elec-1', category_id: 'cat-electrical', name: 'Switchboard & Socket Repair', description: 'Repair burnt points, install modular switchboards, fix sparking contacts', estimated_time: '45 mins', base_price: 200, emergency_multiplier: 1.5 },
  { id: 'srv-elec-2', category_id: 'cat-electrical', name: 'Ceiling Fan Installation & Repair', description: 'Fan assembling, downrod mounting, regulator capacitor replacement', estimated_time: '1 hour', base_price: 300, emergency_multiplier: 1.3 },
  { id: 'srv-elec-3', category_id: 'cat-electrical', name: 'MCB Trip & Short Circuit Emergency', description: 'Circuit breaker diagnosis, phase balancing, neutral fault rectification', estimated_time: '1-2 hours', base_price: 500, emergency_multiplier: 1.7 },
  { id: 'srv-elec-4', category_id: 'cat-electrical', name: 'Inverter & Battery Wiring Setup', description: 'Safe inverter connection, high-gauge cable crimping, earthing check', estimated_time: '2 hours', base_price: 600, emergency_multiplier: 1.4 },

  // Carpentry
  { id: 'srv-carp-1', category_id: 'cat-carpentry', name: 'Door Lock Repair & Installation', description: 'Mortise lock, cylindrical lock fitting, latch realignment, deadbolt fixes', estimated_time: '1 hour', base_price: 350, emergency_multiplier: 1.5 },
  { id: 'srv-carp-2', category_id: 'cat-carpentry', name: 'Furniture Assembly & Hinge Repair', description: 'Wardrobe hydraulic hinges, drawer sliders, dining chair tightening', estimated_time: '1-2 hours', base_price: 450, emergency_multiplier: 1.2 },
  { id: 'srv-carp-3', category_id: 'cat-carpentry', name: 'Window Mesh & Door Planing', description: 'Mosquito mesh replacement, door bottom trimming for easy sliding', estimated_time: '1.5 hours', base_price: 400, emergency_multiplier: 1.2 },

  // Cleaning
  { id: 'srv-clean-1', category_id: 'cat-cleaning', name: 'Complete Bathroom Deep Sanitization', description: 'Tile acid scrubbing, chrome polishing, germicidal steam sanitization', estimated_time: '2 hours', base_price: 550, emergency_multiplier: 1.2 },
  { id: 'srv-clean-2', category_id: 'cat-cleaning', name: 'Full House Deep Cleaning (2 BHK)', description: 'Floor single-disc buffing, window pane wiping, cobweb & balcony wash', estimated_time: '4-5 hours', base_price: 1800, emergency_multiplier: 1.2 },
  { id: 'srv-clean-3', category_id: 'cat-cleaning', name: 'Kitchen Exhaust & Chimney Degreasing', description: 'Heavy oil sludge removal, baffle filter cleaning, hood polish', estimated_time: '2 hours', base_price: 650, emergency_multiplier: 1.2 },

  // Elder Care
  { id: 'srv-elder-1', category_id: 'cat-elder-care', name: 'Urgent Elder Mobility & Companion Assistance', description: 'Hospital transit support, wheelchair assistance, certified elder companion', estimated_time: '4 hours', base_price: 600, emergency_multiplier: 1.5 },
  { id: 'srv-elder-2', category_id: 'cat-elder-care', name: 'Full Day Caregiver Shift (8 Hours)', description: 'Vitals monitoring, feeding assistance, bathing, medication schedule', estimated_time: '8 hours', base_price: 1100, emergency_multiplier: 1.3 },

  // AC & Appliance Repair
  { id: 'srv-ac-1', category_id: 'cat-ac-repair', name: 'AC Deep Foam Jet Cleaning', description: 'Indoor coil power wash, blower wheel cleaning, drain tray antibacterial rinse', estimated_time: '1.5 hours', base_price: 650, emergency_multiplier: 1.3 },
  { id: 'srv-ac-2', category_id: 'cat-ac-repair', name: 'AC Gas Leak Check & Top-up (R32/R410A)', description: 'Nitrogen pressure leak test, vacuuming, eco-friendly refrigerant charge', estimated_time: '2 hours', base_price: 1400, emergency_multiplier: 1.4 },

  // Community Services
  { id: 'srv-comm-1', category_id: 'cat-community-cleaning', name: 'Community Drainage Jetting & Desilting', description: 'Cooperative team with mechanical de-silting rods and disinfectant spray', estimated_time: '4 hours', base_price: 1600, emergency_multiplier: 1.6 },
  { id: 'srv-comm-2', category_id: 'cat-community-maint', name: 'Society Overhead Tank Pump Motor Repair', description: 'Capacitor, bearing and coil inspection for 3-phase submersible pump', estimated_time: '2-3 hours', base_price: 950, emergency_multiplier: 1.8 },
];

const insertSrv = db.prepare(`
  INSERT INTO services (id, category_id, name, description, estimated_time, base_price, emergency_multiplier)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
subServices.forEach(s => {
  insertSrv.run(s.id, s.category_id, s.name, s.description, s.estimated_time, s.base_price, s.emergency_multiplier);
});

// 7. Seed Key Demo Users & Personas
const defaultPasswordHash = bcrypt.hashSync('password123', 10);

const demoUsers = [
  // CUSTOMERS (Across Coimbatore, Chennai, Madurai)
  {
    id: 'usr-cust-priya',
    name: 'Priya Raman',
    email: 'priya@example.com',
    role: 'customer',
    phone: '+91 98421 77301',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-cbe',
    community_id: 'comm-cbe-2',
    cooperative_id: null,
    address: 'Flat 304, Green Palms Enclave, Avinashi Road, Peelamedu, Coimbatore - 641004',
  },
  {
    id: 'usr-cust-karthik',
    name: 'Karthik Sundar',
    email: 'karthik@example.com',
    role: 'customer',
    phone: '+91 98401 22334',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-chn',
    community_id: 'comm-chn-1',
    cooperative_id: null,
    address: '42, 2nd Avenue, Anna Nagar East, Chennai - 600040',
  },
  {
    id: 'usr-cust-deepa',
    name: 'Deepa Venkatesh',
    email: 'deepa@example.com',
    role: 'customer',
    phone: '+91 94440 55667',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-mdu',
    community_id: 'comm-mdu-1',
    cooperative_id: null,
    address: '15, Lake View Road, KK Nagar, Madurai - 625020',
  },
  {
    id: 'usr-cust-vikram',
    name: 'Vikram Chandran',
    email: 'vikram@example.com',
    role: 'customer',
    phone: '+91 98422 88990',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-cbe',
    community_id: 'comm-cbe-1',
    cooperative_id: null,
    address: '88, DB Road, RS Puram, Coimbatore - 641002',
  },

  // WORKERS (Across Key Trades: Plumbing, Electrical, Elder Care, Carpentry, Deep Cleaning)
  {
    id: 'usr-wrk-ravi',
    name: 'Ravi Kumar',
    email: 'ravi@example.com',
    role: 'worker',
    phone: '+91 97890 12345',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-cbe',
    community_id: 'comm-cbe-2',
    cooperative_id: 'coop-cbe-1',
    address: '14/2, VOC Nagar, Peelamedu, Coimbatore - 641004',
  },
  {
    id: 'usr-wrk-suresh',
    name: 'Suresh Babu',
    email: 'suresh@example.com',
    role: 'worker',
    phone: '+91 97891 23456',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-cbe',
    community_id: 'comm-cbe-3',
    cooperative_id: 'coop-cbe-1',
    address: '22, Crosscut Road, Gandhipuram, Coimbatore - 641012',
  },
  {
    id: 'usr-wrk-anitha',
    name: 'Anitha Mary',
    email: 'anitha@example.com',
    role: 'worker',
    phone: '+91 98402 34567',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-chn',
    community_id: 'comm-chn-1',
    cooperative_id: 'coop-chn-1',
    address: '5/12, 10th Main Road, Anna Nagar, Chennai - 600040',
  },
  {
    id: 'usr-wrk-murugan',
    name: 'Murugan K.',
    email: 'murugan@example.com',
    role: 'worker',
    phone: '+91 94431 45678',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-mdu',
    community_id: 'comm-mdu-1',
    cooperative_id: 'coop-mdu-1',
    address: '8, Melur Main Road, KK Nagar, Madurai - 625020',
  },
  {
    id: 'usr-wrk-lakshmi',
    name: 'Lakshmi Priya',
    email: 'lakshmi@example.com',
    role: 'worker',
    phone: '+91 97892 56789',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-cbe',
    community_id: 'comm-cbe-1',
    cooperative_id: 'coop-cbe-1',
    address: '33, Thiruvenkatasamy Road, RS Puram, Coimbatore - 641002',
  },

  // COOPERATIVE ADMINS (Managing independent district societies)
  {
    id: 'usr-admin-meena',
    name: 'Meena Sundaram',
    email: 'meena@example.com',
    role: 'cooperative_admin',
    phone: '+91 94432 88910',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-cbe',
    community_id: 'comm-cbe-3',
    cooperative_id: 'coop-cbe-1',
    address: 'Coimbatore Labour Cooperative Society HQ, Crosscut Corner, Gandhipuram, Coimbatore',
  },
  {
    id: 'usr-admin-senthil',
    name: 'Senthil Nathan',
    email: 'senthil@example.com',
    role: 'cooperative_admin',
    phone: '+91 98403 67890',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-chn',
    community_id: 'comm-chn-1',
    cooperative_id: 'coop-chn-1',
    address: 'Chennai Labour Service Cooperative HQ, Guindy Industrial Estate, Chennai',
  },
  {
    id: 'usr-admin-balaji',
    name: 'Balaji Krishnan',
    email: 'balaji@example.com',
    role: 'cooperative_admin',
    phone: '+91 94433 78901',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-mdu',
    community_id: 'comm-mdu-1',
    cooperative_id: 'coop-mdu-1',
    address: 'Madurai Labour Cooperative Society HQ, West Veli Street, Madurai',
  },

  // FEDERATION ADMINS (State Apex Directorate)
  {
    id: 'usr-fed-arumugam',
    name: 'Arumugam P.',
    email: 'arumugam@example.com',
    role: 'federation_admin',
    phone: '+91 98400 99881',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-chn',
    community_id: 'comm-chn-1',
    cooperative_id: 'coop-chn-1',
    address: 'State Labour Cooperative Bhavan, 5th Floor, Anna Salai, Chennai - 600002',
  },
  {
    id: 'usr-fed-kavitha',
    name: 'Kavitha Rajan',
    email: 'kavitha@example.com',
    role: 'federation_admin',
    phone: '+91 98404 89012',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    region_id: 'reg-chn',
    community_id: 'comm-chn-1',
    cooperative_id: 'coop-chn-1',
    address: 'State Labour Cooperative Welfare Directorate, Anna Salai, Chennai - 600002',
  },
];

const insertUser = db.prepare(`
  INSERT INTO users (id, name, email, password_hash, role, phone, avatar, region_id, community_id, cooperative_id, address)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
demoUsers.forEach(u => {
  insertUser.run(u.id, u.name, u.email, defaultPasswordHash, u.role, u.phone, u.avatar, u.region_id, u.community_id, u.cooperative_id, u.address);
});

// Seed Ravi Kumar's Worker Profile with exact prompt specs:
// 4.9 rating, Identity Verified, Cooperative Member, Skill Verified, Certificate Verified, 6 years exp, 342 jobs, 218 repeat customers
db.prepare(`
  INSERT INTO workers (
    id, user_id, cooperative_id, community_id, experience_years, bio,
    is_identity_verified, is_membership_verified, is_skill_verified, is_cert_verified,
    is_emergency_ready, is_available, current_lat, current_lng, service_radius_km,
    rating, review_count, total_jobs, repeat_customers_count, active_workload, verified_by, verified_at
  ) VALUES (
    'wrk-ravi-001', 'usr-wrk-ravi', 'coop-cbe-1', 'comm-cbe-2', 6,
    'Certified master plumber with 6 years experience in municipal water systems, copper/PVC piping, sanitary fittings, and emergency leak containment. Dedicated member of Coimbatore Labour Cooperative.',
    1, 1, 1, 1,
    1, 1, 11.0250, 76.9950, 10.0,
    4.9, 148, 342, 218, 0, 'usr-admin-meena', '2023-04-10 10:00:00'
  )
`).run();

// Add skills for Ravi
const insertSkill = db.prepare(`
  INSERT INTO worker_skills (id, worker_id, category_id, skill_name, proficiency_level, is_verified, verified_date)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertSkill.run('wsk-ravi-1', 'wrk-ravi-001', 'cat-plumbing', 'Master Pipe Fitting & Leakage Containment', 'MASTER', 1, '2023-04-10');
insertSkill.run('wsk-ravi-2', 'wrk-ravi-001', 'cat-plumbing', 'Sanitary Ware & Tap Overhaul', 'EXPERT', 1, '2023-04-10');
insertSkill.run('wsk-ravi-3', 'wrk-ravi-001', 'cat-plumbing', 'Overhead Tank Sump Pump Overhaul', 'EXPERT', 1, '2023-08-15');

// Add Certifications for Ravi
const insertCert = db.prepare(`
  INSERT INTO certifications (id, worker_id, title, issuing_body, issue_date, expiry_date, certificate_url, is_verified)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

insertCert.run('crt-ravi-1', 'wrk-ravi-001', 'National Trade Certificate (NTC) — Plumbing Technology', 'National Council for Vocational Training (NCVT)', '2019-07-20', '2029-07-20', 'https://example.com/certs/ravi-ntc.pdf', 1);
insertCert.run('crt-ravi-2', 'wrk-ravi-001', 'Cooperative Artisan Skill Badge Grade A', 'Tamil Nadu Labour Cooperative Federation', '2021-02-14', '2031-02-14', 'https://example.com/certs/ravi-coop.pdf', 1);
insertCert.run('crt-ravi-3', 'wrk-ravi-001', 'Emergency Water System First Responder Certificate', 'Disaster Management & Safety Council', '2023-09-01', '2026-09-01', 'https://example.com/certs/ravi-safety.pdf', 1);

// Add Welfare & Insurance Records for Ravi
const insertWelfare = db.prepare(`
  INSERT INTO welfare_records (id, worker_id, cooperative_id, scheme_name, scheme_type, policy_no, coverage_amount, validity_date, status, benefits_disbursed)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertWelfare.run('wlf-ravi-1', 'wrk-ravi-001', 'coop-cbe-1', 'Labour Cooperative Comprehensive Health & Hospitalization Cover', 'HEALTH_INSURANCE', 'POL-TN-CBE-99482', 300000, '2027-03-31', 'ACTIVE', 12500);
insertWelfare.run('wlf-ravi-2', 'wrk-ravi-001', 'coop-cbe-1', 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)', 'ACCIDENT_COVER', 'POL-PMSBY-48190', 200000, '2027-05-31', 'ACTIVE', 0);
insertWelfare.run('wlf-ravi-3', 'wrk-ravi-001', 'coop-cbe-1', 'Cooperative Welfare Fund — Tool Purchase & Maintenance Subsidy', 'WELFARE_FUND', 'CWF-TOOL-2024-11', 15000, '2026-12-31', 'ACTIVE', 8500);

// Add Training Records for Ravi
const insertTraining = db.prepare(`
  INSERT INTO training_records (id, worker_id, training_name, institution, completed_date, validity_date, status, certificate_no)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

insertTraining.run('trn-ravi-1', 'wrk-ravi-001', 'Advanced Modern CPVC & PEX Plumbing Systems', 'Tamil Nadu Skill Development Corporation (TNSDC)', '2023-05-18', '2028-05-18', 'COMPLETED', 'TNSDC-PLM-84920');
insertTraining.run('trn-ravi-2', 'wrk-ravi-001', 'Workplace Safety, Electrical Hazard & First Aid', 'National Safety Council of India', '2024-01-22', '2027-01-22', 'COMPLETED', 'NSC-SAF-33019');
// 7b. Seed Additional Named Craftsmen Profiles
// Suresh Babu (Electrician, Coimbatore)
db.prepare(`
  INSERT INTO workers (
    id, user_id, cooperative_id, community_id, experience_years, bio,
    is_identity_verified, is_membership_verified, is_skill_verified, is_cert_verified,
    is_emergency_ready, is_available, current_lat, current_lng, service_radius_km,
    rating, review_count, total_jobs, repeat_customers_count, active_workload, verified_by, verified_at
  ) VALUES (
    'wrk-suresh-001', 'usr-wrk-suresh', 'coop-cbe-1', 'comm-cbe-3', 7,
    'Certified master electrician specializing in 3-phase domestic wiring, MCB circuit breakers, inverters, and emergency short-circuit resolution.',
    1, 1, 1, 1, 1, 1, 11.0180, 76.9690, 12.0,
    4.8, 112, 280, 165, 0, 'usr-admin-meena', '2023-05-12 11:00:00'
  )
`).run();
insertSkill.run('wsk-suresh-1', 'wrk-suresh-001', 'cat-electrical', 'Master Electrical Wiring & Short Circuit Triage', 'MASTER', 1, '2023-05-12');
insertSkill.run('wsk-suresh-2', 'wrk-suresh-001', 'cat-electrical', 'Inverter & High-Capacity Battery Backup Setup', 'EXPERT', 1, '2023-05-12');
insertCert.run('crt-suresh-1', 'wrk-suresh-001', 'Electrical Wireman Competency Certificate (Class A)', 'Tamil Nadu Electrical Licensing Board', '2018-03-15', '2028-03-15', 'https://example.com/certs/suresh.pdf', 1);
insertWelfare.run('wlf-suresh-1', 'wrk-suresh-001', 'coop-cbe-1', 'Labour Cooperative Comprehensive Health Cover', 'HEALTH_INSURANCE', 'POL-TN-CBE-88120', 300000, '2027-03-31', 'ACTIVE', 5000);

// Anitha Mary (Elder Care Specialist, Chennai)
db.prepare(`
  INSERT INTO workers (
    id, user_id, cooperative_id, community_id, experience_years, bio,
    is_identity_verified, is_membership_verified, is_skill_verified, is_cert_verified,
    is_emergency_ready, is_available, current_lat, current_lng, service_radius_km,
    rating, review_count, total_jobs, repeat_customers_count, active_workload, verified_by, verified_at
  ) VALUES (
    'wrk-anitha-001', 'usr-wrk-anitha', 'coop-chn-1', 'comm-chn-1', 5,
    'Compassionate, certified geriatric companion and nurse assistant. Trained in patient mobility, post-operative support, and elder medication management.',
    1, 1, 1, 1, 1, 1, 13.0855, 80.2110, 15.0,
    4.95, 96, 195, 140, 0, 'usr-admin-senthil', '2023-06-18 10:00:00'
  )
`).run();
insertSkill.run('wsk-anitha-1', 'wrk-anitha-001', 'cat-elder-care', 'Geriatric Care & Mobility Assistance', 'MASTER', 1, '2023-06-18');
insertSkill.run('wsk-anitha-2', 'wrk-anitha-001', 'cat-elder-care', 'Emergency First Aid & CPR Protocol', 'EXPERT', 1, '2023-06-18');
insertCert.run('crt-anitha-1', 'wrk-anitha-001', 'General Duty Assistant & Healthcare Caregiver Certificate', 'Healthcare Sector Skill Council (HSSC)', '2020-11-10', '2030-11-10', 'https://example.com/certs/anitha.pdf', 1);
insertWelfare.run('wlf-anitha-1', 'wrk-anitha-001', 'coop-chn-1', 'Chennai Labour Cooperative Medical Shield', 'HEALTH_INSURANCE', 'POL-TN-CHN-55410', 300000, '2027-03-31', 'ACTIVE', 2000);

// Murugan K. (Carpenter & Locksmith, Madurai)
db.prepare(`
  INSERT INTO workers (
    id, user_id, cooperative_id, community_id, experience_years, bio,
    is_identity_verified, is_membership_verified, is_skill_verified, is_cert_verified,
    is_emergency_ready, is_available, current_lat, current_lng, service_radius_km,
    rating, review_count, total_jobs, repeat_customers_count, active_workload, verified_by, verified_at
  ) VALUES (
    'wrk-murugan-001', 'usr-wrk-murugan', 'coop-mdu-1', 'comm-mdu-1', 8,
    'Experienced woodcraft artisan and security locksmith. Specializes in antique door restoration, modular kitchen hinges, and emergency lockout services.',
    1, 1, 1, 1, 1, 1, 9.9290, 78.1490, 15.0,
    4.85, 105, 210, 130, 0, 'usr-admin-balaji', '2023-03-05 09:30:00'
  )
`).run();
insertSkill.run('wsk-murugan-1', 'wrk-murugan-001', 'cat-carpentry', 'Custom Woodwork & Modular Furniture Assembly', 'MASTER', 1, '2023-03-05');
insertSkill.run('wsk-murugan-2', 'wrk-murugan-001', 'cat-locksmith', 'Emergency Lock Picking & Biometric Deadbolt Installation', 'EXPERT', 1, '2023-03-05');
insertCert.run('crt-murugan-1', 'wrk-murugan-001', 'Traditional & Modern Carpentry Skill Award', 'Tamil Nadu Handicrafts & Labour Board', '2017-08-20', '2027-08-20', 'https://example.com/certs/murugan.pdf', 1);
insertWelfare.run('wlf-murugan-1', 'wrk-murugan-001', 'coop-mdu-1', 'Madurai Cooperative Artisan Safety Shield', 'HEALTH_INSURANCE', 'POL-TN-MDU-11094', 300000, '2027-03-31', 'ACTIVE', 0);

// Lakshmi Priya (Deep Cleaning Specialist, Coimbatore)
db.prepare(`
  INSERT INTO workers (
    id, user_id, cooperative_id, community_id, experience_years, bio,
    is_identity_verified, is_membership_verified, is_skill_verified, is_cert_verified,
    is_emergency_ready, is_available, current_lat, current_lng, service_radius_km,
    rating, review_count, total_jobs, repeat_customers_count, active_workload, verified_by, verified_at
  ) VALUES (
    'wrk-lakshmi-001', 'usr-wrk-lakshmi', 'coop-cbe-1', 'comm-cbe-1', 6,
    'Eco-friendly deep sanitization expert. Specialized in residential deep cleaning, industrial steam cleaning, kitchen chimney degreasing, and post-tenancy restoration.',
    1, 1, 1, 1, 0, 1, 11.0110, 76.9460, 10.0,
    4.9, 130, 310, 190, 0, 'usr-admin-meena', '2023-07-14 14:00:00'
  )
`).run();
insertSkill.run('wsk-lakshmi-1', 'wrk-lakshmi-001', 'cat-cleaning', 'Residential Deep Cleaning & Steam Sanitization', 'MASTER', 1, '2023-07-14');
insertSkill.run('wsk-lakshmi-2', 'wrk-lakshmi-001', 'cat-cleaning', 'Commercial Kitchen & Chimney Degreasing', 'EXPERT', 1, '2023-07-14');
insertCert.run('crt-lakshmi-1', 'wrk-lakshmi-001', 'Sanitation & Hygiene Safety Protocols', 'National Skill Development Corporation (NSDC)', '2021-09-12', '2031-09-12', 'https://example.com/certs/lakshmi.pdf', 1);
insertWelfare.run('wlf-lakshmi-1', 'wrk-lakshmi-001', 'coop-cbe-1', 'Labour Cooperative Comprehensive Health Cover', 'HEALTH_INSURANCE', 'POL-TN-CBE-77319', 300000, '2027-03-31', 'ACTIVE', 4500);

// 8. Generate 55+ Verified Cooperative Workers Across 3 Regions
const indianNames = [
  'Murugan S', 'Karthik Raja', 'Selvakumar M', 'Anand Babu', 'Gopalakrishnan V',
  'Saravanan T', 'Muthuvel K', 'Dinesh Kumar', 'Suresh Balan', 'Vigneshwaran P',
  'Manikandan R', 'Prakash Natarajan', 'Velayudham G', 'Kannan Dharmar', 'Balaji Subramanian',
  'Deepak Raj', 'Ganesan Perumal', 'Sundaramurthy K', 'Chandrasekar V', 'Loganathan P',
  'Vijay Anand', 'Senthamil Selvan', 'Balamurugan E', 'Senthilkumar R', 'Thirunavukkarasu M',
  'Kavitha Sundar', 'Lakshmi Narayanan', 'Revathi Muthu', 'Shanthi Murugesan', 'Bhuvaneshwari K',
  'Radhakrishnan T', 'Nagarajan S', 'Vasanth Kumar', 'Subash Chandran', 'Naveen Kumar',
  'Arun Prasad', 'Hariharan R', 'Sivakumar M', 'Mohanraj K', 'Jeyachandran S',
  'Kabilan V', 'Marimuthu A', 'Nithyanandam S', 'Durairaj T', 'Palaniammal K',
  'Sasikumar R', 'Govindaraj M', 'Pandiarajan K', 'Senthil Nathan', 'Udhayakumar V',
  'Velmurugan C', 'Chidambaram K', 'Madhavan S', 'Ayyappan V', 'Rajesh Kanna'
];

const categoryKeys = [
  'cat-plumbing', 'cat-electrical', 'cat-carpentry', 'cat-painting', 'cat-cleaning',
  'cat-domestic-help', 'cat-elder-care', 'cat-child-care', 'cat-driving', 'cat-gardening',
  'cat-appliance-repair', 'cat-ac-repair', 'cat-technician', 'cat-community-cleaning',
  'cat-community-maint', 'cat-moving-loading', 'cat-masonry', 'cat-pest-control', 'cat-locksmith'
];

const generatedWorkers = [];

for (let i = 0; i < indianNames.length; i++) {
  const name = indianNames[i];
  const uId = `usr-gen-wrk-${i + 1}`;
  const wId = `wrk-gen-${i + 1}`;
  const email = `worker.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@cooplabour.org`;
  const phone = `+91 ${94000 + Math.floor(Math.random() * 5999)} ${10000 + Math.floor(Math.random() * 89999)}`;
  const avatar = `https://images.unsplash.com/photo-${1500000000000 + (i * 1234567) % 90000000}?w=150&auto=format&fit=crop&q=80`;

  // Distribute across 3 cooperatives
  let coopId = 'coop-cbe-1';
  let commId = communities[i % 5].id;
  let baseLat = 11.0168 + (Math.sin(i * 1.5) * 0.04);
  let baseLng = 76.9558 + (Math.cos(i * 1.5) * 0.04);

  if (i >= 25 && i < 42) {
    coopId = 'coop-chn-1';
    commId = communities[5 + (i % 4)].id;
    baseLat = 13.0827 + (Math.sin(i * 1.5) * 0.05);
    baseLng = 80.2707 + (Math.cos(i * 1.5) * 0.05);
  } else if (i >= 42) {
    coopId = 'coop-mdu-1';
    commId = communities[9 + (i % 3)].id;
    baseLat = 9.9252 + (Math.sin(i * 1.5) * 0.03);
    baseLng = 78.1198 + (Math.cos(i * 1.5) * 0.03);
  }

  const primaryCat = categoryKeys[i % categoryKeys.length];
  const expYears = 2 + (i % 12);
  const rating = Number((4.5 + (i % 6) * 0.1).toFixed(1));
  const jobsDone = 40 + (i * 7);
  const repeatCust = Math.floor(jobsDone * 0.45);
  const isEmergencyReady = i % 3 === 0 ? 1 : 0;
  const isAvailable = i % 7 === 0 ? 0 : 1; // Most are available

  // Insert user record
  insertUser.run(
    uId,
    name,
    email,
    defaultPasswordHash,
    'worker',
    phone,
    avatar,
    coopId === 'coop-cbe-1' ? 'reg-cbe' : (coopId === 'coop-chn-1' ? 'reg-chn' : 'reg-mdu'),
    commId,
    coopId,
    `Cooperative Quarter Block ${i + 1}, ${communities.find(c => c.id === commId)?.name || 'Peelamedu'}`
  );

  // Insert worker profile
  db.prepare(`
    INSERT INTO workers (
      id, user_id, cooperative_id, community_id, experience_years, bio,
      is_identity_verified, is_membership_verified, is_skill_verified, is_cert_verified,
      is_emergency_ready, is_available, current_lat, current_lng, service_radius_km,
      rating, review_count, total_jobs, repeat_customers_count, active_workload, verified_by, verified_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      1, 1, 1, 1,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, 'usr-admin-meena', '2023-08-20'
    )
  `).run(
    wId, uId, coopId, commId, expYears,
    `Skilled ${primaryCat.replace('cat-', '')} craftsman verified and managed under ${coopId === 'coop-cbe-1' ? 'Coimbatore Labour Cooperative' : (coopId === 'coop-chn-1' ? 'Chennai Labour Cooperative' : 'Madurai Labour Cooperative')}.`,
    isEmergencyReady, isAvailable, Number(baseLat.toFixed(4)), Number(baseLng.toFixed(4)), 12.0,
    rating, Math.floor(jobsDone * 0.6), jobsDone, repeatCust, 0
  );

  // Insert primary skill
  insertSkill.run(
    `wsk-gen-${i + 1}-1`,
    wId,
    primaryCat,
    `Certified ${primaryCat.replace('cat-', '').toUpperCase()} Specialist`,
    expYears >= 7 ? 'MASTER' : 'EXPERT',
    1,
    '2023-08-20'
  );

  // Insert certifications
  insertCert.run(
    `crt-gen-${i + 1}`,
    wId,
    `Govt Skill Certification — ${primaryCat.replace('cat-', '').toUpperCase()}`,
    'National Skill Development Corporation (NSDC)',
    '2021-04-10',
    '2031-04-10',
    `https://example.com/certs/${wId}.pdf`,
    1
  );

  // Insert welfare record
  insertWelfare.run(
    `wlf-gen-${i + 1}`,
    wId,
    coopId,
    'Tamil Nadu Construction & Gig Workers Welfare Board Fund',
    'HEALTH_INSURANCE',
    `POL-WLF-${20000 + i}`,
    250000,
    '2027-12-31',
    'ACTIVE',
    i % 4 === 0 ? 5000 : 0
  );

  generatedWorkers.push({ id: wId, user_id: uId, name, coopId, primaryCat, rating });
}

// 9. Generate 105+ Customer Users
const customerFirstNames = ['Ananya', 'Rajesh', 'Deepa', 'Venkatesh', 'Sandhya', 'Kishore', 'Nandini', 'Gowtham', 'Divya', 'Senthil', 'Madhavi', 'Aravind', 'Sneha', 'Naveen', 'Pavithra', 'Manojkumar', 'Soundarya', 'Ashok', 'Gayathri', 'Karthikeyan', 'Harini', 'Ramesh', 'Swetha', 'Vijay', 'Shalini'];
const customerLastNames = ['Iyer', 'Chettiar', 'Gounder', 'Mudaliar', 'Nadar', 'Pillai', 'Rao', 'Sharma', 'Varma', 'Reddy', 'Patel', 'Menon', 'Nair', 'Naidu', 'Sundaram'];

const generatedCustomers = [];

for (let i = 0; i < 105; i++) {
  const firstName = customerFirstNames[i % customerFirstNames.length];
  const lastName = customerLastNames[i % customerLastNames.length];
  const custName = `${firstName} ${lastName}`;
  const uId = `usr-gen-cust-${i + 1}`;
  const email = `customer${i + 1}.${firstName.toLowerCase()}@example.com`;
  const phone = `+91 ${98000 + Math.floor(Math.random() * 1999)} ${10000 + Math.floor(Math.random() * 89999)}`;
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(custName)}`;

  const commObj = communities[i % communities.length];

  insertUser.run(
    uId,
    custName,
    email,
    defaultPasswordHash,
    'customer',
    phone,
    avatar,
    commObj.region_id,
    commObj.id,
    null,
    `Door ${12 + (i % 80)}, Sector ${(i % 9) + 1}, ${commObj.name}, Pincode: ${commObj.postal_code}`
  );

  generatedCustomers.push({ id: uId, name: custName, phone, address: `${commObj.name}`, commId: commObj.id, regionId: commObj.region_id });
}

// 10. Generate 120+ Realistic Historical & Live Bookings with Status, Payments, and Reviews
console.log('[SEED] Seeding historical bookings, payments, and reviews...');

const bookingStatuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'ACCEPTED', 'ON_THE_WAY', 'REQUESTED'];
const sampleProblems = [
  { title: 'Emergency Master Bathroom Water Pipe Burst', isEmg: 1, srvId: 'srv-plumb-2', catId: 'cat-plumbing' },
  { title: 'Kitchen Sink Tap Dripping Continuously', isEmg: 0, srvId: 'srv-plumb-1', catId: 'cat-plumbing' },
  { title: 'Main MCB Tripping on Geyser Load', isEmg: 1, srvId: 'srv-elec-3', catId: 'cat-electrical' },
  { title: 'Ceiling Fan Making Squeaking Noise & Wobbling', isEmg: 0, srvId: 'srv-elec-2', catId: 'cat-electrical' },
  { title: 'Main Entrance Door Mortise Lock Jammed', isEmg: 1, srvId: 'srv-carp-1', catId: 'cat-carpentry' },
  { title: 'Split AC Water Leaking on Living Room Wall', isEmg: 0, srvId: 'srv-ac-1', catId: 'cat-ac-repair' },
  { title: 'Pre-Festival Complete 2BHK Deep Cleaning', isEmg: 0, srvId: 'srv-clean-2', catId: 'cat-cleaning' },
  { title: 'Urgent Wheelchair Mobility Companion for Hospital Visit', isEmg: 1, srvId: 'srv-elder-1', catId: 'cat-elder-care' },
  { title: 'Apartment Stormwater Drain Desilting Required', isEmg: 1, srvId: 'srv-comm-1', catId: 'cat-community-cleaning' },
  { title: 'Society Overhead Tank Pump Motor Failed to Start', isEmg: 1, srvId: 'srv-comm-2', catId: 'cat-community-maint' },
];

const sampleComments = [
  'Extremely polite and punctual! Fixed the pipe leakage within 30 minutes without any mess. Truly proud to support our local cooperative society.',
  'Excellent workmanship. He arrived in cooperative uniform with proper ID badge and verified tools. Great transparent pricing.',
  'Very professional electrician. Diagnosed the short circuit problem accurately and replaced the burnt MCB with genuine parts.',
  'Came in an emergency at 8 PM and resolved the lock issue immediately. Grateful for this reliable cooperative service platform.',
  'Top quality deep cleaning! The team was thorough, courteous, and very respectful. Will definitely rebook regularly.',
  'Wonderful elder care service. Very gentle, kind, and attentive with my elderly mother. High trust factor.',
];

const insertBooking = db.prepare(`
  INSERT INTO bookings (
    id, booking_code, customer_id, worker_id, cooperative_id, service_id, category_id,
    status, is_emergency, problem_title, description, photos_json, scheduled_at, completed_at,
    customer_lat, customer_lng, customer_address, customer_phone,
    total_amount, platform_fee, cooperative_fee, worker_payout, taxes,
    payment_status, payment_method, match_score, match_factors_json, created_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, '[]', ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?
  )
`);

const insertBookingPayment = db.prepare(`
  INSERT INTO payments (
    id, booking_id, customer_id, worker_id, cooperative_id,
    amount, platform_fee, cooperative_fee, worker_payout, taxes,
    payment_method, transaction_id, status, invoice_no, paid_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', ?, ?)
`);

const insertInvoice = db.prepare(`
  INSERT INTO invoices (
    id, invoice_no, booking_id, payment_id,
    customer_name, customer_phone, customer_address,
    worker_name, worker_cooperative_name, service_name,
    base_amount, platform_fee, cooperative_fee, taxes, total_amount, is_emergency, issued_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertReview = db.prepare(`
  INSERT INTO reviews (
    id, booking_id, customer_id, worker_id, rating, comment,
    punctuality_rating, quality_rating, behavior_rating, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Create 120 bookings
for (let i = 0; i < 120; i++) {
  const bId = `bk-seed-${i + 1}`;
  const prob = sampleProblems[i % sampleProblems.length];
  const srv = subServices.find(s => s.id === prob.srvId) || subServices[0];
  const cust = i === 0 ? { id: 'usr-cust-priya', name: 'Priya Raman', phone: '+91 98421 77301', address: 'Peelamedu, Coimbatore' } : generatedCustomers[i % generatedCustomers.length];
  
  // Assign worker: for first few plumbing jobs, assign Ravi Kumar!
  let assignedWorker = (prob.catId === 'cat-plumbing' && i < 10) 
    ? { id: 'wrk-ravi-001', name: 'Ravi Kumar', coopId: 'coop-cbe-1' }
    : generatedWorkers[i % generatedWorkers.length];

  const status = i < 90 ? 'COMPLETED' : bookingStatuses[i % bookingStatuses.length];
  const isEmergency = prob.isEmg;
  const randNum = 1000 + i;
  const bookingCode = `SG-${isEmergency ? 'EMG' : 'REG'}-${randNum}`;

  let basePrice = srv.base_price;
  if (isEmergency) basePrice = Math.round(basePrice * srv.emergency_multiplier);

  const platformFee = Math.round(basePrice * 0.05);
  const coopFee = Math.round(basePrice * 0.07);
  const taxes = Math.round(basePrice * 0.03);
  const workerPayout = basePrice - platformFee - coopFee;
  const totalAmount = basePrice + taxes;

  const pastDate = new Date(Date.now() - (120 - i) * 18 * 60 * 60 * 1000).toISOString();
  const completedDate = status === 'COMPLETED' ? new Date(new Date(pastDate).getTime() + 2 * 60 * 60 * 1000).toISOString() : null;

  const matchFactors = [
    'Exact skill match verified by Labour Cooperative',
    '1.8 km away (Est. 6-10 mins response)',
    'Available for instant dispatch',
    '4.9 rating with verified badges',
    'Low active workload',
  ];

  insertBooking.run(
    bId,
    bookingCode,
    cust.id,
    assignedWorker.id,
    assignedWorker.coopId || 'coop-cbe-1',
    srv.id,
    prob.catId,
    status,
    isEmergency,
    prob.title,
    `Service requirement at ${cust.address}. Urgent assistance requested.`,
    pastDate,
    completedDate,
    11.0264,
    76.9984,
    cust.address,
    cust.phone,
    totalAmount,
    platformFee,
    coopFee,
    workerPayout,
    taxes,
    status === 'COMPLETED' ? 'PAID' : 'PENDING',
    'UPI_SANDBOX',
    96.5,
    JSON.stringify(matchFactors),
    pastDate
  );

  // If completed, add Payment, Invoice, Review
  if (status === 'COMPLETED') {
    const payId = `pay-seed-${i + 1}`;
    const invoiceNo = `INV-2026-${10000 + i}`;
    const txnId = `TXN-UPI-${(100000 + i * 37).toString(36).toUpperCase()}`;

    insertBookingPayment.run(
      payId, bId, cust.id, assignedWorker.id, assignedWorker.coopId || 'coop-cbe-1',
      totalAmount, platformFee, coopFee, workerPayout, taxes,
      'UPI_SANDBOX', txnId, invoiceNo, completedDate
    );

    insertInvoice.run(
      `inv-seed-${i + 1}`,
      invoiceNo,
      bId,
      payId,
      cust.name,
      cust.phone,
      cust.address,
      assignedWorker.name,
      assignedWorker.coopId === 'coop-chn-1' ? 'Chennai Labour Service Cooperative' : 'Coimbatore Labour Cooperative Society',
      srv.name,
      basePrice,
      platformFee,
      coopFee,
      taxes,
      totalAmount,
      isEmergency,
      completedDate
    );

    // Insert Review
    if (i % 2 === 0) {
      insertReview.run(
        `rev-seed-${i + 1}`,
        bId,
        cust.id,
        assignedWorker.id,
        i % 5 === 0 ? 4.8 : 5.0,
        sampleComments[i % sampleComments.length],
        5, 5, 5,
        completedDate
      );
    }
  }
}

// 11. Add Favorite Workers for Priya Raman (Ravi Kumar)
db.prepare('INSERT OR IGNORE INTO favorite_workers (id, customer_id, worker_id) VALUES (?, ?, ?)').run(
  'fav-priya-ravi', 'usr-cust-priya', 'wrk-ravi-001'
);

// 12. Seed Complaints & Dispute Resolution Records
const complaintsData = [
  {
    id: 'cmp-001',
    ticket_no: 'CMP-2026-1042',
    booking_id: 'bk-seed-4',
    customer_id: 'usr-cust-priya',
    worker_id: 'wrk-gen-3',
    cooperative_id: 'coop-cbe-1',
    title: 'Slight delay in arrival during peak rain',
    description: 'The worker arrived 25 minutes after estimated window due to sudden heavy waterlogging near Peelamedu underpass.',
    category: 'DELAY',
    status: 'RESOLVED',
    priority: 'LOW',
    resolution_notes: 'Cooperative mediator contacted customer. Worker provided valid waterlogging reason. Customer expressed satisfaction with the repair quality.',
    escalated_to_federation: 0,
  },
  {
    id: 'cmp-002',
    ticket_no: 'CMP-2026-1088',
    booking_id: 'bk-seed-12',
    customer_id: 'usr-gen-cust-5',
    worker_id: 'wrk-gen-7',
    cooperative_id: 'coop-cbe-1',
    title: 'Spare parts billing clarification needed',
    description: 'Customer requested official cooperative invoice break-up for brass valve replacement.',
    category: 'OVERCHARGING',
    status: 'UNDER_REVIEW',
    priority: 'MEDIUM',
    resolution_notes: 'Cooperative supervisor is verifying standard GST spare part rate chart with the worker.',
    escalated_to_federation: 0,
  },
  {
    id: 'cmp-003',
    ticket_no: 'CMP-2026-2001',
    booking_id: 'bk-seed-25',
    customer_id: 'usr-gen-cust-18',
    worker_id: 'wrk-gen-12',
    cooperative_id: 'coop-cbe-1',
    title: 'Cross-district jurisdiction dispute during industrial corridor booking',
    description: 'Booking placed on district boundary between Coimbatore and Tiruppur requiring federation inter-cooperative allocation arbitration.',
    category: 'OTHER',
    status: 'ESCALATED',
    priority: 'HIGH',
    resolution_notes: 'Escalated to Tamil Nadu Federation Admin for regional boundary harmonization.',
    escalated_to_federation: 1,
  }
];

const insertComplaint = db.prepare(`
  INSERT INTO complaints (
    id, ticket_no, booking_id, customer_id, worker_id, cooperative_id,
    title, description, category, evidence_photos_json, status, priority,
    resolution_notes, escalated_to_federation
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?)
`);
complaintsData.forEach(c => {
  insertComplaint.run(
    c.id, c.ticket_no, c.booking_id, c.customer_id, c.worker_id, c.cooperative_id,
    c.title, c.description, c.category, c.status, c.priority, c.resolution_notes, c.escalated_to_federation
  );
});

// 13. Seed AI Demand Forecasts (Historical & Future Trend Lines)
const demandForecastSeeds = [
  // Coimbatore Communities
  { id: 'df-1', region_id: 'reg-cbe', community_id: 'comm-cbe-2', service_id: 'srv-plumb-2', time_period: 'Next 30 Days (Sep 2026)', predicted: 88, historical: 62, growth: 41.9, level: 'HIGH', weather: 'North-East Monsoon Anticipated Rain Surges', note: 'Plumbing and pipe leakage requests are expected to increase by approximately 42% due to seasonal monsoon roof/pipe load in Peelamedu.' },
  { id: 'df-2', region_id: 'reg-cbe', community_id: 'comm-cbe-1', service_id: 'srv-elec-3', time_period: 'Next 30 Days (Sep 2026)', predicted: 74, historical: 58, growth: 27.5, level: 'HIGH', weather: 'Heavy Lighting & Voltage Surges', note: 'High switchboard and MCB trip breakdown frequency in older RS Puram bungalows.' },
  { id: 'df-3', region_id: 'reg-cbe', community_id: 'comm-cbe-5', service_id: 'srv-clean-2', time_period: 'Next 30 Days (Sep 2026)', predicted: 115, historical: 79, growth: 45.6, level: 'CRITICAL', weather: 'IT Corridor Pre-Festive Move-in Season', note: 'Saravanampatti tech park apartment relocations creating immense deep cleaning demand.' },
  { id: 'df-4', region_id: 'reg-cbe', community_id: 'comm-cbe-3', service_id: 'srv-carp-1', time_period: 'Next 30 Days (Sep 2026)', predicted: 42, historical: 38, growth: 10.5, level: 'MEDIUM', weather: 'Standard Weather', note: 'Steady commercial and residential lock and wooden shutter repairs.' },
  { id: 'df-5', region_id: 'reg-cbe', community_id: 'comm-cbe-4', service_id: 'srv-comm-1', time_period: 'Next 30 Days (Sep 2026)', predicted: 35, historical: 18, growth: 94.4, level: 'CRITICAL', weather: 'Monsoon Silt Influx', note: 'Community drainage jetting requests surging sharply in Singanallur low-lying wards.' },

  // Chennai Communities
  { id: 'df-6', region_id: 'reg-chn', community_id: 'comm-chn-1', service_id: 'srv-ac-1', time_period: 'Next 30 Days (Sep 2026)', predicted: 140, historical: 110, growth: 27.2, level: 'HIGH', weather: 'Coastal Humidity High', note: 'Anna Nagar AC power jet servicing demand spikes.' },
  { id: 'df-7', region_id: 'reg-chn', community_id: 'comm-chn-3', service_id: 'srv-elder-1', time_period: 'Next 30 Days (Sep 2026)', predicted: 95, historical: 82, growth: 15.8, level: 'MEDIUM', weather: 'Normal', note: 'High density of senior citizens requiring certified cooperative companion visits in Adyar & Besant Nagar.' },

  // Madurai Communities
  { id: 'df-8', region_id: 'reg-mdu', community_id: 'comm-mdu-1', service_id: 'srv-plumb-1', time_period: 'Next 30 Days (Sep 2026)', predicted: 50, historical: 44, growth: 13.6, level: 'MEDIUM', weather: 'Normal', note: 'Steady tap and overhead tank servicing in KK Nagar residential layouts.' },
];

const insertForecast = db.prepare(`
  INSERT INTO demand_forecasts (
    id, region_id, community_id, service_id, time_period,
    predicted_requests, historical_avg, growth_rate_pct, demand_level, confidence_score, weather_event, notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0.94, ?, ?)
`);
demandForecastSeeds.forEach(df => {
  insertForecast.run(df.id, df.region_id, df.community_id, df.service_id, df.time_period, df.predicted, df.historical, df.growth, df.level, df.weather, df.note);
});

// 14. Seed AI Workforce Reallocation Recommendations (Prompt Spec Section 13)
const workforceRecommendationsData = [
  {
    id: 'wfr-001',
    federation_id: 'fed-tn-1',
    source_cooperative_id: 'coop-cbe-1',
    target_cooperative_id: 'coop-cbe-1',
    target_community_id: 'comm-cbe-2', // Peelamedu
    service_category_id: 'cat-plumbing',
    required_workers: 15,
    available_workers: 11,
    recommended_deployment_count: 4,
    reason: 'Expected plumbers needed: 15. Available plumbers: 11. Recommendation: Deploy 4 additional plumbers from nearby Cooperative Branch / Singanallur sector to prevent turnaround delays during monsoon.',
    status: 'PENDING',
  },
  {
    id: 'wfr-002',
    federation_id: 'fed-tn-1',
    source_cooperative_id: 'coop-chn-1',
    target_cooperative_id: 'coop-chn-1',
    target_community_id: 'comm-chn-4', // Velachery & OMR
    service_category_id: 'cat-cleaning',
    required_workers: 22,
    available_workers: 14,
    recommended_deployment_count: 8,
    reason: 'Heavy festive demand surge in OMR IT corridor. Rebalance 8 certified sanitization professionals from North Chennai Hub.',
    status: 'APPROVED',
  },
  {
    id: 'wfr-003',
    federation_id: 'fed-tn-1',
    source_cooperative_id: 'coop-mdu-1',
    target_cooperative_id: 'coop-mdu-1',
    target_community_id: 'comm-mdu-3', // Simmakkal Temple Zone
    service_category_id: 'cat-electrical',
    required_workers: 12,
    available_workers: 7,
    recommended_deployment_count: 5,
    reason: 'Meenakshi Temple Festival illumination and safety inspection surge. Deploy 5 master electricians from Madurai East division.',
    status: 'DEPLOYED',
  }
];

const insertWfRec = db.prepare(`
  INSERT INTO workforce_recommendations (
    id, federation_id, source_cooperative_id, target_cooperative_id, target_community_id,
    service_category_id, required_workers, available_workers, recommended_deployment_count, reason, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
workforceRecommendationsData.forEach(wr => {
  insertWfRec.run(
    wr.id, wr.federation_id, wr.source_cooperative_id, wr.target_cooperative_id, wr.target_community_id,
    wr.service_category_id, wr.required_workers, wr.available_workers, wr.recommended_deployment_count, wr.reason, wr.status
  );
});

// 15. Seed Announcements
const announcementsData = [
  {
    id: 'ann-001',
    cooperative_id: 'coop-cbe-1',
    federation_id: 'fed-tn-1',
    title: 'Monsoon Emergency Preparedness & Overtime Welfare Incentive',
    content: 'All verified plumbers, electricians, and community drainage workers are requested to maintain emergency ready mode. Cooperative Welfare Fund will disburse an extra 15% rain allowance on all emergency bookings.',
    target_audience: 'WORKERS',
    priority: 'HIGH',
    author_name: 'Meena Sundaram (Cooperative Admin)',
  },
  {
    id: 'ann-002',
    cooperative_id: null,
    federation_id: 'fed-tn-1',
    title: 'State Labour Welfare Board Group Insurance Policy Renewal 2026-27',
    content: 'Free annual health checkup and zero-deductible cashless insurance cards are now active for all verified cooperative gig members across Tamil Nadu.',
    target_audience: 'ALL',
    priority: 'NORMAL',
    author_name: 'Arumugam P. (State Federation Secretary)',
  },
  {
    id: 'ann-003',
    cooperative_id: 'coop-cbe-1',
    federation_id: 'fed-tn-1',
    title: 'Community Trust Initiative: Zero Hidden Platform Commission',
    content: 'Dear Customers: 88% of your service fee directly supports your local verified cooperative worker, with 7% dedicated to worker healthcare and pension funds.',
    target_audience: 'CUSTOMERS',
    priority: 'NORMAL',
    author_name: 'Coimbatore Labour Cooperative Society',
  }
];

const insertAnn = db.prepare(`
  INSERT INTO announcements (id, cooperative_id, federation_id, title, content, target_audience, priority, author_name)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
announcementsData.forEach(a => {
  insertAnn.run(a.id, a.cooperative_id, a.federation_id, a.title, a.content, a.target_audience, a.priority, a.author_name);
});

// 16. Seed Notifications for Demo Users
const notifsData = [
  // For Priya (Customer)
  { id: 'notif-p-1', user_id: 'usr-cust-priya', title: 'Booking Complete & Verified', message: 'Your tap leak repair by Ravi Kumar was completed. Invoice #INV-2026-10001 is ready.', type: 'PAYMENT', is_read: 0, action_url: '/bookings/bk-seed-1' },
  { id: 'notif-p-2', user_id: 'usr-cust-priya', title: 'Community Alert: Monsoon Maintenance', message: 'Pre-monsoon roof and drainage inspection is now available with verified cooperative workers.', type: 'ANNOUNCEMENT', is_read: 1, action_url: '/services' },

  // For Ravi (Worker)
  { id: 'notif-r-1', user_id: 'usr-wrk-ravi', title: 'Cooperative Welfare Fund Update', message: 'Your tool purchase subsidy grant of ₹8,500 has been credited to your cooperative bank account.', type: 'WELFARE', is_read: 0, action_url: '/worker-dashboard' },
  { id: 'notif-r-2', user_id: 'usr-wrk-ravi', title: '5-Star Customer Review Received', message: 'Priya Raman rated your tap repair 5 stars: "Extremely polite and punctual! Fixed the pipe leakage within 30 minutes."', type: 'BOOKING', is_read: 0, action_url: '/worker-dashboard' },

  // For Meena (Cooperative Admin)
  { id: 'notif-m-1', user_id: 'usr-admin-meena', title: 'Pending Worker Verification (3 Craftsmen)', message: 'New applications for membership and NCVT skill verification require review.', type: 'WELFARE', is_read: 0, action_url: '/admin/workers' },
  { id: 'notif-m-2', user_id: 'usr-admin-meena', title: 'AI Demand Alert: High Monsoon Plumbing Surge', message: 'Predicted 42% demand increase in Peelamedu. Review inter-cooperative allocation recommendation.', type: 'EMERGENCY', is_read: 0, action_url: '/admin/forecast' },
];

const insertNotif = db.prepare(`
  INSERT INTO notifications (id, user_id, title, message, type, is_read, action_url)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
notifsData.forEach(n => {
  insertNotif.run(n.id, n.user_id, n.title, n.message, n.type, n.is_read, n.action_url);
});

console.log('[SEED] Database successfully seeded with 55+ workers, 105+ customers, 120+ bookings, AI forecasts, and welfare records!');
