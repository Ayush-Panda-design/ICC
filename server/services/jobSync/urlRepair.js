const Company = require('../../models/Company');
const Notification = require('../../models/Notification');
const { checkUrl, fallbackForCompany } = require('./urlHealth');
const URL_CATALOG = require('./urlCatalog');
const {
  internshalaCompanyUrl,
  PLATFORM_HUB_PRIMARY
} = require('./liveHubs');

function isLinkedInSearch(url) {
  return /linkedin\.com\/jobs\/search/i.test(url || '');
}

function isGenericSearch(url) {
  return isLinkedInSearch(url) || /google\.com\/search/i.test(url || '') || /wellfound\.com\/jobs\?q=/i.test(url || '');
}

async function pushNotification(io, payload) {
  const doc = await Notification.create(payload);
  if (io) io.emit('notification:new', doc.toObject());
  return doc;
}

/**
 * Check one company's apply URL; if broken, attach working fallback.
 */
async function healthCheckCompany(company, io) {
  const primary = company.applyUrl || company.url;
  const result = await checkUrl(primary);
  const prev = company.urlStatus;

  company.urlCheckedAt = new Date();
  company.urlCheckReason = result.reason;

  if (result.ok) {
    company.urlStatus = 'ok';
    if (result.finalUrl && result.finalUrl !== primary) {
      company.applyUrl = result.finalUrl;
      company.url = result.finalUrl;
    }
    await company.save();
    if (prev === 'broken' && io) {
      await pushNotification(io, {
        type: 'url:fixed',
        title: `Link fixed: ${company.name}`,
        body: 'Apply URL is working again.',
        companyId: company._id,
        url: company.applyUrl || company.url
      });
    }
    return { company, ok: true, result };
  }

  // Prefer catalog career page, else platform hub
  const catalogUrl = URL_CATALOG[company.name];
  let fallback = catalogUrl || company.fallbackUrl || fallbackForCompany(company);

  // Verify fallback too
  const fb = await checkUrl(fallback);
  if (fb.ok) {
    company.fallbackUrl = fb.finalUrl || fallback;
    company.urlStatus = 'fallback';
    // Swap primary to working fallback so Apply Now opens something useful
    company.applyUrl = company.fallbackUrl;
    company.url = company.fallbackUrl;
  } else {
    company.fallbackUrl = fallbackForCompany(company);
    company.applyUrl = company.fallbackUrl;
    company.url = company.fallbackUrl;
    company.urlStatus = 'broken';
  }

  await company.save();

  if (prev !== 'broken' && prev !== 'fallback') {
    await pushNotification(io, {
      type: 'url:broken',
      title: `Broken link fixed with fallback: ${company.name}`,
      body: `${result.reason}. Opened fallback hub instead.`,
      companyId: company._id,
      url: company.applyUrl,
      meta: { original: primary, reason: result.reason }
    });
  }

  return { company, ok: false, result, fallback: company.fallbackUrl };
}

/**
 * Batch health-check Not Applied / high priority first.
 */
async function runUrlHealthCheck(io, { limit = 40 } = {}) {
  const companies = await Company.find({
    status: { $in: ['Not Applied', 'Applied'] }
  })
    .sort({ priority: 1, deadline: 1, updatedAt: -1 })
    .limit(limit);

  const summary = { checked: 0, ok: 0, fixed: 0, broken: 0 };
  for (const company of companies) {
    const r = await healthCheckCompany(company, io);
    summary.checked += 1;
    if (r.ok) summary.ok += 1;
    else if (company.urlStatus === 'fallback') summary.fixed += 1;
    else summary.broken += 1;
  }

  if (io) io.emit('urlhealth:complete', summary);
  return summary;
}

/**
 * Apply known good catalog URLs to all matching companies (one-shot repair).
 */
async function repairUrlsFromCatalog() {
  let updated = 0;
  for (const [name, url] of Object.entries(URL_CATALOG)) {
    if (name === 'PLATFORM_FALLBACKS') continue;
    const res = await Company.updateMany(
      { name },
      {
        $set: {
          applyUrl: url,
          url,
          urlStatus: 'unknown',
          fallbackUrl: fallbackForCompany({ name, platform: 'Careers' })
        }
      }
    );
    updated += res.modifiedCount || 0;
  }

  // Internshala-tagged: real Internshala keyword board (not LinkedIn search)
  const intern = await Company.find({ platform: /Internshala/i, batch: { $ne: 'LiveHub' } });
  for (const c of intern) {
    if (URL_CATALOG[c.name]) continue;
    // Prefer existing real open role URL
    const liveRole = (c.openRoles || []).find((r) => r.url && !isGenericSearch(r.url));
    if (liveRole) {
      c.applyUrl = liveRole.url;
      c.url = liveRole.url;
      c.fallbackUrl = PLATFORM_HUB_PRIMARY.Internshala;
      c.urlStatus = 'ok';
    } else if (!c.applyUrl || isGenericSearch(c.applyUrl)) {
      c.applyUrl = internshalaCompanyUrl(c.name);
      c.url = c.applyUrl;
      c.fallbackUrl = PLATFORM_HUB_PRIMARY.Internshala;
      c.urlStatus = 'fallback';
    }
    await c.save();
    updated += 1;
  }

  // Wellfound: catalog or stable role hub — never LinkedIn search as primary
  const wf = await Company.find({
    batch: { $ne: 'LiveHub' },
    $or: [
      { platform: /Wellfound/i },
      { applyUrl: /wellfound\.com\/jobs\?q=/i },
      { url: /wellfound\.com\/jobs\?q=/i }
    ]
  });
  for (const c of wf) {
    if (URL_CATALOG[c.name]) {
      c.applyUrl = URL_CATALOG[c.name];
      c.url = URL_CATALOG[c.name];
      c.urlStatus = 'unknown';
    } else {
      const liveRole = (c.openRoles || []).find((r) => r.url && !isGenericSearch(r.url));
      if (liveRole) {
        c.applyUrl = liveRole.url;
        c.url = liveRole.url;
        c.urlStatus = 'ok';
      } else {
        c.applyUrl = PLATFORM_HUB_PRIMARY.Wellfound;
        c.url = PLATFORM_HUB_PRIMARY.Wellfound;
        c.urlStatus = 'fallback';
      }
      c.fallbackUrl = PLATFORM_HUB_PRIMARY.Wellfound;
    }
    await c.save();
    updated += 1;
  }

  // Replace LinkedIn / Google search primaries with catalog or platform hub
  const searches = await Company.find({
    batch: { $ne: 'LiveHub' },
    $or: [
      { applyUrl: /linkedin\.com\/jobs\/search/i },
      { url: /linkedin\.com\/jobs\/search/i },
      { applyUrl: /google\.com\/search/i },
      { url: /google\.com\/search/i }
    ]
  });
  for (const c of searches) {
    const liveRole = (c.openRoles || []).find((r) => r.url && !isGenericSearch(r.url));
    if (liveRole) {
      c.applyUrl = liveRole.url;
      c.url = liveRole.url;
      c.urlStatus = 'ok';
    } else if (URL_CATALOG[c.name]) {
      c.applyUrl = URL_CATALOG[c.name];
      c.url = URL_CATALOG[c.name];
      c.urlStatus = 'unknown';
    } else if (/Internshala/i.test(c.platform)) {
      c.applyUrl = internshalaCompanyUrl(c.name);
      c.url = c.applyUrl;
      c.fallbackUrl = PLATFORM_HUB_PRIMARY.Internshala;
      c.urlStatus = 'fallback';
    } else {
      const fb = fallbackForCompany(c);
      c.applyUrl = fb;
      c.url = fb;
      c.fallbackUrl = fb;
      c.urlStatus = 'fallback';
    }
    await c.save();
    updated += 1;
  }

  return { updated };
}

module.exports = {
  healthCheckCompany,
  runUrlHealthCheck,
  repairUrlsFromCatalog,
  pushNotification
};
