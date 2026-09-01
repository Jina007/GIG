const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('sahakari_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth & Personas
  auth: {
    login: (email: string, password: string) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    demoLogin: (persona: string) =>
      request(`/auth/demo-login/${persona}`),
    getPersonas: () => request('/auth/personas'),
    register: (userData: any) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me'),
    updateProfile: (data: any) =>
      request('/auth/update-profile', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Services
  services: {
    getCategories: () => request('/services/categories'),
    getCategory: (slugOrId: string) => request(`/services/categories/${slugOrId}`),
    createCategory: (data: any) =>
      request('/services/categories', { method: 'POST', body: JSON.stringify(data) }),
    createService: (data: any) =>
      request('/services', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Workers
  workers: {
    getAll: (params: Record<string, any> = {}) => {
      const search = new URLSearchParams(params).toString();
      return request(`/workers${search ? `?${search}` : ''}`);
    },
    getTrustProfile: (id: string) => request(`/workers/${id}/trust-profile`),
    toggleAvailability: () =>
      request('/workers/status/toggle-availability', { method: 'PATCH' }),
    toggleEmergency: () =>
      request('/workers/status/toggle-emergency', { method: 'PATCH' }),
    updateLocation: (coords: { current_lat: number; current_lng: number; service_radius_km?: number }) =>
      request('/workers/status/update-location', { method: 'PATCH', body: JSON.stringify(coords) }),
    getEarningsAnalytics: () => request('/workers/analytics/earnings'),
  },

  // Bookings & Matching
  bookings: {
    matchWorkers: (body: {
      categoryId?: string;
      serviceId?: string;
      customerLat?: number;
      customerLng?: number;
      isEmergency?: boolean;
      regionId?: string;
      communityId?: string;
    }) => request('/bookings/match-workers', { method: 'POST', body: JSON.stringify(body) }),

    create: (data: any) =>
      request('/bookings/create', { method: 'POST', body: JSON.stringify(data) }),
    getAll: (params: Record<string, any> = {}) => {
      const search = new URLSearchParams(params).toString();
      return request(`/bookings${search ? `?${search}` : ''}`);
    },
    getById: (id: string) => request(`/bookings/${id}`),
    updateStatus: (id: string, status: string, notes?: string) =>
      request(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      }),
  },

  // Payments & Invoices
  payments: {
    process: (bookingId: string, paymentMethod = 'UPI_SANDBOX') =>
      request('/payments/process', {
        method: 'POST',
        body: JSON.stringify({ bookingId, paymentMethod }),
      }),
    getInvoice: (bookingId: string) => request(`/payments/invoice/${bookingId}`),
  },

  // Reviews & Favorites
  reviews: {
    submit: (data: any) =>
      request('/reviews/submit', { method: 'POST', body: JSON.stringify(data) }),
    toggleFavorite: (workerId: string) =>
      request('/reviews/favorite/toggle', { method: 'POST', body: JSON.stringify({ workerId }) }),
    getFavorites: () => request('/reviews/favorites'),
  },

  // Cooperatives
  cooperatives: {
    getAll: (regionId?: string) =>
      request(`/cooperatives${regionId ? `?region_id=${regionId}` : ''}`),
    getStats: (id: string) => request(`/cooperatives/${id}/stats`),
    getWorkers: (id: string, statusFilter?: string) =>
      request(`/cooperatives/${id}/workers${statusFilter ? `?status_filter=${statusFilter}` : ''}`),
    verifyWorker: (data: any) =>
      request('/cooperatives/verify-worker', { method: 'POST', body: JSON.stringify(data) }),
    addWorker: (data: any) =>
      request('/cooperatives/workers/add', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Federation
  federation: {
    getOverview: () => request('/federation/overview'),
    getRecommendations: () => request('/federation/recommendations'),
    takeActionOnRecommendation: (id: string, action: 'APPROVED' | 'REJECTED' | 'DEPLOYED') =>
      request(`/federation/recommendations/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      }),
  },

  // Complaints
  complaints: {
    create: (data: any) =>
      request('/complaints/create', { method: 'POST', body: JSON.stringify(data) }),
    getAll: (params: Record<string, any> = {}) => {
      const search = new URLSearchParams(params).toString();
      return request(`/complaints${search ? `?${search}` : ''}`);
    },
    updateStatus: (id: string, status: string, resolution_notes?: string, escalate?: boolean) =>
      request(`/complaints/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, resolution_notes, escalate_to_federation: escalate }),
      }),
  },

  // Welfare & Social Security
  welfare: {
    getWorkerWelfare: (workerId: string) => request(`/welfare/worker/${workerId}`),
    addRecord: (data: any) =>
      request('/welfare/record/add', { method: 'POST', body: JSON.stringify(data) }),
    addTraining: (data: any) =>
      request('/welfare/training/add', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Forecast & Reallocation
  forecast: {
    getDemand: (regionId?: string, communityId?: string) => {
      const params = new URLSearchParams();
      if (regionId) params.append('region_id', regionId);
      if (communityId) params.append('community_id', communityId);
      return request(`/forecast/demand?${params.toString()}`);
    },
  },

  // Announcements
  announcements: {
    getAll: (cooperativeId?: string) =>
      request(`/announcements${cooperativeId ? `?cooperative_id=${cooperativeId}` : ''}`),
    create: (data: any) =>
      request('/announcements/create', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Notifications
  notifications: {
    getAll: () => request('/notifications'),
    markAllRead: () => request('/notifications/mark-all-read', { method: 'PATCH' }),
    markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  },

  // Geo & Map
  geo: {
    getRegions: () => request('/geo/regions'),
    getCommunities: (regionId?: string) =>
      request(`/geo/communities${regionId ? `?region_id=${regionId}` : ''}`),
    getNearbyWorkers: (params: { lat: number; lng: number; category_id?: string; radius_km?: number }) => {
      const search = new URLSearchParams(params as any).toString();
      return request(`/geo/nearby-workers?${search}`);
    },
  },
};
