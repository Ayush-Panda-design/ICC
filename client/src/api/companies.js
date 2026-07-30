import { apiFetch, authHeaders, API_BASE } from './auth';

export { API_BASE };

function isGenericSearch(url) {
  return /linkedin\.com\/jobs\/search|google\.com\/search|wellfound\.com\/jobs\?q=/i.test(url || '');
}

/** Prefer real open-role URL, then working apply URL. */
export function getWorkingApplyUrl(company) {
  if (!company) return null;
  const liveRole = (company.openRoles || []).find((r) => r?.url && !isGenericSearch(r.url));
  if (liveRole?.url) return liveRole.url;
  if (company.urlStatus === 'broken' && company.fallbackUrl) return company.fallbackUrl;
  const primary = company.applyUrl || company.url || company.fallbackUrl || null;
  if (primary && isGenericSearch(primary) && company.fallbackUrl && !isGenericSearch(company.fallbackUrl)) {
    return company.fallbackUrl;
  }
  return primary;
}

/** Open the apply page only — does NOT change company status. */
export function openApplyUrl(company) {
  const url = getWorkingApplyUrl(company);
  if (!url) {
    throw Object.assign(new Error('No working apply link — run Sync / Health Check'), { code: 'NO_URL' });
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  return {
    openedUrl: url,
    warned: company.urlStatus === 'broken' || isGenericSearch(company.applyUrl || company.url)
  };
}

/** Manually mark Applied (only when user confirms they actually applied). */
export async function markCompanyApplied(company) {
  const id = company._id || company.id;
  const res = await apiFetch(`/api/companies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'Applied' })
  });
  if (!res.ok) throw new Error('Failed to mark applied');
  return res.json();
}

/**
 * @deprecated Prefer openApplyUrl + markCompanyApplied separately.
 * Kept for compatibility: now only opens URL (no status change).
 */
export async function applyToCompany(company) {
  return openApplyUrl(company);
}

export function buildCompanyQuery(filters) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined && v !== false) {
      params.set(k, String(v));
    }
  });
  const qs = params.toString();
  return `/api/companies${qs ? `?${qs}` : ''}`;
}

export async function fetchCompanies(filters) {
  const res = await apiFetch(buildCompanyQuery(filters));
  if (!res.ok) throw new Error('Failed to load companies');
  return res.json();
}

export { authHeaders, apiFetch };
