const express = require('express');
const router = express.Router();
const DSATopic = require('../models/DSATopic');
const DSAProblem = require('../models/DSAProblem');
const UserProgress = require('../models/UserProgress');
const DailyTask = require('../models/DailyTask');

const TOTAL = 474;

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

async function currentWeekNumber() {
  const now = startOfDayUTC();
  let task = await DailyTask.findOne({ date: { $gte: now, $lte: endOfDayUTC(now) } });
  if (!task) {
    const guide = new Date(Date.UTC(2026, 6, 29));
    task = await DailyTask.findOne({ date: { $gte: guide, $lte: endOfDayUTC(guide) } });
  }
  return task?.weekNumber || 1;
}

// GET /api/dsa?track=startup_service|faang|full|week
router.get('/', async (req, res) => {
  try {
    const track = req.query.track || 'full';
    const weekNum = await currentWeekNumber();

    const topics = await DSATopic.find().sort({ order: 1 });
    let problems = await DSAProblem.find().sort({ a2zStep: 1, orderInStep: 1 });

    if (track === 'startup_service') {
      problems = problems.filter((p) => p.track === 'startup_service' || p.track === 'both');
    } else if (track === 'faang') {
      // FAANG path = Sep set + Graphs/DP/Tries/advanced (all sheet, progressive readiness)
      problems = problems.filter((p) =>
        p.track === 'startup_service' || p.track === 'faang' || p.track === 'both'
      );
    } else if (track === 'week') {
      problems = problems.filter((p) => p.targetWeek === weekNum);
    }

    const allProblems = await DSAProblem.find();
    const doneAll = allProblems.filter((p) => p.status === 'Done').length;
    const sepSet = allProblems.filter((p) => p.track === 'startup_service' || p.track === 'both');
    const sepDone = sepSet.filter((p) => p.status === 'Done').length;
    const faangSet = allProblems; // full path to FAANG = all
    const faangDone = doneAll;

    const easy = { done: 0, total: 0 };
    const medium = { done: 0, total: 0 };
    const hard = { done: 0, total: 0 };
    for (const p of allProblems) {
      const bucket = p.difficulty === 'Easy' ? easy : p.difficulty === 'Hard' ? hard : medium;
      bucket.total += 1;
      if (p.status === 'Done') bucket.done += 1;
    }

    const groupedTopics = topics
      .map((topic) => {
        const topicProblems = problems
          .filter((p) => p.topicId.toString() === topic._id.toString())
          .sort((a, b) => (a.orderInStep || 0) - (b.orderInStep || 0));
        if (topicProblems.length === 0) return null;
        const completed = topicProblems.filter((p) => p.status === 'Done').length;
        return {
          ...topic.toObject(),
          problems: topicProblems,
          progress: {
            completed,
            total: topicProblems.length,
            percentage: topicProblems.length
              ? Math.round((completed / topicProblems.length) * 100)
              : 0
          }
        };
      })
      .filter(Boolean);

    const interviewReady = sepDone >= 230 || sepDone >= Math.floor(sepSet.length * 0.85);

    res.json({
      topics: groupedTopics,
      stats: {
        total: TOTAL,
        done: doneAll,
        percentage: Math.round((doneAll / TOTAL) * 100),
        easy,
        medium,
        hard,
        sepTrack: { done: sepDone, total: sepSet.length, percentage: Math.round((sepDone / sepSet.length) * 100) },
        faangTrack: { done: faangDone, total: faangSet.length, percentage: Math.round((faangDone / faangSet.length) * 100) },
        currentWeek: weekNum,
        weekCount: allProblems.filter((p) => p.targetWeek === weekNum).length,
        interviewReady,
        track
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/problems/:id', async (req, res) => {
  try {
    const { status, revisit } = req.body;
    const problem = await DSAProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Not found' });
    const oldStatus = problem.status;

    problem.status = status || problem.status;
    if (revisit !== undefined) problem.revisit = revisit;
    if (status === 'Done' && oldStatus !== 'Done') problem.completedAt = new Date();
    if (status && status !== 'Done') problem.completedAt = undefined;

    await problem.save();

    if (status === 'Done' && oldStatus !== 'Done') {
      await UserProgress.findOneAndUpdate({}, { $inc: { dsaCompleted: 1 } });
    } else if (oldStatus === 'Done' && status && status !== 'Done') {
      await UserProgress.findOneAndUpdate({}, { $inc: { dsaCompleted: -1 } });
    }

    const done = await DSAProblem.countDocuments({ status: 'Done' });
    await UserProgress.findOneAndUpdate({}, { dsaCompleted: done });

    res.json(problem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
