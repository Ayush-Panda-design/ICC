const express = require('express');
const router = express.Router();
const MockInterview = require('../models/MockInterview');
const OASession = require('../models/OASession');
const DesignDrill = require('../models/DesignDrill');
const StarStory = require('../models/StarStory');
const CoreCSCard = require('../models/CoreCSCard');
const UserProgress = require('../models/UserProgress');
const DailyTask = require('../models/DailyTask');
const { loadJson } = require('../seed/ensurePrepContent');

function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = x.getUTCDay();
  const diff = (day + 6) % 7; // Monday start
  x.setUTCDate(x.getUTCDate() - diff);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

async function currentPhaseNum() {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  const task = await DailyTask.findOne({
    date: { $gte: now, $lte: new Date(now.getTime() + 86400000 - 1) }
  });
  const raw = task?.phase || 'M1';
  const m = String(raw).match(/(\d+)/);
  return m ? Number(m[1]) : 1;
}

// ——— Overview ———
router.get('/overview', async (req, res) => {
  try {
    const phase = await currentPhaseNum();
    const weekStart = startOfWeek();
    const mocksThisWeek = await MockInterview.countDocuments({ date: { $gte: weekStart } });
    const mockTarget = phase >= 5 ? 2 : phase >= 4 ? 1 : 0;
    const mocks = await MockInterview.find().sort({ date: -1 }).limit(10);
    const designDone = await DesignDrill.countDocuments({ status: 'Done' });
    const designTotal = await DesignDrill.countDocuments();
    const starReady = await StarStory.countDocuments({ status: { $in: ['Ready', 'Polished'] } });
    const starTotal = await StarStory.countDocuments();
    const coreStrong = await CoreCSCard.countDocuments({ status: 'Strong' });
    const coreTotal = await CoreCSCard.countDocuments();

    res.json({
      phase,
      mocksThisWeek,
      mockTarget,
      mockPressure: mockTarget > 0 && mocksThisWeek < mockTarget,
      recentMocks: mocks,
      design: { done: designDone, total: designTotal },
      star: { ready: starReady, total: starTotal },
      coreCs: { strong: coreStrong, total: coreTotal },
      mandate: 'Full TUF+ sheet + dojo (mocks, design, STAR, Core CS). Practice code on TUF/LeetCode.'
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ——— Mocks ———
router.get('/mocks', async (req, res) => {
  try {
    const mocks = await MockInterview.find().sort({ date: -1 });
    res.json(mocks);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/mocks', async (req, res) => {
  try {
    const {
      date, company, stage, type, platform,
      scoreCode, scoreComms, scoreComplexity,
      weakTopics, notes, durationMin
    } = req.body;
    if (scoreCode == null || scoreComms == null || scoreComplexity == null) {
      return res.status(400).json({ message: 'Score code, comms, and complexity (1–4 each).' });
    }
    const avg = (Number(scoreCode) + Number(scoreComms) + Number(scoreComplexity)) / 3;
    const mock = await MockInterview.create({
      date: date ? new Date(date) : new Date(),
      company,
      stage: stage || 'Peer',
      type: type || 'Startup',
      platform,
      scoreCode,
      scoreComms,
      scoreComplexity,
      rating: Math.round(avg),
      weakTopics: weakTopics || [],
      notes,
      durationMin
    });
    await UserProgress.findOneAndUpdate({}, { $inc: { mocksCompleted: 1 } }, { upsert: true });
    res.status(201).json(mock);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message || 'Server error' });
  }
});

router.delete('/mocks/:id', async (req, res) => {
  try {
    await MockInterview.findByIdAndDelete(req.params.id);
    const count = await MockInterview.countDocuments();
    await UserProgress.findOneAndUpdate({}, { mocksCompleted: count });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ——— OA sessions (timer log; solve on LeetCode/TUF) ———
router.get('/oa-sessions', async (req, res) => {
  try {
    const sessions = await OASession.find().sort({ startedAt: -1 }).limit(20);
    res.json(sessions);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/oa-sessions', async (req, res) => {
  try {
    const { company, problemNames, durationMin } = req.body;
    const session = await OASession.create({
      company: company || 'Mixed',
      startedAt: new Date(),
      durationMin: durationMin || 90,
      problemNames: problemNames || [],
      totalCount: (problemNames || []).length || 2,
      status: 'active'
    });
    res.status(201).json(session);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/oa-sessions/:id', async (req, res) => {
  try {
    const session = await OASession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Not found' });
    const { solvedCount, notes, status, problemNames } = req.body;
    if (solvedCount != null) session.solvedCount = solvedCount;
    if (notes != null) session.notes = notes;
    if (problemNames) {
      session.problemNames = problemNames;
      session.totalCount = problemNames.length;
    }
    if (status) {
      session.status = status;
      if (status === 'completed' || status === 'abandoned') session.endedAt = new Date();
    }
    await session.save();
    res.json(session);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ——— Design drills ———
router.get('/design', async (req, res) => {
  try {
    const kind = req.query.kind;
    const filter = kind ? { kind } : {};
    const drills = await DesignDrill.find(filter).sort({ order: 1 });
    res.json(drills);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/design/:id', async (req, res) => {
  try {
    const drill = await DesignDrill.findById(req.params.id);
    if (!drill) return res.status(404).json({ message: 'Not found' });
    const { status, selfScore, notes } = req.body;
    if (status) drill.status = status;
    if (selfScore != null) drill.selfScore = selfScore;
    if (notes != null) drill.notes = notes;
    if (status === 'Done' || status === 'Revisit') drill.lastPracticedAt = new Date();
    await drill.save();
    res.json(drill);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ——— STAR ———
router.get('/star', async (req, res) => {
  try {
    const stories = await StarStory.find().sort({ order: 1 });
    res.json(stories);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/star/random', async (req, res) => {
  try {
    const count = await StarStory.countDocuments();
    if (!count) return res.status(404).json({ message: 'No stories' });
    const skip = Math.floor(Math.random() * count);
    const story = await StarStory.findOne().skip(skip);
    res.json(story);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/star/:id', async (req, res) => {
  try {
    const story = await StarStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Not found' });
    const fields = ['title', 'theme', 'situation', 'task', 'action', 'result', 'status', 'projectHint'];
    for (const f of fields) {
      if (req.body[f] !== undefined) story[f] = req.body[f];
    }
    if (req.body.drilled) {
      story.lastDrilledAt = new Date();
      story.drillCount = (story.drillCount || 0) + 1;
    }
    await story.save();
    res.json(story);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ——— Core CS oral ———
router.get('/core-cs', async (req, res) => {
  try {
    const subject = req.query.subject;
    const filter = subject ? { subject } : {};
    const cards = await CoreCSCard.find(filter).sort({ order: 1 });
    res.json(cards);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/core-cs/quiz', async (req, res) => {
  try {
    const subject = req.query.subject;
    const filter = subject ? { subject } : {};
    // Prefer Weak/Todo
    let pool = await CoreCSCard.find({
      ...filter,
      status: { $in: ['Todo', 'Weak', 'OK'] }
    });
    if (!pool.length) pool = await CoreCSCard.find(filter);
    if (!pool.length) return res.status(404).json({ message: 'No cards' });
    const card = pool[Math.floor(Math.random() * pool.length)];
    res.json({
      _id: card._id,
      subject: card.subject,
      question: card.question,
      difficulty: card.difficulty,
      // answer hidden until scored — client can fetch full or we include for self-score
      answerKey: card.answerKey
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/core-cs/:id', async (req, res) => {
  try {
    const card = await CoreCSCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Not found' });
    const { selfScore, status } = req.body;
    if (selfScore != null) {
      card.selfScore = selfScore;
      card.lastAskedAt = new Date();
      card.timesAsked = (card.timesAsked || 0) + 1;
      if (selfScore <= 2) card.status = 'Weak';
      else if (selfScore === 3) card.status = 'OK';
      else card.status = 'Strong';
    }
    if (status) card.status = status;
    await card.save();
    res.json(card);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Weekly Google-hard checklist (practice on TUF; log in DSA tracker)
router.get('/google-hard-day', async (req, res) => {
  try {
    res.json({
      title: 'Weekly Google Hard Day',
      rule: 'Volume from easy/medium does not count today. Only graphs, hard DP, tries, tricky edges.',
      doOn: 'TUF+ / LeetCode — mark Done in ICC with hardness gate.',
      track: 'google_hard',
      checklist: [
        'Pick 3–5 googleHard problems from DSA Tracker filter',
        'Timed: 45 min max each; if over → auto Revisit',
        'Say complexity aloud before coding',
        'Write 2-min explain note after',
        'No credit unless difficulty target met (Hard or tagged googleHard)'
      ]
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/patterns-catalog', async (req, res) => {
  try {
    res.json(loadJson('patterns.json'));
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
