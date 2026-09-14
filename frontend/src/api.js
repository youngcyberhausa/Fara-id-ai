const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

function authHeaders() {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

async function handle(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  calculate: (payload) =>
    fetch(`${BASE_URL}/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handle),

  createCase: (payload) =>
    fetch(`${BASE_URL}/cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handle),

  updateCase: (id, payload) =>
    fetch(`${BASE_URL}/cases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handle),

  listCases: () => fetch(`${BASE_URL}/cases`, { headers: authHeaders() }).then(handle),

  getCase: (id) => fetch(`${BASE_URL}/cases/${id}`, { headers: authHeaders() }).then(handle),

  deleteCase: (id) =>
    fetch(`${BASE_URL}/cases/${id}`, { method: "DELETE", headers: authHeaders() }).then(handle),

  shareCase: (id) =>
    fetch(`${BASE_URL}/cases/${id}/share`, { method: "POST", headers: authHeaders() }).then(handle),

  unshareCase: (id) =>
    fetch(`${BASE_URL}/cases/${id}/share`, { method: "DELETE", headers: authHeaders() }).then(handle),

  getSharedCase: (token) => fetch(`${BASE_URL}/cases/shared/${token}`).then(handle),
};

export const authApi = {
  register: (email, password, name) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    }).then(handle),

  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(handle),

  google: (idToken) =>
    fetch(`${BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    }).then(handle),

  me: () => fetch(`${BASE_URL}/auth/me`, { headers: authHeaders() }).then(handle),

  forgotPassword: (email) =>
    fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then(handle),

  resetPassword: (token, newPassword) =>
    fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: newPassword }),
    }).then(handle),
};

export const supportApi = {
  chat: (message, history) =>
    fetch(`${BASE_URL}/support/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ message, history }),
    }).then(handle),
};

export const paymentsApi = {
  initialize: () =>
    fetch(`${BASE_URL}/payments/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
    }).then(handle),

  verify: (reference) =>
    fetch(`${BASE_URL}/payments/verify/${reference}`, {
      headers: authHeaders(),
    }).then(handle),
};

export const adminApi = {
  getStats: () => fetch(`${BASE_URL}/admin/stats`, { headers: authHeaders() }).then(handle),

  listUsers: () => fetch(`${BASE_URL}/admin/users`, { headers: authHeaders() }).then(handle),

  listAnnouncements: () =>
    fetch(`${BASE_URL}/admin/announcements`, { headers: authHeaders() }).then(handle),

  createAnnouncement: (payload) =>
    fetch(`${BASE_URL}/admin/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handle),

  deactivateAnnouncement: (id) =>
    fetch(`${BASE_URL}/admin/announcements/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handle),
};

export const announcementsApi = {
  getActive: () => fetch(`${BASE_URL}/announcements/active`).then(handle),
};

export const zakatApi = {
  getPrices: (currency) => fetch(`${BASE_URL}/zakat/prices?currency=${currency}`).then(handle),
};
