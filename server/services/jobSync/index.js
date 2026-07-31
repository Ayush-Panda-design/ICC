const Company = require('../../models/Company');
const {
  fetchGreenhouse,
  fetchLever,
  fetchAshby,
  fetchRemotive
} = require('./adapters');
const { checkUrl } = require('./urlHealth');
const { pushNotification, repairUrlsFromCatalog, runUrlHealthCheck } = require('./urlRepair');
const { getLiveHubDefinitions } = require('./liveHubs');
const { syncCareersWatch } = require('./careersWatch');

async function syncCompanyBoard(company) {
  let roles = [];
  try {
    if (company.boardType === 'greenhouse' && company.boardSlug) {
      roles = await fetchGreenhouse(company.boardSlug);
    } else if (company.boardType === 'lever' && company.boardSlug) {
      roles = await fetchLever(company.boardSlug);
    } else if (company.boardType === 'ashby' && company.boardSlug) {
      roles = await fetchAshby(company.boardSlug);
    }
  } catch (err) {
    return { company, error: err.message, changed: false, events: [] };
  }

  const wasOpen = company.isOpen;
  const prevUrl = company.applyUrl || company.url;
  const top = roles[0];
  const isOpen = roles.length > 0;

  // Only adopt listing URL if it health-checks OK
  let applyUrl = company.applyUrl || company.url;
  if (top?.url) {
    const health = await checkUrl(top.url);
    if (health.ok) {
      applyUrl = health.finalUrl || top.url;
      company.urlStatus = 'ok';
      company.urlCheckedAt = new Date();
    }
  }

  company.isOpen = isOpen;
  company.lastSyncedAt = new Date();
  company.openRoles = roles.map((r) => ({
    title: r.title,
    url: r.url,
    location: r.location,
    updatedAt: new Date()
  }));
  if (top?.url && applyUrl) {
    company.url = applyUrl;
    company.applyUrl = applyUrl;
  }
  await company.save();

  const events = [];
  if (isOpen && (!wasOpen || prevUrl !== applyUrl)) {
    events.push({ type: 'opening:new', company: company.toObject(), role: top });
  }
  if (!isOpen && wasOpen) {
    events.push({ type: 'opening:closed', company: company.toObject() });
  }
  return { company, roles, changed: events.length > 0, events };
}

async function syncRemotiveIntoDb(io) {
  const events = [];
  try {
    const jobs = await fetchRemotive();
    for (const job of jobs) {
      if (!job.companyName || !job.url) continue;

      const health = await checkUrl(job.url);
      if (!health.ok) continue; // skip broken remotive links

      const goodUrl = health.finalUrl || job.url;
      let company = await Company.findOne({
        name: new RegExp(`^${escapeRegex(job.companyName)}$`, 'i')
      });

      if (!company) {
        company = await Company.create({
          name: job.companyName,
          role: job.title,
          category: 'Startup',
          window: 'Live — Remotive',
          mode: job.location || 'Remote',
          platform: 'Remotive',
          matchScore: 80,
          priority: 'Medium',
          status: 'Not Applied',
          source: 'remotive',
          boardType: 'remotive',
          isOpen: true,
          lastSyncedAt: new Date(),
          url: goodUrl,
          applyUrl: goodUrl,
          urlStatus: 'ok',
          urlCheckedAt: new Date(),
          batch: 'Live',
          openRoles: [{ title: job.title, url: goodUrl, location: job.location, updatedAt: new Date() }]
        });
        events.push({ type: 'opening:new', company: company.toObject(), role: { ...job, url: goodUrl } });
        await pushNotification(io, {
          type: 'opening:new',
          title: `New on Remotive: ${company.name}`,
          body: job.title,
          companyId: company._id,
          url: goodUrl,
          meta: { platform: 'Remotive' }
        });
      } else {
        const wasOpen = company.isOpen;
        const prevUrl = company.applyUrl;
        company.isOpen = true;
        company.lastSyncedAt = new Date();
        company.url = goodUrl;
        company.applyUrl = goodUrl;
        company.urlStatus = 'ok';
        company.urlCheckedAt = new Date();
        company.role = job.title;
        company.platform = company.platform || 'Remotive';
        company.openRoles = [{ title: job.title, url: goodUrl, location: job.location, updatedAt: new Date() }];
        await company.save();
        if (!wasOpen || prevUrl !== goodUrl) {
          events.push({ type: 'opening:new', company: company.toObject(), role: { ...job, url: goodUrl } });
          await pushNotification(io, {
            type: 'opening:new',
            title: `Opening update: ${company.name}`,
            body: job.title,
            companyId: company._id,
            url: goodUrl,
            meta: { platform: 'Remotive' }
          });
        }
      }
    }
  } catch (err) {
    console.error('Remotive sync failed:', err.message);
  }
  return events;
}

/**
 * Resolve first healthy URL from primary + alternates (env override via liveHubs.js).
 */
async function pickHealthyUrl(urls) {
  let last = { ok: false, reason: 'no urls', finalUrl: urls[0] };
  for (const url of urls) {
    const health = await checkUrl(url);
    last = health;
    if (health.ok) {
      return { url: health.finalUrl || url, health, tried: urls };
    }
  }
  return { url: urls[0], health: last, tried: urls };
}

/**
 * Watch major platform hubs — upsert live board cards. URLs come from liveHubs.js
 * (env-overridable) and are re-verified on every sync so site structure changes get caught.
 */
async function syncPlatformHubs(io) {
  const hubs = getLiveHubDefinitions();
  const events = [];

  for (const hub of hubs) {
    const picked = await pickHealthyUrl(hub.urls);
    const goodUrl = picked.url;
    const healthOk = Boolean(picked.health?.ok);

    let company = await Company.findOne({ name: hub.name, batch: 'LiveHub' });
    const isNew = !company;
    if (!company) {
      company = new Company({
        name: hub.name,
        role: hub.role,
        category: hub.category,
        window: 'Always open — refresh often',
        mode: 'India / Remote',
        platform: hub.platform,
        matchScore: hub.matchScore,
        priority: hub.priority,
        status: 'Not Applied',
        source: 'platform-hub',
        boardType: 'manual',
        isOpen: healthOk,
        batch: 'LiveHub',
        url: goodUrl,
        applyUrl: goodUrl,
        fallbackUrl: hub.urls[hub.urls.length - 1],
        urlStatus: healthOk ? 'ok' : 'broken',
        urlCheckedAt: new Date(),
        urlCheckReason: picked.health?.reason
      });
    } else {
      company.isOpen = healthOk;
      company.url = goodUrl;
      company.applyUrl = goodUrl;
      company.fallbackUrl = hub.urls[hub.urls.length - 1];
      company.urlStatus = healthOk ? 'ok' : 'broken';
      company.urlCheckedAt = new Date();
      company.urlCheckReason = picked.health?.reason;
      company.lastSyncedAt = new Date();
      company.role = hub.role;
      company.matchScore = hub.matchScore;
      company.priority = hub.priority;
    }
    await company.save();

    if (isNew && healthOk) {
      events.push({ type: 'opening:new', company: company.toObject(), role: { title: hub.role, url: goodUrl } });
      await pushNotification(io, {
        type: 'opening:new',
        title: `Platform linked: ${hub.platform}`,
        body: `${hub.name} is connected (verified).`,
        companyId: company._id,
        url: goodUrl,
        meta: { platform: hub.platform, hub: true }
      });
    }
  }
  return events;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function runJobSync(io, { repair = true, healthSample = 25 } = {}) {
  const summary = {
    synced: 0,
    opened: 0,
    closed: 0,
    repaired: 0,
    health: null,
    errors: [],
    newOpenings: []
  };
  const allEvents = [];

  if (repair) {
    const r = await repairUrlsFromCatalog();
    summary.repaired = r.updated;
  }

  // Platform hubs first (Internshala / Wellfound / etc.)
  const hubEvents = await syncPlatformHubs(io);
  allEvents.push(...hubEvents);

  const boardCompanies = await Company.find({
    boardType: { $in: ['greenhouse', 'lever', 'ashby'] },
    boardSlug: { $nin: [null, ''] }
  });

  for (const company of boardCompanies) {
    const result = await syncCompanyBoard(company);
    summary.synced += 1;
    if (result.error) summary.errors.push({ name: company.name, error: result.error });
    if (result.events) {
      for (const ev of result.events) {
        allEvents.push(ev);
        if (ev.type === 'opening:new') {
          summary.opened += 1;
          summary.newOpenings.push({ name: company.name, title: ev.role?.title, url: ev.role?.url });
          await pushNotification(io, {
            type: 'opening:new',
            title: `New opening: ${company.name}`,
            body: ev.role?.title || 'Role updated',
            companyId: company._id,
            url: ev.role?.url || company.applyUrl,
            meta: { platform: company.platform, boardType: company.boardType }
          });
        }
        if (ev.type === 'opening:closed') summary.closed += 1;
      }
    }
  }

    const remotiveEvents = await syncRemotiveIntoDb(io);
  for (const ev of remotiveEvents) {
    allEvents.push(ev);
    if (ev.type === 'opening:new') {
      summary.opened += 1;
      summary.newOpenings.push({
        name: ev.company.name,
        title: ev.role?.title,
        url: ev.role?.url
      });
    }
  }

  // Dynamic FAANG / manual careers watch (Google HTML, Amazon JSON, etc.)
  try {
    const watch = await syncCareersWatch(io, { pushNotification });
    summary.careersWatch = watch;
    summary.opened += watch.opened || 0;
    summary.closed += watch.closed || 0;
    summary.synced += watch.watched || 0;
    for (const s of watch.samples || []) {
      if (s.isOpen && s.top) {
        summary.newOpenings.push({ name: s.name, title: s.top, url: null });
      }
    }
    if (watch.errors?.length) summary.errors.push(...watch.errors);
  } catch (err) {
    summary.errors.push({ name: 'careersWatch', error: err.message });
  }

  // Spot-check apply URLs so broken ones get fallbacks
  summary.health = await runUrlHealthCheck(io, { limit: healthSample });

  if (io) {
    for (const ev of allEvents) io.emit(ev.type, ev);
    io.emit('sync:complete', summary);
  }

  return summary;
}

module.exports = {
  runJobSync,
  syncCompanyBoard,
  syncPlatformHubs,
  repairUrlsFromCatalog,
  runUrlHealthCheck,
  syncCareersWatch
};
