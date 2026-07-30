const express = require('express');
const router = express.Router();
const DailyTask = require('../models/DailyTask');
const Company = require('../models/Company');
require('../models/User');
const UserProgress = require('../models/UserProgress');
const MotivationalQuote = require('../models/MotivationalQuote');
const WeeklyCheckpoint = require('../models/WeeklyCheckpoint');
const Application = require('../models/Application');
const DSAProblem = require('../models/DSAProblem');

const TASK_KEYS = ['dsa', 'coreCS', 'techRevision', 'application', 'english'];

function startOfDayUTC(d = new Date()) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function endOfDayUTC(d = new Date()) {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

async function getTodayTask() {
  // Prefer real calendar today; fall back to guide start (Jul 30 2026) for this project timeline
  const now = startOfDayUTC();
  let task = await DailyTask.findOne({ date: { $gte: now, $lte: endOfDayUTC(now) } });
  if (!task) {
    const guide = new Date(Date.UTC(2026, 6, 30));
    task = await DailyTask.findOne({ date: { $gte: guide, $lte: endOfDayUTC(guide) } });
  }
  if (!task) {
    task = await DailyTask.findOne().sort({ date: 1 });
  }
  return task;
}

router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    const userProgress = await UserProgress.findOne().populate('userId');

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const urgentCompanies = await Company.find({
      deadline: { $lte: sevenDaysFromNow },
      status: { $ne: 'Applied' }
    }).sort({ deadline: 1 });

    const task = await getTodayTask();
    const dsaDone = await DSAProblem.countDocuments({ status: 'Done' });
    const appsCount = await Application.countDocuments();
    const weekNum = task?.weekNumber || 1;
    const checkpoint = await WeeklyCheckpoint.findOne({ weekNumber: weekNum });

    let onTrackStatus = 'GREEN';
    if (checkpoint && dsaDone < checkpoint.dsaTarget - 20) onTrackStatus = 'YELLOW';
    if (checkpoint && dsaDone < checkpoint.dsaTarget - 40) onTrackStatus = 'RED';
    if (urgentCompanies.length > 0) {
      const daysToDeadline = Math.ceil((urgentCompanies[0].deadline - today) / 86400000);
      if (daysToDeadline <= 2) onTrackStatus = 'RED';
      else if (daysToDeadline <= 3 && onTrackStatus === 'GREEN') onTrackStatus = 'YELLOW';
    }

    const quotes = await MotivationalQuote.aggregate([{ $sample: { size: 1 } }]);
    const quote = quotes.length > 0 ? quotes[0] : { text: 'Keep pushing forward.', author: 'Ayush' };

    // Week completion rate
    const weekTasks = await DailyTask.find({ weekNumber: weekNum });
    const weekDone = weekTasks.filter((t) => (t.completed || []).length >= 3).length;

    res.json({
      userProgress: {
        ...(userProgress?.toObject?.() || userProgress || {}),
        dsaCompleted: dsaDone,
        applicationsSent: userProgress?.applicationsSent || appsCount
      },
      task,
      urgentCompanies,
      onTrackStatus,
      quote,
      performance: {
        weekNumber: weekNum,
        phase: task?.phase,
        theme: task?.theme,
        dsaCompleted: dsaDone,
        dsaTarget: checkpoint?.dsaTarget || 480,
        applicationsSent: appsCount,
        mocksCompleted: userProgress?.mocksCompleted || 0,
        weekTasksTotal: weekTasks.length,
        weekTasksDone: weekDone,
        mustHaveDone: checkpoint?.mustHaveDone || [],
        redFlags: checkpoint?.redFlags || [],
        checkpointDate: checkpoint?.date
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/today/complete', async (req, res) => {
  try {
    const { taskKey } = req.body;
    if (!TASK_KEYS.includes(taskKey)) {
      return res.status(400).json({ message: `Invalid taskKey. Use: ${TASK_KEYS.join(', ')}` });
    }

    const task = await getTodayTask();
    if (!task) return res.status(404).json({ message: 'No daily plan found — run seed' });

    const set = new Set(task.completed || []);
    if (set.has(taskKey)) set.delete(taskKey);
    else set.add(taskKey);
    task.completed = [...set];
    await task.save();

    const core = ['dsa', 'coreCS', 'techRevision', 'application'];
    if (core.every((k) => task.completed.includes(k))) {
      const progress = await UserProgress.findOne();
      if (progress) {
        const last = progress.lastActiveDate ? startOfDayUTC(progress.lastActiveDate).getTime() : 0;
        const today = startOfDayUTC().getTime();
        const yesterday = today - 86400000;
        if (last !== today) {
          progress.streak = last === yesterday ? (progress.streak || 0) + 1 : 1;
          progress.lastActiveDate = new Date();
          await progress.save();
        }
      }
    }

    const userProgress = await UserProgress.findOne().populate('userId');
    res.json({ task, userProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/today/complete-all', async (req, res) => {
  try {
    const task = await getTodayTask();
    if (!task) return res.status(404).json({ message: 'No daily plan found' });
    task.completed = [...TASK_KEYS];
    await task.save();

    const progress = await UserProgress.findOne();
    if (progress) {
      const last = progress.lastActiveDate ? startOfDayUTC(progress.lastActiveDate).getTime() : 0;
      const today = startOfDayUTC().getTime();
      const yesterday = today - 86400000;
      if (last !== today) {
        progress.streak = last === yesterday ? (progress.streak || 0) + 1 : 1;
        progress.lastActiveDate = new Date();
        await progress.save();
      }
    }

    res.json({ task, userProgress: await UserProgress.findOne().populate('userId') });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
