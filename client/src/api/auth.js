/**
 * Same-origin in production (Render single service).
 * Local Vite → talk to API on :5000 unless VITE_API_URL is set.
 */
export const API_BASE =
  import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
    ? import.meta.env.VITE_API_URL
    : import.meta.env.DEV
      ? 'http://localhost:5000'
      : '';

const TOKEN_KEY = 'icc_access_token';

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token, persist = true) {
  if (!token) {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  sessionStorage.setItem(TOKEN_KEY, token);
  if (persist) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  setToken('');
}

export function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

/** fetch wrapper that attaches ICC auth token */
export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = authHeaders({
    'Content-Type': 'application/json',
    ...(options.headers || {})
  });
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent('icc:auth-required'));
  }
  return res;
}

export async function checkAuthStatus() {
  const res = await fetch(`${API_BASE}/api/auth/status`);
  return res.json();
}

export async function login(password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  if (data.token) setToken(data.token, true);
  return data;
}
