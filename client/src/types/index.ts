export type UserRole = 'customer' | 'worker' | 'cooperative_admin' | 'federation_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  region_id?: string;
  community_id?: string;
  cooperative_id?: string;
  address?: string;
  community_name?: string;
  cooperative_name?: string;
  region_name?: string;
  created_at?: string;
}

export interface Region {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  cooperatives_count?: number;
  communities_count?: number;
}

export interface Cooperative {
  id: string;
  federation_id: string;
  region_id: string;
  name: string;
  registration_no: string;
  address: string;
  lat: number;
  lng: number;
  service_radius_km: number;
  phone: string;
  email: string;
  established_year: number;
  bank_account_masked?: string;
  status: string;
  description: string;
  region_name?: string;
  federation_name?: string;
  total_workers?: number;
  active_workers?: number;
  completed_jobs?: number;
  avg_rating?: number;
}

export interface Community {
  id: string;
  region_id: string;
  cooperative_id?: string;
  name: string;
  postal_code: string;
  lat: number;
  lng: number;
  radius_km: number;
  region_name?: string;
  cooperative_name?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  base_price: number;
  unit: string;
  is_emergency_supported: number;
  services?: Service[];
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string;
  estimated_time: string;
  base_price: number;
  emergency_multiplier: number;
}

export interface WorkerSkill {
  id: string;
  worker_id: string;
  category_id: string;
  skill_name: string;
  proficiency_level: 'APPRENTICE' | 'JOURNEYMAN' | 'EXPERT' | 'MASTER';
  is_verified: number;
  verified_date?: string;
  category_name?: string;
  category_icon?: string;
  category_slug?: string;
}

export interface Certification {
  id: string;
  worker_id: string;
  title: string;
  issuing_body: string;
  issue_date?: string;
  expiry_date?: string;
  certificate_url?: string;
  is_verified: number;
}

export interface Worker {
  id: string;
  user_id: string;
  cooperative_id: string;
  community_id?: string;
  experience_years: number;
  bio: string;
  is_identity_verified: number;
  is_membership_verified: number;
  is_skill_verified: number;
  is_cert_verified: number;
  is_emergency_ready: number;
  is_available: number;
  current_lat: number;
  current_lng: number;
  service_radius_km: number;
  rating: number;
  review_count: number;
  total_jobs: number;
  repeat_customers_count: number;
  active_workload: number;
  verified_by?: string;
  verified_at?: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  cooperative_name: string;
  cooperative_reg_no?: string;
  cooperative_address?: string;
  cooperative_phone?: string;
  community_name?: string;
  region_name?: string;
  skills?: WorkerSkill[];
  certifications?: Certification[];
  match_score?: number;
  match_factors?: string[];
  distance_km?: number;
  estimated_travel_mins?: number;
}

export type BookingStatus = 'REQUESTED' | 'ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface Booking {
  id: string;
  booking_code: string;
  customer_id: string;
  worker_id?: string;
  cooperative_id: string;
  service_id: string;
  category_id: string;
  status: BookingStatus;
  is_emergency: number;
  problem_title: string;
  description: string;
  photos?: string[];
  photos_json?: string;
  scheduled_at: string;
  completed_at?: string;
  customer_lat: number;
  customer_lng: number;
  customer_address: string;
  customer_phone?: string;
  total_amount: number;
  platform_fee: number;
  cooperative_fee: number;
  worker_payout: number;
  taxes: number;
  payment_status: 'PENDING' | 'PAID' | 'REFUNDED';
  payment_method: string;
  match_score: number;
  match_factors?: string[];
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  customer_avatar?: string;
  worker_name?: string;
  worker_email?: string;
  worker_phone?: string;
  worker_avatar?: string;
  worker_rating?: number;
  worker_total_jobs?: number;
  worker_experience?: number;
  worker_lat?: number;
  worker_lng?: number;
  is_membership_verified?: number;
  is_skill_verified?: number;
  cooperative_name?: string;
  cooperative_reg_no?: string;
  service_name?: string;
  service_estimated_time?: string;
  category_name?: string;
  category_icon?: string;
}

export interface BookingStatusHistory {
  id: string;
  booking_id: string;
  status: BookingStatus;
  notes?: string;
  changed_by_name?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  customer_id: string;
  worker_id: string;
  cooperative_id: string;
  amount: number;
  platform_fee: number;
  cooperative_fee: number;
  worker_payout: number;
  taxes: number;
  payment_method: string;
  transaction_id: string;
  status: string;
  invoice_no: string;
  paid_at: string;
}

export interface Invoice {
  id: string;
  invoice_no: string;
  booking_id: string;
  payment_id: string;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  worker_name: string;
  worker_cooperative_name: string;
  service_name: string;
  base_amount: number;
  platform_fee: number;
  cooperative_fee: number;
  taxes: number;
  total_amount: number;
  is_emergency: number;
  issued_at: string;
  booking_code?: string;
  transaction_id?: string;
  payment_method?: string;
  paid_at?: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  worker_id: string;
  rating: number;
  comment?: string;
  punctuality_rating: number;
  quality_rating: number;
  behavior_rating: number;
  created_at: string;
  customer_name?: string;
  customer_avatar?: string;
}

export interface Complaint {
  id: string;
  ticket_no: string;
  booking_id?: string;
  customer_id: string;
  worker_id?: string;
  cooperative_id: string;
  title: string;
  description: string;
  category: 'QUALITY' | 'OVERCHARGING' | 'DELAY' | 'MISBEHAVIOR' | 'NO_SHOW' | 'OTHER';
  evidence_photos?: string[];
  evidence_photos_json?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  resolution_notes?: string;
  escalated_to_federation: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  worker_name?: string;
  cooperative_name?: string;
  booking_code?: string;
  service_name?: string;
  created_at: string;
  updated_at: string;
}

export interface WelfareRecord {
  id: string;
  worker_id: string;
  cooperative_id: string;
  scheme_name: string;
  scheme_type: 'HEALTH_INSURANCE' | 'ACCIDENT_COVER' | 'PENSION_SCHEME' | 'WELFARE_FUND' | 'EDUCATION_GRANT';
  policy_no?: string;
  coverage_amount?: number;
  validity_date?: string;
  status: string;
  benefits_disbursed?: number;
  created_at?: string;
}

export interface TrainingRecord {
  id: string;
  worker_id: string;
  training_name: string;
  institution: string;
  completed_date: string;
  validity_date?: string;
  status: string;
  certificate_no?: string;
}

export interface DemandForecast {
  id: string;
  region_id: string;
  community_id: string;
  service_id: string;
  time_period: string;
  predicted_requests: number;
  historical_avg: number;
  growth_rate_pct: number;
  demand_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence_score: number;
  weather_event?: string;
  notes?: string;
  community_name: string;
  postal_code: string;
  region_name: string;
  service_name: string;
  category_name: string;
  category_icon: string;
  category_slug: string;
}

export interface WorkforceRecommendation {
  id: string;
  federation_id: string;
  source_cooperative_id: string;
  target_cooperative_id: string;
  target_community_id: string;
  service_category_id: string;
  required_workers: number;
  available_workers: number;
  recommended_deployment_count: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DEPLOYED';
  source_cooperative_name?: string;
  target_cooperative_name?: string;
  target_community_name?: string;
  category_name?: string;
  category_icon?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  cooperative_id?: string;
  federation_id?: string;
  title: string;
  content: string;
  target_audience: 'ALL' | 'WORKERS' | 'CUSTOMERS' | 'ADMINS';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  author_name: string;
  cooperative_name?: string;
  federation_name?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'BOOKING' | 'EMERGENCY' | 'PAYMENT' | 'COMPLAINT' | 'WELFARE' | 'ANNOUNCEMENT';
  is_read: number;
  action_url?: string;
  created_at: string;
}
