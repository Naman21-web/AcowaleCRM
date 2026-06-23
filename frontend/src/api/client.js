const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getToken() {
  return sessionStorage.getItem('acowale_admin_token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  submitFeedback: (payload) => request('/feedback', { method: 'POST', body: payload }),
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  listFeedback: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/feedback${qs ? `?${qs}` : ''}`, { auth: true });
  },
  updateStatus: (id, status) =>
    request(`/feedback/${id}/status`, { method: 'PATCH', body: { status }, auth: true }),
  analyticsSummary: () => request('/analytics/summary', { auth: true }),
};

export { getToken };
