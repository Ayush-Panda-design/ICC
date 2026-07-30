const express = require('express');
const router = express.Router();
const WeeklyCheckpoint = require('../models/WeeklyCheckpoint');
const UserProgress = require('../models/UserProgress');
const DailyTask = require('../models/DailyTask');
const Application = require('../models/Application');
const DSAProblem = require('../models/DSAProblem');

router.get('/', async (req, res) => {
  try {
    const progress = await UserProgress.findOne();
    const checkpoints = await WeeklyCheckpoint.find().sort({ weekNumber: 1 });
    const dsaDone = await DSAProblem.countDocuments({ status: 'Done' });
    const apps = await Application.countDocuments();

    // Auto-fill dsaActual from live progress
    const enriched = checkpoints.map((cp) => {
      const obj = cp.toObject();
      obj.dsaActual = dsaDone;
      obj.appsActual = apps;
      obj.onTrack = dsaDone >= Math.max(0, cp.dsaTarget - 15); // 15 problem grace
      return obj;
    });

    // Current week by date
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayTask = await DailyTask.findOne({
      date: { $gte: today, $lte: new Date(today.getTime() + 86400000 - 1) }
    }) || await DailyTask.findOne({ date: new Date(Date.UTC(2026, 6, 30)) });

    const currentWeek = todayTask?.weekNumber || 1;
    const current = enriched.find((c) => c.weekNumber === currentWeek) || enriched[0];

    res.json({
      checkpoints: enriched,
      current,
      stats: {
        dsaCompleted: dsaDone,
        dsaTotal: 480,
        applicationsSent: progress?.applicationsSent || apps,
        mocksCompleted: progress?.mocksCompleted || 0,
        streak: progress?.streak || 0,
        currentPhase: progress?.currentPhase || 1,
        currentWeek,
        theme: todayTask?.theme,
        phase: todayTask?.phase
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:weekNumber', async (req, res) => {
  try {
    const { onTrack, notes, dsaActual } = req.body;
    const cp = await WeeklyCheckpoint.findOneAndUpdate(
      { weekNumber: Number(req.params.weekNumber) },
      {
        ...(onTrack !== undefined && { onTrack }),
        ...(notes !== undefined && { notes }),
        ...(dsaActual !== undefined && { dsaActual })
      },
      { new: true }
    );
    if (!cp) return res.status(404).json({ message: 'Checkpoint not found' });
    res.json(cp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
