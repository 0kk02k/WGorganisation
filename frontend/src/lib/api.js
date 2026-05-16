import axios from "axios";

// API über Netlify Functions (gleiche Domain, kein CORS-Problem)
const API_BASE = process.env.REACT_APP_BACKEND_URL 
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : "/api";

export const api = axios.create({
  baseURL: API_BASE,
});

// ============ STAYS ============
export const staysApi = {
  async list() {
    const response = await api.get('/stays');
    return Array.isArray(response.data) ? response.data : [];
  },

  async get(id) {
    const response = await api.get(`/stays/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/stays', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/stays/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/stays/${id}`);
    return response.data;
  },
};

// ============ MANUALS ============
export const manualsApi = {
  async list() {
    const response = await api.get('/manuals');
    return Array.isArray(response.data) ? response.data : [];
  },

  async get(id) {
    const response = await api.get(`/manuals/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/manuals', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/manuals/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/manuals/${id}`);
    return response.data;
  },
};

// ============ MESSAGES ============
export const messagesApi = {
  async list() {
    const response = await api.get('/messages');
    return Array.isArray(response.data) ? response.data : [];
  },

  async create(data) {
    const response = await api.post('/messages', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/messages/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },
};

// ============ EVENTS ============
export const eventsApi = {
  async list() {
    const response = await api.get('/events');
    return Array.isArray(response.data) ? response.data : [];
  },

  async create(data) {
    const response = await api.post('/events', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

// ============ BERLIN LINKS ============
export const berlinLinksApi = {
  async list() {
    const response = await api.get('/berlin-links');
    return Array.isArray(response.data) ? response.data : [];
  },

  async create(data) {
    const response = await api.post('/berlin-links', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/berlin-links/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/berlin-links/${id}`);
    return response.data;
  },
};

// ============ SETTINGS ============
export const settingsApi = {
  async get() {
    const response = await api.get('/settings');
    return response.data;
  },

  async update(data) {
    const response = await api.put('/settings', data);
    return response.data;
  },
};

export default {
  stays: staysApi,
  manuals: manualsApi,
  messages: messagesApi,
  events: eventsApi,
  berlinLinks: berlinLinksApi,
  settings: settingsApi,
};
