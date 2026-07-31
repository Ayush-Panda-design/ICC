/**
 * Live careers watchers for manual/FAANG boards (no Greenhouse/Lever).
 * Detects mid-cycle intern / SWE openings by polling public career pages.
 */
const { INTERN_RE } = require('./adapters');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/** Prefer engineering tracks; still allow software apprenticeships. */
const ENG_RE =
  /software|swe|sde|engineer|developer|programming|fullstack|full.?stack|backend|frontend|android|ios|ml|machine learning|data engineer|site reliability|sre|associate software/i;
const NON_ENG_RE =
  /marketing|project management|business analyst|sales|hr |human resources|finance|legal|recruiter|account manag|digital business|customer support/i;
const INTERNISH_RE =
  /\bintern(?:s|ship)?\b|\bapprentice(?:ship)?\b|\buniversity\b|\bstudent\b|new[\s-]?grad|\bcampus\b|\bstep\b|explore program/i;

const WATCH_DEFS = [
  {
    name: 'Google',
    kind: 'google',
    urls: [
      'https://www.google.com/about/careers/applications/jobs/results/?q=Software%20Engineering%20Intern&employment_type=INTERN',
      'https://www.google.com/about/careers/applications/jobs/results/?company=Google&company=YouTube&company=Fitbit&distance=50&employment_type=INTERN&location=India&degree=PURSUING_DEGREE&degree=BACHELORS&q=software',
      'https://www.google.com/about/careers/applications/jobs/results/?q=Associate%20Software%20Developer%20Intern&employment_type=INTERN'
    ]
  },
  {
    name: 'Amazon',
    kind: 'amazon',
    urls: [
      'https://www.amazon.jobs/en/search.json?base_query=SDE+Intern&loc_query=India&result_limit=25&offset=0',
      'https://www.amazon.jobs/en/search.json?base_query=Software+Development+Engineer+Intern&result_limit=25&offset=0'
    ]
  },
  {
    name: 'Microsoft',
    kind: 'html',
    urls: [
      'https://jobs.careers.microsoft.com/global/en/search?q=Software%20Engineer%20Intern&l=en_us&pg=1&pgSz=20&o=Relevance&flt=true',
      'https://jobs.careers.microsoft.com/global/en/search?q=Explore%20Intern&l=en_us&pg=1&pgSz=20&o=Relevance&flt=true'
    ]
  },
  {
    name: 'Meta',
    kind: 'html',
    urls: ['https://www.metacareers.com/jobs?q=software%20engineer%20intern']
  },
  {
    name: 'Apple',
    kind: 'html',
    urls: ['https://jobs.apple.com/en-us/search?search=intern%20software&sort=relevance']
  },
  {
    name: 'Uber',
    kind: 'html',
    urls: ['https://www.uber.com/careers/list/?query=intern']
  },
  {
    name: 'Atlassian',
    kind: 'html',
    urls: ['https://www.atlassian.com/company/careers/all-jobs?team=Interns']
  }
];

async function fetchText(url, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/json,*/*',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text, finalUrl: res.url || url };
  } finally {
    clearTimeout(t);
  }
}

function slugToTitle(slug) {
  return String(slug || '')
    .replace(/^\d+-/, '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function isJunkTitle(title) {
  const t = String(title || '').trim();
  if (t.length < 10 || t.length > 160) return true;
  if (/search=|&amp;|page=\d+|sort=|query=|keywords=|flt=true/i.test(t)) return true;
  if (/^(home|jobs|careers|learn more|apply|sign in|back|next|previous)$/i.test(t)) return true;
  if (/^https?:\/\//i.test(t)) return true;
  return false;
}

function isEngTrack(title) {
  const t = title || '';
  if (isJunkTitle(t)) return false;
  if (NON_ENG_RE.test(t) && !ENG_RE.test(t)) return false;
  if (!INTERNISH_RE.test(t)) return false;
  return ENG_RE.test(t);
}

function dedupeRoles(roles) {
  const seen = new Set();
  const out = [];
  for (const r of roles) {
    if (!r?.title || !r?.url) continue;
    const key = `${r.title.toLowerCase()}|${r.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

function parseGoogleHtml(html) {
  const roles = [];
  const re = /jobs\/results\/(\d+)-([a-z0-9-]+)/gi;
  let m;
  const seen = new Set();
  while ((m = re.exec(html)) !== null) {
    const path = m[0];
    if (seen.has(path)) continue;
    seen.add(path);
    const title = slugToTitle(m[2]);
    if (!isEngTrack(title)) continue;
    roles.push({
      title,
      url: `https://www.google.com/about/careers/applications/${path}`,
      location: ''
    });
  }
  return roles;
}

function parseAmazonJson(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }
  const jobs = data.jobs || [];
  return (Array.isArray(jobs) ? jobs : [])
    .map((j) => {
      const id = j.id_icims || j.id || j.job_id;
      const path = j.job_path || (id ? `/en/jobs/${id}` : null);
      const url =
        j.url_next_step ||
        j.url ||
        (path ? `https://www.amazon.jobs${path.startsWith('/') ? path : `/${path}`}` : null);
      return {
        title: j.title || j.job_title || '',
        url,
        location: j.location || j.city || (Array.isArray(j.locations) ? j.locations[0] : '') || ''
      };
    })
    .filter((j) => j.title && j.url && isEngTrack(j.title));
}

function parseGenericHtml(html, pageUrl) {
  const roles = [];
  const seen = new Set();

  const linkRe = /href=["']([^"']+)["'][^>]*>\s*([^<]{0,160})/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1];
    const label = (m[2] || '').replace(/\s+/g, ' ').trim();
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;
    if (/[?&](search|page|sort|query|keywords)=/i.test(href) && !/\/job/i.test(href)) continue;

    let url;
    try {
      url = new URL(href, pageUrl).toString();
    } catch {
      continue;
    }
    if (seen.has(url)) continue;

    const title = label || slugToTitle(url.split('/').pop()?.split('?')[0]);
    if (!isEngTrack(title)) continue;
    // Prefer real job detail URLs over search result pages
    if (/\/search|\/jobs\?|\/list\/\?/i.test(url) && !/\/job\/|\/jobs\/\d|\/details\//i.test(url)) {
      continue;
    }

    seen.add(url);
    roles.push({ title, url, location: '' });
    if (roles.length >= 15) break;
  }

  const titleRe = /"title"\s*:\s*"((?:\\.|[^"\\]){8,140})"/g;
  while ((m = titleRe.exec(html)) !== null) {
    let title;
    try {
      title = JSON.parse(`"${m[1]}"`);
    } catch {
      title = m[1];
    }
    if (!isEngTrack(title)) continue;
    roles.push({ title, url: pageUrl, location: '' });
    if (roles.length >= 20) break;
  }

  return dedupeRoles(roles).slice(0, 8);
}

async function fetchRolesForDef(def) {
  const all = [];
  for (const url of def.urls) {
    try {
      const { ok, text, finalUrl } = await fetchText(url);
      if (!ok || !text) continue;
      if (def.kind === 'google') all.push(...parseGoogleHtml(text));
      else if (def.kind === 'amazon') all.push(...parseAmazonJson(text));
      else all.push(...parseGenericHtml(text, finalUrl || url));
    } catch (err) {
      console.warn(`[careersWatch] ${def.name} ${url}:`, err.message);
    }
  }
  return dedupeRoles(all).slice(0, 8);
}

/**
 * Watch configured FAANG/product career pages and update matching Company docs.
 */
async function syncCareersWatch(io, { pushNotification } = {}) {
  const Company = require('../../models/Company');
  const summary = { watched: 0, opened: 0, closed: 0, errors: [], samples: [] };
  const events = [];

  for (const def of WATCH_DEFS) {
    summary.watched += 1;
    let roles = [];
    try {
      roles = await fetchRolesForDef(def);
    } catch (err) {
      summary.errors.push({ name: def.name, error: err.message });
      continue;
    }

    const company = await Company.findOne({
      name: new RegExp(`^${def.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });
    if (!company) continue;

    const wasOpen = company.isOpen;
    const prevTop = company.openRoles?.[0]?.url;
    const isOpen = roles.length > 0;
    const top = roles[0];

    company.isOpen = isOpen;
    company.lastSyncedAt = new Date();
    company.source = company.source || 'careers-watch';
    company.openRoles = roles.map((r) => ({
      title: r.title,
      url: r.url,
      location: r.location || '',
      updatedAt: new Date()
    }));

    if (isOpen) {
      company.window = `LIVE · detected ${new Date().toLocaleDateString('en-IN')}`;
      company.notes = `Dynamic careers watch found ${roles.length} eng/intern listing(s). Mid-cycle opens are auto-detected.`;
      if (top?.url) {
        company.applyUrl = top.url;
        company.url = top.url;
        company.urlStatus = 'ok';
        company.urlCheckedAt = new Date();
      }
    } else {
      // Do not invent CLOSED from calendar — only clear live flag
      if (!/CLOSED|LIVE/i.test(company.window || '')) {
        company.window = company.window || 'No live eng/intern JD on last watch';
      } else if (/^LIVE/i.test(company.window || '')) {
        company.window = `No live eng/intern JD · last check ${new Date().toLocaleDateString('en-IN')}`;
      }
    }

    await company.save();
    summary.samples.push({
      name: def.name,
      isOpen,
      count: roles.length,
      top: top?.title || null
    });

    if (isOpen && (!wasOpen || (top && top.url !== prevTop))) {
      summary.opened += 1;
      const ev = { type: 'opening:new', company: company.toObject(), role: top };
      events.push(ev);
      if (pushNotification) {
        await pushNotification(io, {
          type: 'opening:new',
          title: `Live open: ${company.name}`,
          body: top?.title || 'Engineering / intern role detected',
          companyId: company._id,
          url: top?.url || company.applyUrl,
          meta: { source: 'careers-watch' }
        });
      }
    }
    if (!isOpen && wasOpen) {
      summary.closed += 1;
      events.push({ type: 'opening:closed', company: company.toObject() });
    }
  }

  // Also watch other High-priority manual companies with a careers URL
  const extras = await Company.find({
    boardType: 'manual',
    priority: 'High',
    category: { $in: ['FAANG', 'Product'] },
    name: { $nin: WATCH_DEFS.map((d) => new RegExp(`^${d.name}$`, 'i')) },
    $or: [{ applyUrl: { $exists: true, $ne: '' } }, { url: { $exists: true, $ne: '' } }]
  }).limit(25);

  for (const company of extras) {
    const page = company.applyUrl || company.url;
    if (!page || !/^https?:\/\//i.test(page)) continue;
    // Skip pure LinkedIn / Google search junk
    if (/linkedin\.com\/jobs\/search|google\.com\/search/i.test(page)) continue;

    summary.watched += 1;
    try {
      const { ok, text, finalUrl } = await fetchText(page);
      if (!ok) continue;
      const roles = parseGenericHtml(text, finalUrl || page).filter((r) => isEngTrack(r.title));
      const wasOpen = company.isOpen;
      const isOpen = roles.length > 0;
      company.isOpen = isOpen;
      company.lastSyncedAt = new Date();
      if (isOpen) {
        company.openRoles = roles.slice(0, 5).map((r) => ({
          title: r.title,
          url: r.url,
          location: r.location || '',
          updatedAt: new Date()
        }));
        company.window = `LIVE · detected ${new Date().toLocaleDateString('en-IN')}`;
        company.applyUrl = roles[0].url;
        company.url = roles[0].url;
      }
      await company.save();
      if (isOpen && !wasOpen) {
        summary.opened += 1;
        if (pushNotification) {
          await pushNotification(io, {
            type: 'opening:new',
            title: `Live open: ${company.name}`,
            body: roles[0].title,
            companyId: company._id,
            url: roles[0].url,
            meta: { source: 'careers-watch' }
          });
        }
      }
      if (!isOpen && wasOpen) summary.closed += 1;
    } catch (err) {
      summary.errors.push({ name: company.name, error: err.message });
    }
  }

  if (io) {
    for (const ev of events) io.emit(ev.type, ev);
    io.emit('careerswatch:complete', summary);
  }

  return summary;
}

module.exports = {
  syncCareersWatch,
  WATCH_DEFS,
  parseGoogleHtml,
  parseAmazonJson,
  parseGenericHtml,
  fetchRolesForDef
};
