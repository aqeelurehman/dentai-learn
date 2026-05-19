export const API_BASE_URL = "http://localhost:5000/api";

export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("dentpath_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("dentpath_token");
    window.location.reload();
    return null;
  }

  return res.json();
}
