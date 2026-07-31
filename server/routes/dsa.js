const express = require('express');
const router = express.Router();
const DSATopic = require('../models/DSATopic');
const DSAProblem = require('../models/DSAProblem');
const UserProgress = require('../models/UserProgress');
const DailyTask = require('../models/DailyTask');
const { nextReviewDate, loadJson } = require('../seed/ensurePrepContent');

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
    const guide = new Date(Date.UTC(2026, 6, 30));
    task = await DailyTask.findOne({ date: { $gte: guide, $lte: endOfDayUTC(guide) } });
  }
  return task?.weekNumber || 1;
}

function applyHardnessGate(body, problem) {
  const status = body.status;
  if (status !== 'Done') return { ok: true, forcedStatus: status };

  const timeSpentMin = Number(body.timeSpentMin ?? problem.timeSpentMin);
  const timeComplexity = String(body.timeComplexity ?? problem.timeComplexity ?? '').trim();
  const spaceComplexity = String(body.spaceComplexity ?? problem.spaceComplexity ?? '').trim();
  const approachQuality = body.approachQuality || problem.approachQuality || 'unknown';

  if (!Number.isFinite(timeSpentMin) || timeSpentMin < 1) {
    return { ok: false, message: 'Hardness gate: enter time spent (minutes) before marking Done.' };
  }
  if (!timeComplexity || !spaceComplexity) {
    return { ok: false, message: 'Hardness gate: write time & space complexity (e.g. O(n), O(1)).' };
  }

  let forcedStatus = 'Done';
  if (timeSpentMin > 45 || approachQuality === 'wrong') {
    forcedStatus = 'Revisit';
  }
  return {
    ok: true,
    forcedStatus,
    timeSpentMin,
    timeComplexity,
    spaceComplexity,
    approachQuality,
    explainNote: body.explainNote,
    confidence: body.confidence
  };
}

// GET /api/dsa?track=startup_service|faang|full|week|core|revisit|google_hard|leetcode|pattern
router.get('/', async (req, res) => {
  try {
    const track = req.query.track || 'full';
    const patternFilter = req.query.pattern || '';
    const weekNum = await currentWeekNumber();

    const topics = await DSATopic.find().sort({ order: 1 });
    let problems = await DSAProblem.find().sort({ sheetStep: 1, orderInStep: 1 });
    const allProblems = problems;
    const TOTAL = allProblems.length; // full TUF+ (+ any OA gap rows) — never invent a lower ceiling
    const isLeetCode = (p) => p.url && /leetcode\.com\/problems\//i.test(p.url);

    if (track === 'startup_service') {
      problems = problems.filter((p) => p.track === 'startup_service' || p.track === 'both');
    } else if (track === 'faang') {
      problems = problems.filter((p) =>
        p.track === 'startup_service' || p.track === 'faang' || p.track === 'both'
      );
    } else if (track === 'week') {
      problems = problems.filter((p) => p.targetWeek === weekNum);
    } else if (track === 'core') {
      // Prioritize Blind75/OA staples — still must finish full sheet separately
      problems = problems.filter((p) => p.isCore);
    } else if (track === 'revisit') {
      const now = new Date();
      problems = problems.filter(
        (p) =>
          p.status === 'Revisit' ||
          p.revisit === true ||
          (p.nextReviewAt && p.nextReviewAt <= now)
      );
    } else if (track === 'google_hard') {
      problems = problems.filter((p) => p.googleHard);
    } else if (track === 'leetcode') {
      problems = problems.filter(isLeetCode);
    } else if (track === 'pattern' && patternFilter) {
      const pf = patternFilter.toLowerCase();
      problems = problems.filter((p) => (p.pattern || '').toLowerCase().includes(pf));
    }

    const doneAll = allProblems.filter((p) => p.status === 'Done').length;
    const sepSet = allProblems.filter((p) => p.track === 'startup_service' || p.track === 'both');
    const sepDone = sepSet.filter((p) => p.status === 'Done').length;
    const coreSet = allProblems.filter((p) => p.isCore);
    const coreDone = coreSet.filter((p) => p.status === 'Done').length;
    const googleSet = allProblems.filter((p) => p.googleHard);
    const googleDone = googleSet.filter((p) => p.status === 'Done').length;
    const leetcodeSet = allProblems.filter(isLeetCode);
    const leetcodeDone = leetcodeSet.filter((p) => p.status === 'Done').length;
    const revisitDue = allProblems.filter(
      (p) => p.status === 'Revisit' || (p.nextReviewAt && p.nextReviewAt <= new Date())
    ).length;

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

    const interviewReady = sepDone >= Math.floor(sepSet.length * 0.85);
    const sheetComplete = doneAll >= TOTAL && TOTAL > 0;

    res.json({
      topics: groupedTopics,
      stats: {
        total: TOTAL,
        done: doneAll,
        percentage: TOTAL ? Math.round((doneAll / TOTAL) * 100) : 0,
        easy,
        medium,
        hard,
        sepTrack: {
          done: sepDone,
          total: sepSet.length,
          percentage: sepSet.length ? Math.round((sepDone / sepSet.length) * 100) : 0
        },
        faangTrack: {
          done: doneAll,
          total: TOTAL,
          percentage: TOTAL ? Math.round((doneAll / TOTAL) * 100) : 0
        },
        coreTrack: {
          done: coreDone,
          total: coreSet.length,
          percentage: coreSet.length ? Math.round((coreDone / coreSet.length) * 100) : 0
        },
        googleHardTrack: {
          done: googleDone,
          total: googleSet.length,
          percentage: googleSet.length ? Math.round((googleDone / googleSet.length) * 100) : 0
        },
        leetcodeTrack: {
          done: leetcodeDone,
          total: leetcodeSet.length,
          percentage: leetcodeSet.length ? Math.round((leetcodeDone / leetcodeSet.length) * 100) : 0
        },
        revisitDue,
        currentWeek: weekNum,
        weekCount: allProblems.filter((p) => p.targetWeek === weekNum).length,
        interviewReady,
        sheetComplete,
        mandate: 'Complete ALL TUF+ problems. Patterns/OA/Google-hard are rigor overlays, not shortcuts.',
        track
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dsa/patterns — mastery by pattern across full sheet
router.get('/patterns', async (req, res) => {
  try {
    const catalog = loadJson('patterns.json');
    const problems = await DSAProblem.find();
    const byPattern = {};

    for (const p of problems) {
      const key = p.pattern || 'Uncategorized';
      if (!byPattern[key]) byPattern[key] = { total: 0, done: 0, revisit: 0, problems: [] };
      byPattern[key].total += 1;
      if (p.status === 'Done') byPattern[key].done += 1;
      if (p.status === 'Revisit') byPattern[key].revisit += 1;
    }

    const patterns = catalog.map((c) => {
      // Match catalog name loosely to inferred pattern strings
      const entries = Object.entries(byPattern).filter(([name]) => {
        const n = name.toLowerCase();
        return (
          n.includes(c.name.split(' ')[0].toLowerCase()) ||
          c.keywords.some((kw) => n.includes(kw.split(' ')[0]))
        );
      });
      let total = 0;
      let done = 0;
      let revisit = 0;
      for (const [, v] of entries) {
        total += v.total;
        done += v.done;
        revisit += v.revisit;
      }
      // Fallback: scan problem names/topics via keywords if no pattern field match
      if (total === 0) {
        for (const p of problems) {
          const blob = `${p.name} ${p.pattern || ''}`.toLowerCase();
          if (c.keywords.some((kw) => blob.includes(kw.toLowerCase()))) {
            total += 1;
            if (p.status === 'Done') done += 1;
            if (p.status === 'Revisit') revisit += 1;
          }
        }
      }
      return {
        ...c,
        total,
        done,
        revisit,
        percentage: total ? Math.round((done / total) * 100) : 0,
        mastered: total > 0 && done >= Math.min(c.masteryTarget, total) && revisit === 0
      };
    });

    res.json({
      patterns,
      note: 'Master patterns while finishing 100% of TUF+. Do not stop at masteryTarget alone.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dsa/oa-pack?company=Google
router.get('/oa-pack', async (req, res) => {
  try {
    const company = req.query.company || 'Google';
    const pack = loadJson('faang-oa-pack.json').filter(
      (p) => !p.skipIfOnSheet && (p.companies || []).includes(company)
    );
    const problems = await DSAProblem.find();
    const byName = new Map(problems.map((p) => [p.name.toLowerCase(), p]));

    const items = pack
      .map((p, i) => {
        const linked = byName.get(p.name.toLowerCase());
        return {
          order: i + 1,
          ...p,
          problemId: linked?._id,
          status: linked?.status || 'Todo',
          timeSpentMin: linked?.timeSpentMin,
          onSheet: Boolean(linked)
        };
      })
      .sort((a, b) => {
        const pr = { P0: 0, P1: 1, P2: 2 };
        return (pr[a.priority] ?? 9) - (pr[b.priority] ?? 9);
      });

    res.json({
      company,
      count: items.length,
      items,
      mockHint: 'Timed OA: pick 2–3 P0/P1 mediums, 90 min on LeetCode/TUF, log session in Dojo.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/problems/:id', async (req, res) => {
  try {
    const problem = await DSAProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Not found' });
    const oldStatus = problem.status;

    const gate = applyHardnessGate(req.body, problem);
    if (!gate.ok) return res.status(400).json({ message: gate.message });

    if (req.body.status) {
      problem.status = gate.forcedStatus || req.body.status;
    }
    if (req.body.revisit !== undefined) problem.revisit = req.body.revisit;

    if (gate.timeSpentMin != null) problem.timeSpentMin = gate.timeSpentMin;
    if (gate.timeComplexity) problem.timeComplexity = gate.timeComplexity;
    if (gate.spaceComplexity) problem.spaceComplexity = gate.spaceComplexity;
    if (gate.explainNote !== undefined) problem.explainNote = gate.explainNote;
    if (gate.approachQuality) problem.approachQuality = gate.approachQuality;
    if (gate.confidence != null) problem.confidence = gate.confidence;

    // Allow updating gate fields without status change
    if (req.body.timeSpentMin != null && !req.body.status) problem.timeSpentMin = Number(req.body.timeSpentMin);
    if (req.body.timeComplexity && !req.body.status) problem.timeComplexity = req.body.timeComplexity;
    if (req.body.spaceComplexity && !req.body.status) problem.spaceComplexity = req.body.spaceComplexity;
    if (req.body.explainNote !== undefined && !req.body.status) problem.explainNote = req.body.explainNote;
    if (req.body.approachQuality && !req.body.status) problem.approachQuality = req.body.approachQuality;
    if (req.body.confidence != null && !req.body.status) problem.confidence = req.body.confidence;

    if (problem.status === 'Done' && oldStatus !== 'Done') {
      problem.completedAt = new Date();
      problem.revisit = false;
      problem.nextReviewAt = nextReviewDate(
        problem.confidence,
        problem.approachQuality,
        problem.timeSpentMin
      );
    }
    if (problem.status === 'Revisit') {
      problem.revisit = true;
      problem.nextReviewAt = nextReviewDate(1, problem.approachQuality || 'wrong', problem.timeSpentMin || 60);
      problem.reviewCount = (problem.reviewCount || 0) + 1;
      if (oldStatus === 'Done') problem.completedAt = undefined;
    }
    if (problem.status === 'Todo' || problem.status === 'In Progress') {
      if (oldStatus === 'Done') problem.completedAt = undefined;
    }

    await problem.save();

    const done = await DSAProblem.countDocuments({ status: 'Done' });
    await UserProgress.findOneAndUpdate({}, { dsaCompleted: done }, { upsert: true });

    const autoRevisit =
      gate.forcedStatus === 'Revisit' && req.body.status === 'Done'
        ? 'Auto-queued Revisit (>45 min or wrong approach). Redo on TUF/LeetCode, then log again.'
        : null;

    res.json({ problem, autoRevisit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
