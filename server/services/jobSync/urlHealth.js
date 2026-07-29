const { PLATFORM_FALLBACKS } = require('./urlCatalog');

const BROKEN_BODY_MARKERS = [
  'failure of web server bridge',
  'incorrect configuration',
  'cannot continue',
  'page not found',
  '404 not found',
  'this page doesn\'t exist',
  'job no longer available',
  'position has been filled'
];

/**
 * Probe a URL. Returns { ok, status, finalUrl, reason }.
 * Does not follow into login walls as "broken" if status is 2xx/3xx.
 */
async function checkUrl(url, timeoutMs = 10000) {
  if (!url || !/^https?:\/\//i.test(url)) {
    return { ok: false, status: 0, finalUrl: url || '', reason: 'missing_or_invalid' };
  }

  // Google search is not an apply link
  if (/google\.com\/search/i.test(url)) {
    return { ok: false, status: 0, finalUrl: url, reason: 'search_page_not_apply' };
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    let res;
    try {
      res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: ctrl.signal,
        headers: {
          'User-Agent': 'InterviewCommandCenter/1.0 (+local url health check)',
          Accept: 'text/html,application/json'
        }
      });
    } catch {
      res = null;
    }

    // Some hosts block HEAD — fall back to GET
    if (!res || res.status === 405 || res.status === 403 || res.status === 501) {
      res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: ctrl.signal,
        headers: {
          'User-Agent': 'InterviewCommandCenter/1.0 (+local url health check)',
          Accept: 'text/html,application/json'
        }
      });
    }

    const status = res.status;
    const finalUrl = res.url || url;

    // Bot walls (403/999/401) usually still open fine in a real browser
    if (status === 401 || status === 403 || status === 999) {
      return { ok: true, status, finalUrl, reason: 'browser_ok_bot_blocked' };
    }

    if (status >= 400) {
      return { ok: false, status, finalUrl, reason: `http_${status}` };
    }

    const ctype = res.headers.get('content-type') || '';
    if (ctype.includes('text/html') && res.body) {
      const text = (await res.text()).slice(0, 8000).toLowerCase();
      for (const marker of BROKEN_BODY_MARKERS) {
        if (text.includes(marker)) {
          return { ok: false, status, finalUrl, reason: `body:${marker}` };
        }
      }
    }

    return { ok: true, status, finalUrl, reason: 'ok' };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      reason: err.name === 'AbortError' ? 'timeout' : (err.message || 'fetch_failed')
    };
  } finally {
    clearTimeout(t);
  }
}

function fallbackForCompany(company) {
  const platform = company.platform || '';
  if (/internshala/i.test(platform)) return PLATFORM_FALLBACKS.Internshala;
  if (/wellfound|angellist/i.test(platform)) return PLATFORM_FALLBACKS.Wellfound;
  if (/linkedin/i.test(platform)) return PLATFORM_FALLBACKS.LinkedIn;
  if (/unstop/i.test(platform) || /unstop/i.test(company.name || '')) return PLATFORM_FALLBACKS.Unstop;
  if (/remotive/i.test(platform)) return PLATFORM_FALLBACKS.Remotive;
  return PLATFORM_FALLBACKS[platform] || PLATFORM_FALLBACKS.Internshala;
}

module.exports = { checkUrl, fallbackForCompany, BROKEN_BODY_MARKERS };
