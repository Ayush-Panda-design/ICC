const express = require('express');
const router = express.Router();
const { getNoticeBoard } = require('../services/notices');
const { runJobSync } = require('../services/jobSync');

function getIo(req) {
  return req.app.get('io');
}

// GET /api/notices — calendar + live openings + AI/year status brief
router.get('/', async (req, res) => {
  try {
    const forceBrief = req.query.refresh === '1' || req.query.refresh === 'true';
    const board = await getNoticeBoard({ forceBrief, limit: Number(req.query.limit) || 40 });
    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// POST /api/notices/refresh — sync jobs then rebuild brief
router.post('/refresh', async (req, res) => {
  try {
    let sync = null;
    try {
      sync = await runJobSync(getIo(req), { repair: true, healthSample: 20 });
    } catch (e) {
      sync = { error: e.message };
    }
    const board = await getNoticeBoard({ forceBrief: true, limit: 40 });
    res.json({ sync, board });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Refresh failed' });
  }
});

module.exports = router;
