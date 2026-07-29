export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/** Prefer working apply URL (ok/fallback) over known-broken. */
export function getWorkingApplyUrl(company) {
  if (!company) return null;
  if (company.urlStatus === 'broken' && company.fallbackUrl) return company.fallbackUrl;
  return company.applyUrl || company.url || company.fallbackUrl || null;
}

export async function applyToCompany(company) {
  const id = company._id || company.id;
  const url = getWorkingApplyUrl(company);
  const res = await fetch(`${API_BASE}/api/companies/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Applied' })
  });
  if (!res.ok) throw new Error('Failed to mark applied');
  const data = await res.json();

  if (!url) {
    throw Object.assign(new Error('No working apply link — run Sync / Health Check'), { code: 'NO_URL' });
  }
  if (company.urlStatus === 'broken') {
    // still open fallback but caller can toast warning
    window.open(url, '_blank', 'noopener,noreferrer');
    return { ...data, warned: true, openedUrl: url };
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  return { ...data, openedUrl: url };
}

export function buildCompanyQuery(filters) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined && v !== false) {
      params.set(k, String(v));
    }
  });
  const qs = params.toString();
  return `${API_BASE}/api/companies${qs ? `?${qs}` : ''}`;
}
