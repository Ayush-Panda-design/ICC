/**
 * Notice board — hiring calendar + live openings + AI/year-status brief.
 */
const fs = require('fs');
const path = require('path');
const Company = require('../../models/Company');
const NoticeBrief = require('../../models/NoticeBrief');
const { computePortfolioMatch } = require('../portfolioMatch');

function loadCalendar() {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../seed/data/hiring-calendar.json'), 'utf-8')
  );
}

function currentMonth() {
  return new Date().getUTCMonth() + 1; // 1–12
}

function formatDay(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function seasonLabel(month) {
  if (month >= 7 && month <= 9) return 'Peak internship apply window (Jul–Sep)';
  if (month >= 10 && month <= 12) return 'Late FAANG / India product + service drives (Oct–Dec)';
  if (month >= 1 && month <= 3) return 'New-grad / late intern + return offers (Jan–Mar)';
  return 'Quieter cycle — keep startups + rolling apps warm (Apr–Jun)';
}

function calendarWithStatus(calendar, month) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return calendar
    .map((row) => {
      const opensLabel = formatDay(row.opensAround);
      const closesLabel = formatDay(row.closesAround);
      let cycleStatus = row.cycleStatus || 'rolling';

      // Auto-flip upcoming → open / closed from date fields when present
      if (row.opensAround || row.closesAround) {
        const opens = row.opensAround ? new Date(row.opensAround) : null;
        const closes = row.closesAround ? new Date(row.closesAround) : null;
        if (cycleStatus !== 'closed' && closes && today > closes) cycleStatus = 'closed';
        else if (cycleStatus === 'upcoming' && opens && today >= opens && (!closes || today <= closes)) {
          cycleStatus = 'open';
        } else if (cycleStatus === 'rolling' && closes && today > closes) {
          cycleStatus = 'closed';
        }
      }

      const inSeasonMonths = (row.peakMonths || []).includes(month);
      const near = (row.peakMonths || []).some(
        (m) => Math.abs(m - month) <= 1 || Math.abs(m - month) >= 11
      );

      let status = 'Off-peak';
      let inPeak = false;
      if (cycleStatus === 'closed') {
        status = `CLOSED this cycle${closesLabel ? ` (closed ~${closesLabel})` : ''}`;
        inPeak = false;
      } else if (cycleStatus === 'upcoming') {
        status = `Upcoming${opensLabel ? ` · opens ~${opensLabel}` : ''}`;
        inPeak = false;
      } else if (cycleStatus === 'open' || (cycleStatus === 'rolling' && inSeasonMonths)) {
        status =
          cycleStatus === 'rolling'
            ? `OPEN / rolling${closesLabel ? ` · apply by ~${closesLabel}` : ''}`
            : `OPEN now${closesLabel ? ` · closes ~${closesLabel}` : ''}`;
        inPeak = true;
      } else if (inSeasonMonths) {
        status = 'HOT — typical release / apply window NOW';
        inPeak = true;
      } else if (near) {
        status = 'Warming / trailing — watch portals';
      }

      return {
        ...row,
        cycleStatus,
        opensLabel,
        closesLabel,
        status,
        inPeak
      };
    })
    .sort((a, b) => {
      if (a.inPeak !== b.inPeak) return a.inPeak ? -1 : 1;
      const closedRank = (r) => (r.cycleStatus === 'closed' ? 1 : 0);
      if (closedRank(a) !== closedRank(b)) return closedRank(a) - closedRank(b);
      return (b.priority || 0) - (a.priority || 0);
    });
}

function applyUrl(company) {
  const live = (company.openRoles || []).find((r) => r?.url);
  return live?.url || company.applyUrl || company.url || company.fallbackUrl || null;
}

function matchCalendarRow(calendar, companyName) {
  const name = (companyName || '').toLowerCase();
  return calendar.find((row) => {
    const parts = String(row.company || '')
      .toLowerCase()
      .split(/[\/,()]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.some((p) => p.length > 2 && (name.includes(p) || p.includes(name)));
  });
}

function enrichOpening(obj, calendar) {
  const cal = matchCalendarRow(calendar, obj.name);
  const liveOpen = Boolean(obj.isOpen) && (obj.openRoles?.length > 0 || /^LIVE/i.test(obj.window || ''));
  const deadline = obj.deadline || (cal?.closesAround ? new Date(cal.closesAround) : null);

  let window = obj.window;
  if (!window && cal) {
    window =
      [
        cal.opensLabel && `Typical opens ~${cal.opensLabel}`,
        cal.closesLabel && `Typical closes ~${cal.closesLabel}`,
        cal.nextWindow ? `Next typical: ${cal.nextWindow}` : null
      ]
        .filter(Boolean)
        .join(' · ') || cal.typicalWindow;
  }

  // Live careers watch wins over static calendar "closed"
  let cycleStatus = liveOpen ? 'open' : cal?.cycleStatus || (obj.isOpen ? 'open' : 'unknown');
  if (!liveOpen && !obj.isOpen && cal?.cycleStatus === 'closed') cycleStatus = 'closed';

  const effectiveOpen = liveOpen || Boolean(obj.isOpen && cycleStatus !== 'closed');

  return {
    ...obj,
    deadline,
    window,
    opensAround: cal?.opensAround || null,
    closesAround: cal?.closesAround || obj.deadline || null,
    opensLabel: cal?.opensLabel || null,
    closesLabel: cal?.closesLabel || (obj.deadline ? formatDay(obj.deadline) : null),
    cycleStatus,
    isOpen: effectiveOpen,
    liveDetected: liveOpen,
    applyCta: effectiveOpen ? 'Apply now' : cycleStatus === 'closed' ? 'Closed — view careers' : 'View careers'
  };
}

/**
 * Overlay live Company.isOpen onto calendar rows so mid-cycle opens show as OPEN.
 */
async function mergeCalendarWithLive(calendar) {
  const primaries = [
    ...new Set(
      calendar
        .map((r) => String(r.company || '').split(/[\/,]/)[0].trim())
        .filter((n) => n.length > 2)
    )
  ];

  const companies = await Company.find({
    $or: primaries.map((n) => ({
      name: new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    }))
  })
    .select('name isOpen openRoles window lastSyncedAt applyUrl')
    .lean();

  const byName = new Map(companies.map((c) => [c.name.toLowerCase(), c]));

  return calendar.map((row) => {
    const primary = String(row.company || '').split(/[\/,]/)[0].trim().toLowerCase();
    const live = byName.get(primary);
    if (!live) return row;

    const liveOpen = Boolean(live.isOpen) && (live.openRoles?.length > 0 || /^LIVE/i.test(live.window || ''));
    if (liveOpen) {
      const top = live.openRoles?.[0];
      return {
        ...row,
        cycleStatus: 'open',
        inPeak: true,
        status: `LIVE OPEN · ${top?.title || 'role detected'}`,
        liveDetected: true,
        liveUrl: top?.url || live.applyUrl || null,
        lastSyncedAt: live.lastSyncedAt || null
      };
    }

    if (live.lastSyncedAt && row.cycleStatus === 'closed') {
      return {
        ...row,
        status: `${row.status} · watch confirms no eng JD`,
        liveDetected: false,
        lastSyncedAt: live.lastSyncedAt
      };
    }
    return { ...row, liveDetected: false, lastSyncedAt: live.lastSyncedAt || null };
  });
}

async function getLiveOpenings({ limit = 40, calendar = [] } = {}) {
  const closedNames = calendar
    .filter((r) => r.cycleStatus === 'closed')
    .map((r) => String(r.company).split(/[\/,]/)[0].trim())
    .filter(Boolean);

  const companies = await Company.find({
    status: { $in: ['Not Applied', 'Applied', 'OA'] },
    $or: [
      { isOpen: true },
      { category: { $in: ['FAANG', 'Product', 'Startup'] }, matchScore: { $gte: 65 } },
      { batch: 'LiveHub' },
      ...(closedNames.length ? [{ name: { $in: closedNames } }] : [])
    ]
  })
    .sort({ isOpen: -1, matchScore: -1, deadline: 1 })
    .limit(120);

  const scored = companies
    .map((c) => {
      const obj = c.toObject();
      const score = obj.matchScore ?? computePortfolioMatch(obj);
      return enrichOpening({ ...obj, matchScore: score, applyLink: applyUrl(obj) }, calendar);
    })
    .filter((c) => c.applyLink);

  const closed = scored.filter((c) => !c.isOpen && c.cycleStatus === 'closed');
  const open = scored.filter((c) => c.isOpen);
  const watch = scored.filter((c) => !c.isOpen && c.cycleStatus !== 'closed');

  open.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  watch.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  // Always surface closed-cycle FAANG (e.g. Google) even when live list is long
  const room = Math.max(limit - closed.length, 10);
  return [...open, ...watch].slice(0, room).concat(closed);
}

function buildRulesBrief({ month, calendar, openings, season }) {
  const hot = calendar.filter((c) => c.inPeak && c.cycleStatus !== 'closed').map((c) => c.company);
  const closed = calendar.filter((c) => c.cycleStatus === 'closed').map((c) => c.company);
  const openNow = openings.filter((o) => o.isOpen).slice(0, 8);
  const headline = `Hiring pulse · ${season}`;
  const body =
    `For a 5th-sem fullstack builder (ShipFlow / Relvion / EdinForm / Votora): prioritize **startup + India product** opens this week, ` +
    `while watching FAANG intern portals in their real open/close windows (not just career search pages). ` +
    (closed.length ? `Already closed this cycle: ${closed.slice(0, 3).join('; ')}. ` : '') +
    (hot.length
      ? `In-season / open right now: ${hot.slice(0, 5).join('; ')}.`
      : 'No mega-wave flagged open this month — keep rolling apps + LiveHub sync.') +
    ` ICC listed ${openings.filter((o) => o.isOpen).length} live opens with apply links.`;

  const bullets = [
    'Status is DYNAMIC: ICC polls Greenhouse/Lever boards + Google/Amazon/Apple careers pages every few hours — mid-cycle opens flip to LIVE.',
    'Typical top ~70–100 tech intern/SDE apps cluster Jul–Oct (FAANG early; India product + service through Nov).',
    'Startups: year-round — your portfolio is the differentiator; apply continuously.',
    closed.length
      ? `Calendar hint closed (unless LIVE overrides): ${closed.join(', ')}.`
      : 'No major closed cycles flagged in calendar.',
    openNow.length
      ? `Open / live now (sample): ${openNow.map((o) => o.name).join(', ')}.`
      : 'No “Open now” flags in DB — hit Sync on Notices/Alerts, then recheck.',
    'Roles to chase: Full Stack / SWE / SDE Intern, Backend, AI-adjacent if stack matches. Read the JD — apprenticeship ≠ classic SWE intern.'
  ];

  const focusNow = [];
  if (closed.some((c) => /google/i.test(c))) {
    focusNow.push('Google 2026 intern apply window is CLOSED — prep for Jan 2027 / other FAANG');
  }
  if (month >= 7 && month <= 9) {
    focusNow.push('Microsoft rolling + startups this week (not Google if closed)');
    focusNow.push('Internshala / Wellfound / Unstop daily (ICC LiveHub)');
  } else if (month >= 10 && month <= 12) {
    focusNow.push('Amazon / Apple / India product (Flipkart, Swiggy, fintech)');
    focusNow.push('Service registrations (TCS NQT etc.) if still open');
  } else if (month >= 1 && month <= 3) {
    focusNow.push('New-grad / late intern waves + return-offer companies');
  } else {
    focusNow.push('Startups + build depth; set FAANG alerts for next open window');
  }

  return {
    headline,
    body,
    bullets,
    focusNow,
    source: 'rules',
    asOf: new Date(),
    meta: {
      month,
      openCount: openings.filter((o) => o.isOpen).length,
      listed: openings.length,
      closed: closed
    }
  };
}

async function polishBriefWithGemini(brief, context) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ...brief, source: 'rules' };

  try {
    const prompt =
      'You are a recruiting analyst for Ayush Panda, CS undergrad (5th sem, India), fullstack + AI projects, targeting tech internships/SDE. ' +
      'Given hiring calendar status and live openings summary, write a crisp Notice Board brief. ' +
      'CRITICAL: If a company cycleStatus is closed, NEVER tell the user to apply there now. ' +
      'Return JSON only: {headline, body, bullets: string[4-6], focusNow: string[2-4]}. ' +
      'Body max 3 sentences. Be specific to THIS month/year cycle. No DSA lectures. Context: ' +
      JSON.stringify(context);

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 700 }
      })
    });
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object');
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      headline: parsed.headline || brief.headline,
      body: parsed.body || brief.body,
      bullets: Array.isArray(parsed.bullets) && parsed.bullets.length ? parsed.bullets : brief.bullets,
      focusNow: Array.isArray(parsed.focusNow) && parsed.focusNow.length ? parsed.focusNow : brief.focusNow,
      source: 'gemini',
      asOf: new Date(),
      meta: brief.meta
    };
  } catch (err) {
    console.warn('[notices] Gemini brief fallback:', err.message);
    return { ...brief, source: 'rules' };
  }
}

async function getOrCreateBrief({ force = false, openings, calendar, month, season } = {}) {
  const existing = await NoticeBrief.findOne({ key: 'hiring-status' });
  const freshEnough =
    existing?.asOf && Date.now() - new Date(existing.asOf).getTime() < 20 * 60 * 60 * 1000;
  const closedKey = calendar
    .filter((c) => c.cycleStatus === 'closed')
    .map((c) => c.company)
    .sort()
    .join('|');
  const priorClosed = Array.isArray(existing?.meta?.closed)
    ? [...existing.meta.closed].sort().join('|')
    : '';
  const closedChanged = closedKey !== priorClosed;

  if (existing && freshEnough && !force && !closedChanged) {
    return {
      headline: existing.headline,
      body: existing.body,
      bullets: existing.bullets,
      focusNow: existing.focusNow,
      source: existing.source,
      asOf: existing.asOf,
      meta: existing.meta
    };
  }

  const rules = buildRulesBrief({ month, calendar, openings, season });
  const polished = await polishBriefWithGemini(rules, {
    month,
    season,
    year: new Date().getUTCFullYear(),
    calendar: calendar.map((c) => ({
      company: c.company,
      cycleStatus: c.cycleStatus,
      opensAround: c.opensAround,
      closesAround: c.closesAround,
      status: c.status,
      inPeak: c.inPeak
    })),
    openSample: openings.filter((o) => o.isOpen).slice(0, 12).map((o) => ({
      name: o.name,
      role: o.role,
      category: o.category,
      matchScore: o.matchScore,
      window: o.window,
      deadline: o.deadline
    })),
    profile: 'Fullstack/AI internships and SDE-related tech roles only'
  });

  await NoticeBrief.findOneAndUpdate(
    { key: 'hiring-status' },
    {
      key: 'hiring-status',
      headline: polished.headline,
      body: polished.body,
      bullets: polished.bullets,
      focusNow: polished.focusNow,
      source: polished.source,
      asOf: polished.asOf,
      meta: polished.meta
    },
    { upsert: true, new: true }
  );

  return polished;
}

async function getNoticeBoard({ forceBrief = false, limit = 40 } = {}) {
  const month = currentMonth();
  const season = seasonLabel(month);
  let calendar = calendarWithStatus(loadCalendar(), month);
  calendar = await mergeCalendarWithLive(calendar);
  const openings = await getLiveOpenings({ limit, calendar });
  const brief = await getOrCreateBrief({
    force: forceBrief,
    openings,
    calendar,
    month,
    season
  });

  return {
    season,
    month,
    year: new Date().getUTCFullYear(),
    brief,
    calendar,
    openings,
    hubs: [
      { name: 'Internshala', url: 'https://internshala.com/internships/software-development-internship' },
      { name: 'Wellfound', url: 'https://wellfound.com/role/r/software-engineer-intern' },
      { name: 'Unstop', url: 'https://unstop.com/internships' },
      { name: 'LinkedIn Intern', url: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20intern&location=India&f_E=1' },
      { name: 'Remotive', url: 'https://remotive.com/remote-jobs/software-dev' }
    ],
    tip: 'Open status is DYNAMIC: Greenhouse/Lever boards + careers watch (Google/Amazon/…) poll live pages. Calendar dates are typical windows only — mid-cycle opens flip to LIVE automatically on Sync.'
  };
}

module.exports = {
  getNoticeBoard,
  getLiveOpenings,
  getOrCreateBrief,
  loadCalendar,
  calendarWithStatus,
  mergeCalendarWithLive
};
