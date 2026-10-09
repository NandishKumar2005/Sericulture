/**
 * Sericulture API Service
 * =======================
 * Centralised HTTP client for all backend calls.
 * Token is read from localStorage (set by AuthScreen on login).
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('token') || null;
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${BASE_URL}${path}`, config);
    const data = await response.json();

    if (!response.ok) {
      const message = data?.message || data?.error || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    console.warn(`API ${method} ${path} error:`, err.message);
    throw err;
  }
}

const get  = (path)        => request('GET',  path);
const post = (path, body)  => request('POST', path, body);
const put  = (path, body)  => request('PUT',  path, body);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  login:         (email, password) => post('/auth/login',    { email, password }),
  register:      (payload)         => post('/auth/register', payload),
  updateProfile: (payload)         => put('/auth/profile',   payload),
};

// ─── Weather ──────────────────────────────────────────────────────────────────

export const weatherAPI = {
  getRealtime: (location = 'Kolar') => get(`/weather?location=${encodeURIComponent(location)}`),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsAPI = {
  getAll: (location = '') => get(`/notifications${location ? '?location=' + encodeURIComponent(location) : ''}`),
  markAllRead: () => post('/notifications/read-all', {}),
  create: (payload) => post('/notifications', payload),
};

// ─── Farms ────────────────────────────────────────────────────────────────────

export const farmsAPI = {
  getAll:   ()        => get('/farms'),
  create:   (payload) => post('/farms', payload),
};

// ─── Harvest Prediction ───────────────────────────────────────────────────────

export const harvestAPI = {
  predict:    (payload) => post('/predictions/harvest', payload),
  getHistory: (farmId)  => get(`/predictions/harvest${farmId ? '/' + farmId : ''}`),
  getAll:     (farmId)  => get(`/predictions/harvest${farmId ? '/' + farmId : ''}`),
};

// ─── Batches ──────────────────────────────────────────────────────────────────

export const batchesAPI = {
  getAll:  (farmId)  => get(`/batches${farmId ? '?farmId=' + farmId : ''}`),
  create:  (payload) => post('/batches', payload),
};

// ─── Feeding ──────────────────────────────────────────────────────────────────

export const feedingAPI = {
  optimise: (batchId, leafQualityScore, previousWastagePct) =>
    post('/feeding/optimise', {
      batchId,
      ...(leafQualityScore    != null && { leaf_quality_score:    leafQualityScore }),
      ...(previousWastagePct  != null && { previous_wastage_pct:  previousWastagePct }),
    }),

  getByBatch: (batchId) => get(`/feeding/${batchId}`),
  record:     (payload) => post('/feeding', payload),
  log:        (batchId, payload) => post('/feeding', { batchId, ...(typeof payload === 'object' ? payload : { quantityKg: payload }) }),
};

// ─── Leaf Analysis ────────────────────────────────────────────────────────────

export const leafAPI = {
  analyse:    (farmId, imageBase64) => post('/leaf-analysis/analyse', { farmId, image: imageBase64 }),
  scan:       (farmId, payload)     => post('/leaf-analysis/analyse', { farmId, ...(typeof payload === 'object' ? payload : { score: payload }) }),
  getHistory: (farmId)             => get(`/leaf-analysis/history${farmId ? '/' + farmId : ''}`),
};

// ─── Production Prediction ───────────────────────────────────────────────────

export const productionAPI = {
  predict:           (batchId, leafQualityScore) => post('/predictions/cocoon-silk', { batchId, leafQualityScore }),
  predictCocoonSilk: (payload)                   => post('/predictions/cocoon-silk', payload),
  getByBatch:        (batchId)                   => get(`/predictions/${batchId}`),
};

// ─── Copilot API ─────────────────────────────────────────────────────────────

export const copilotAPI = {
  ask: (payload) => post('/copilot', typeof payload === 'object' ? payload : { question: payload }),
  getConversations: () => get('/copilot/conversations'),
};
