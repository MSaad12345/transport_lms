const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor(baseUrl = API_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('lms_token');
  }

  setToken(token) {
    if (typeof window === 'undefined') return;
    if (token) localStorage.setItem('lms_token', token);
    else localStorage.removeItem('lms_token');
  }

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${this.baseUrl}/api${path}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { success: false, message: 'Invalid server response' };
    }

    if (!res.ok || data.success === false) {
      const err = new Error(data.message || `Request failed (${res.status})`);
      err.status = res.status;
      err.details = data.details;
      throw err;
    }

    return data;
  }

  get(path, params) {
    const qs = params
      ? `?${new URLSearchParams(
          Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
        )}`
      : '';
    return this.request(`${path}${qs}`);
  }

  post(path, body) {
    return this.request(path, { method: 'POST', body });
  }

  patch(path, body) {
    return this.request(path, { method: 'PATCH', body });
  }

  // Auth
  login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  me() {
    return this.get('/auth/me');
  }

  // Domain
  dashboard() {
    return this.get('/dashboard');
  }

  orders(params) {
    return this.get('/orders', params);
  }

  createOrder(body) {
    return this.post('/orders', body);
  }

  advanceOrder(id, note) {
    return this.post(`/orders/${id}/advance`, { note });
  }

  assignDriver(id, driverId) {
    return this.post(`/orders/${id}/assign`, { driverId });
  }

  autoAssign(id) {
    return this.post(`/orders/${id}/auto-assign`);
  }

  autoAssignAll(limit = 10) {
    return this.post('/dispatch/auto-assign', { limit });
  }

  vehicles(params) {
    return this.get('/vehicles', params);
  }

  drivers(params) {
    return this.get('/drivers', params);
  }

  liveTracking() {
    return this.get('/tracking/live');
  }

  warehouses() {
    return this.get('/warehouses');
  }

  inventory(params) {
    return this.get('/inventory', params);
  }

  invoices(params) {
    return this.get('/invoices', params);
  }

  financeSummary() {
    return this.get('/finance/summary');
  }

  analytics() {
    return this.get('/analytics');
  }

  aiInsights() {
    return this.get('/ai/insights');
  }

  customers(params) {
    return this.get('/customers', params);
  }

  notifications(params) {
    return this.get('/notifications', params);
  }

  markNotificationsRead() {
    return this.post('/notifications/read-all');
  }

  unreadCount() {
    return this.get('/notifications/unread-count');
  }

  users() {
    return this.get('/admin/users');
  }

  health() {
    return this.get('/health');
  }
}

export const api = new ApiClient();
export default api;
