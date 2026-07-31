const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Application = require('../models/Application');
const UserProgress = require('../models/UserProgress');
const { runJobSync, repairUrlsFromCatalog, runUrlHealthCheck } = require('../services/jobSync');
const { healthCheckCompany } = require('../services/jobSync/urlRepair');
const { computeDeadlineAlerts } = require('../cron/alerts');
const { computePortfolioMatch, buildApplyKit } = require('../services/portfolioMatch');
const { refreshCompanyMatchScores } = require('../seed/ensurePrepContent');

function getIo(req) {
  return req.app.get('io');
}

// GET /api/companies — filtered list
router.get('/', async (req, res) => {
  try {
    const {
      category,
      status,
      priority,
      platform,
      mode,
      isOpen,
      deadline,
      q,
      matchMin,
      batch,
      sort = 'deadline'
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (platform) filter.platform = new RegExp(platform, 'i');
    if (mode) filter.mode = new RegExp(mode, 'i');
    if (batch) filter.batch = batch;
    if (isOpen === 'true') filter.isOpen = true;
    if (isOpen === 'false') filter.isOpen = false;
    if (matchMin) filter.matchScore = { $gte: Number(matchMin) };
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { role: new RegExp(q, 'i') },
        { platform: new RegExp(q, 'i') }
      ];
    }

    let sortSpec = { deadline: 1, matchScore: -1 };
    if (sort === 'matchScore') sortSpec = { matchScore: -1 };
    if (sort === 'name') sortSpec = { name: 1 };
    if (sort === 'updated') sortSpec = { lastSyncedAt: -1 };

    let companies = await Company.find(filter).sort(sortSpec);

    if (deadline && deadline !== 'all') {
      const today = new Date();
      companies = companies.filter((c) => {
        const tracked = ['Applied', 'OA', 'Interview', 'Offer', 'Rejected'].includes(c.status);
        if (deadline === 'tracked') return tracked;
        if (tracked) return false;
        if (!c.deadline) return deadline === 'yellow';
        const days = Math.ceil((new Date(c.deadline) - today) / (1000 * 60 * 60 * 24));
        if (deadline === 'red') return days <= 7;
        if (deadline === 'yellow') return days > 7 && days <= 14;
        if (deadline === 'green') return days > 14;
        return true;
      });
    }

    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/companies/alerts — urgent buckets
router.get('/alerts', async (req, res) => {
  try {
    const snapshot = await computeDeadlineAlerts();
    res.json(snapshot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/companies/hubs — LiveHub cards (DB-backed, last verified on Sync)
router.get('/hubs', async (req, res) => {
  try {
    const hubs = await Company.find({ batch: 'LiveHub' }).sort({ matchScore: -1 });
    res.json(hubs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/companies/for-you — startup-first queue for Ayush portfolio fit
router.get('/for-you', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 25, 60);
    const companies = await Company.find({
      status: 'Not Applied',
      category: { $in: ['Startup', 'Product'] }
    })
      .sort({ matchScore: -1, isOpen: -1, deadline: 1 })
      .limit(limit);

    res.json({
      focus: 'Startups + product roles matching your shipped fullstack/AI portfolio',
      portfolio: 'https://ayushdev-five.vercel.app/',
      companies,
      tip: 'Lead with ShipFlow / Relvion for AI startups; Votora for realtime; EdinForm for SaaS. DSA OA only if asked — full TUF+ continues in parallel.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/companies/:id/apply-kit — pitch + links ready to paste
router.get('/:id/apply-kit', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Not found' });
    const kit = buildApplyKit(company);
    res.json({
      company: {
        _id: company._id,
        name: company.name,
        role: company.role,
        category: company.category,
        matchScore: company.matchScore ?? computePortfolioMatch(company)
      },
      kit
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/companies/refresh-matches — recompute portfolio match scores
router.post('/refresh-matches', async (req, res) => {
  try {
    const result = await refreshCompanyMatchScores();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Refresh failed' });
  }
});

// POST /api/companies/sync — live open-role sync + repair + health sample
router.post('/sync', async (req, res) => {
  try {
    const summary = await runJobSync(getIo(req), { repair: true, healthSample: 30 });
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Sync failed' });
  }
});

// POST /api/companies/repair-urls — fix known broken portals from catalog
router.post('/repair-urls', async (req, res) => {
  try {
    const result = await repairUrlsFromCatalog();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Repair failed' });
  }
});

// POST /api/companies/health-check — probe apply URLs
router.post('/health-check', async (req, res) => {
  try {
    const limit = Number(req.body?.limit) || 40;
    const summary = await runUrlHealthCheck(getIo(req), { limit });
    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Health check failed' });
  }
});

// POST /api/companies/:id/health-check
router.post('/:id/health-check', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Not found' });
    const result = await healthCheckCompany(company, getIo(req));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Health check failed' });
  }
});

// PATCH /api/companies/:id — update status/notes; create Application on Applied
router.patch('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const prev = await Company.findById(req.params.id);
    if (!prev) return res.status(404).json({ message: 'Company not found' });

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(status === 'Applied' && { appliedAt: new Date() })
      },
      { new: true }
    );

    if (status && status !== 'Not Applied') {
      let app = await Application.findOne({ companyId: company._id });
      if (!app) {
        app = await Application.create({
          companyId: company._id,
          status: status === 'Not Applied' ? 'Applied' : status,
          notes: notes || '',
          timeline: [{ status: status || 'Applied', date: new Date() }]
        });
        if (status === 'Applied' && prev.status === 'Not Applied') {
          await UserProgress.findOneAndUpdate({}, { $inc: { applicationsSent: 1 } });
        }
      } else {
        app.status = status === 'Not Applied' ? app.status : status;
        if (notes !== undefined) app.notes = notes;
        app.timeline.push({ status: status || app.status, date: new Date() });
        await app.save();
      }

      const io = getIo(req);
      if (io) io.emit('application:updated', { company, application: app });
    }

    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
