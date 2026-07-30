const express = require('express');
const router = express.Router();
const { getCoachToday } = require('../services/coach');

// GET /api/coach/today — guider messages + accountability stats
router.get('/today', async (req, res) => {
  try {
    const persist = req.query.persist !== 'false';
    const payload = await getCoachToday({ persist });
    res.json(payload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
