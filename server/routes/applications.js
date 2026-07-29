const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Company = require('../models/Company');
const UserProgress = require('../models/UserProgress');

const STATUSES = ['Applied', 'OA', 'Interview', 'Offer', 'Rejected'];

router.get('/', async (req, res) => {
  try {
    const { status, category, q } = req.query;
    const apps = await Application.find()
      .populate('companyId')
      .sort({ updatedAt: -1 });

    let filtered = apps.filter((a) => a.companyId);
    if (status) filtered = filtered.filter((a) => a.status === status);
    if (category) filtered = filtered.filter((a) => a.companyId.category === category);
    if (q) {
      const re = new RegExp(q, 'i');
      filtered = filtered.filter(
        (a) => re.test(a.companyId.name) || re.test(a.companyId.role || '')
      );
    }

    const kanban = {
      Applied: [],
      OA: [],
      Interview: [],
      Offer: [],
      Rejected: []
    };
    for (const a of filtered) {
      const key = STATUSES.includes(a.status) ? a.status : 'Applied';
      kanban[key].push(a);
    }

    res.json({
      applications: filtered,
      kanban,
      stats: {
        total: filtered.length,
        applied: kanban.Applied.length,
        oa: kanban.OA.length,
        interview: kanban.Interview.length,
        offer: kanban.Offer.length,
        rejected: kanban.Rejected.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { companyId, status = 'Applied', notes, oaResult } = req.body;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    let app = await Application.findOne({ companyId });
    const isNew = !app;
    if (!app) {
      app = await Application.create({
        companyId,
        status,
        notes: notes || '',
        oaResult,
        timeline: [{ status, date: new Date() }]
      });
      await UserProgress.findOneAndUpdate({}, { $inc: { applicationsSent: 1 } });
    } else {
      app.status = status;
      if (notes !== undefined) app.notes = notes;
      if (oaResult !== undefined) app.oaResult = oaResult;
      app.timeline.push({ status, date: new Date() });
      await app.save();
    }

    company.status = status;
    if (status === 'Applied' && !company.appliedAt) company.appliedAt = new Date();
    await company.save();

    const populated = await Application.findById(app._id).populate('companyId');
    const io = req.app.get('io');
    if (io) io.emit('application:updated', { company, application: populated, isNew });

    res.status(isNew ? 201 : 200).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { status, notes, oaResult, interviewRounds } = req.body;
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    if (status) {
      app.status = status;
      app.timeline.push({ status, date: new Date() });
    }
    if (notes !== undefined) app.notes = notes;
    if (oaResult !== undefined) app.oaResult = oaResult;
    if (interviewRounds !== undefined) app.interviewRounds = interviewRounds;
    await app.save();

    const company = await Company.findByIdAndUpdate(
      app.companyId,
      { status: status || undefined },
      { new: true }
    );

    const populated = await Application.findById(app._id).populate('companyId');
    const io = req.app.get('io');
    if (io) io.emit('application:updated', { company, application: populated });

    res.json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
