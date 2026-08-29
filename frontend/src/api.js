const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),

  createCase: (payload) =>
    fetch(`${BASE_URL}/cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),

  updateCase: (id, payload) =>
    fetch(`${BASE_URL}/cases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),

  listCases: () => fetch(`${BASE_URL}/cases`).then(handle),

  getCase: (id) => fetch(`${BASE_URL}/cases/${id}`).then(handle),

  deleteCase: (id) => fetch(`${BASE_URL}/cases/${id}`, { method: "DELETE" }).then(handle),
};
