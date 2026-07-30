const express = require('express');
const router = express.Router();
const DailyTask = require('../models/DailyTask');
const UserProgress = require('../models/UserProgress');

const TASK_KEYS = ['dsa', 'coreCS', 'techRevision', 'application', 'english'];

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

function parseDateParam(s) {
  if (!s) return startOfDay();
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return startOfDay(d);
}

router.get('/', async (req, res) => {
  try {
    const { week, from, to } = req.query;
    const filter = {};
    if (week) filter.weekNumber = Number(week);
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = parseDateParam(from);
      if (to) filter.date.$lte = endOfDay(new Date(to));
    }
    const tasks = await DailyTask.find(filter).sort({ date: 1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/today', async (req, res) => {
  try {
    // Planner start date context: prefer Jul 30 2026 if "today" has no plan in other years
    let day = parseDateParam(req.query.date) || startOfDay();
    let task = await DailyTask.findOne({ date: { $gte: day, $lte: endOfDay(day) } });
    if (!task) {
      // Fallback to guide start day for demo (Jul 30 2026)
      const guideDay = new Date(Date.UTC(2026, 6, 30));
      task = await DailyTask.findOne({ date: { $gte: guideDay, $lte: endOfDay(guideDay) } });
      day = guideDay;
    }
    res.json({ date: day, task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:date', async (req, res) => {
  try {
    const day = parseDateParam(req.params.date);
    if (!day) return res.status(400).json({ message: 'Invalid date' });
    const task = await DailyTask.findOne({ date: { $gte: day, $lte: endOfDay(day) } });
    if (!task) return res.status(404).json({ message: 'No plan for this date' });
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:date/complete', async (req, res) => {
  try {
    const day = parseDateParam(req.params.date);
    const { taskKey } = req.body;
    if (!TASK_KEYS.includes(taskKey)) {
      return res.status(400).json({ message: `Invalid taskKey` });
    }
    const task = await DailyTask.findOne({ date: { $gte: day, $lte: endOfDay(day) } });
    if (!task) return res.status(404).json({ message: 'No plan for this date' });

    const set = new Set(task.completed || []);
    if (set.has(taskKey)) set.delete(taskKey);
    else set.add(taskKey);
    task.completed = [...set];
    await task.save();

    const core = ['dsa', 'coreCS', 'techRevision', 'application'];
    if (core.every((k) => task.completed.includes(k))) {
      const progress = await UserProgress.findOne();
      if (progress) {
        const last = progress.lastActiveDate ? startOfDay(progress.lastActiveDate).getTime() : 0;
        const today = startOfDay().getTime();
        const yesterday = today - 86400000;
        if (last !== today) {
          progress.streak = last === yesterday ? (progress.streak || 0) + 1 : 1;
          progress.lastActiveDate = new Date();
          await progress.save();
        }
      }
    }

    res.json({ task, userProgress: await UserProgress.findOne().populate('userId') });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
