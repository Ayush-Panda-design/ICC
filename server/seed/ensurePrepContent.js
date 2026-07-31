/**
 * Enrich existing TUF+ problems + seed prep decks without wiping progress.
 * Rule: FULL TUF+ sheet is mandatory — patterns/OA/Google-hard are overlays.
 */
const fs = require('fs');
const path = require('path');
const DSAProblem = require('../models/DSAProblem');
const DSATopic = require('../models/DSATopic');
const DesignDrill = require('../models/DesignDrill');
const StarStory = require('../models/StarStory');
const CoreCSCard = require('../models/CoreCSCard');
const Company = require('../models/Company');
const { computePortfolioMatch } = require('../services/portfolioMatch');

const dataDir = path.join(__dirname, 'data');

function loadJson(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf-8'));
}

function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function inferPattern(problemName, topicName, patterns) {
  const blob = `${problemName} ${topicName}`.toLowerCase();
  let best = null;
  let bestHits = 0;
  for (const p of patterns) {
    let hits = 0;
    for (const kw of p.keywords || []) {
      if (blob.includes(kw.toLowerCase())) hits += 1;
    }
    if (hits > bestHits) {
      bestHits = hits;
      best = p.name;
    }
  }
  return best;
}

function isGoogleHard(problem, topicName) {
  const blob = `${problem.name} ${topicName} ${problem.difficulty}`.toLowerCase();
  const hardSignal =
    problem.difficulty === 'Hard' ||
    /graph|dijkstra|bellman|topo|union|trie|dp|dynamic|backtrack|segment tree|fenwick/.test(blob);
  const googleTopics = /graph|tree|dp|dynamic|trie|hard/.test((topicName || '').toLowerCase());
  return Boolean(hardSignal && (googleTopics || problem.difficulty === 'Hard'));
}

function nextReviewDate(confidence, approachQuality, timeSpentMin) {
  const now = Date.now();
  let days = 7;
  if (approachQuality === 'wrong' || (timeSpentMin && timeSpentMin > 45)) days = 1;
  else if (approachQuality === 'suboptimal' || (confidence && confidence <= 2)) days = 2;
  else if (confidence && confidence <= 3) days = 4;
  else if (confidence && confidence >= 5) days = 14;
  return new Date(now + days * 86400000);
}

async function enrichDsaMetadata() {
  const patterns = loadJson('patterns.json');
  const oaPack = loadJson('faang-oa-pack.json');
  const oaByName = new Map();
  for (const item of oaPack) {
    oaByName.set(normalizeName(item.name), item);
  }

  const topics = await DSATopic.find();
  const topicNameById = Object.fromEntries(topics.map((t) => [t._id.toString(), t.name]));

  const problems = await DSAProblem.find();
  let updated = 0;

  for (const p of problems) {
    const topicName = topicNameById[p.topicId?.toString()] || '';
    const oa = oaByName.get(normalizeName(p.name));
    const pattern = oa?.pattern || inferPattern(p.name, topicName, patterns) || p.pattern;
    const companies = oa?.companies || p.companies || [];
    const isCore = Boolean(oa) || p.isCore || (oa?.priority === 'P0');
    const googleHard = isGoogleHard(p, topicName);

    const needs =
      p.pattern !== pattern ||
      p.isCore !== isCore ||
      p.googleHard !== googleHard ||
      JSON.stringify(p.companies || []) !== JSON.stringify(companies);

    if (needs) {
      p.pattern = pattern;
      p.isCore = isCore;
      p.googleHard = googleHard;
      p.companies = companies;
      // Ensure OA-pack titles missing from sheet stay findable via name match only —
      // we never delete TUF+ rows; we only tag.
      await p.save();
      updated += 1;
    }
  }

  // Insert OA gap problems that are not on the TUF+ sheet (additive only)
  const existingNames = new Set(problems.map((p) => normalizeName(p.name)));
  let faangTopic = topics.find((t) => /faang|oa gap|blind/i.test(t.name));
  if (!faangTopic) {
    const maxOrder = topics.reduce((m, t) => Math.max(m, t.order || 0), 0);
    faangTopic = await DSATopic.create({
      name: 'FAANG OA Gap Pack',
      order: maxOrder + 1,
      sheetStep: maxOrder + 1,
      month: 5,
      week: 20,
      totalProblems: 0
    });
  }

  let inserted = 0;
  for (const item of oaPack) {
    if (item.skipIfOnSheet) continue;
    const key = normalizeName(item.name);
    if (existingNames.has(key)) continue;
    await DSAProblem.create({
      topicId: faangTopic._id,
      name: item.name,
      difficulty: item.difficulty || 'Medium',
      status: 'Todo',
      track: 'faang',
      pattern: item.pattern,
      companies: item.companies || [],
      isCore: item.priority === 'P0' || item.priority === 'P1',
      googleHard: /graph|dp|trie|hard/i.test(`${item.pattern} ${item.difficulty}`),
      sheetStep: faangTopic.sheetStep,
      orderInStep: inserted + 1,
      targetPhase: 5
    });
    inserted += 1;
    existingNames.add(key);
  }

  return { updated, inserted, total: await DSAProblem.countDocuments() };
}

async function seedPrepDecksIfEmpty() {
  const summary = {};

  if ((await DesignDrill.countDocuments()) === 0) {
    const rows = loadJson('design-drills.json');
    await DesignDrill.insertMany(rows);
    summary.design = rows.length;
  }

  if ((await StarStory.countDocuments()) === 0) {
    const rows = loadJson('star-stories.json');
    await StarStory.insertMany(rows);
    summary.star = rows.length;
  }

  if ((await CoreCSCard.countDocuments()) === 0) {
    const rows = loadJson('core-cs-deck.json');
    await CoreCSCard.insertMany(rows);
    summary.coreCs = rows.length;
  }

  return summary;
}

async function refreshCompanyMatchScores() {
  const companies = await Company.find();
  let n = 0;
  for (const c of companies) {
    const score = computePortfolioMatch(c);
    if (c.matchScore !== score) {
      c.matchScore = score;
      // Startup + high match → High priority for Ayush's near-term goal
      if (c.category === 'Startup' && score >= 70) c.priority = 'High';
      await c.save();
      n += 1;
    }
  }
  return { updated: n, total: companies.length };
}

async function ensurePrepContent() {
  const enrich = await enrichDsaMetadata();
  const decks = await seedPrepDecksIfEmpty();
  const matches = await refreshCompanyMatchScores();
  let leetcode = null;
  try {
    const { linkProblemsInDb } = require('./link-leetcode');
    leetcode = await linkProblemsInDb();
  } catch (err) {
    console.error('[prep] leetcode link failed:', err.message || err);
  }
  let collegeGap = null;
  try {
    const { upsertProblems, scheduleOnPlanner } = require('./add-college-gap');
    const DSATopic = require('../models/DSATopic');
    let topic = await DSATopic.findOne({ name: /College Gap/i });
    if (!topic) {
      const maxOrder = await DSATopic.find().sort({ order: -1 }).limit(1);
      const order = (maxOrder[0]?.order || 24) + 1;
      topic = await DSATopic.create({
        name: 'College Gap Pack (LC missing)',
        order,
        sheetStep: order,
        month: 5,
        week: 20,
        totalProblems: 18
      });
    }
    const probs = await upsertProblems(topic);
    const sched = await scheduleOnPlanner();
    collegeGap = { probs, sched };
  } catch (err) {
    console.error('[prep] college gap failed:', err.message || err);
  }
  console.log('[prep] DSA enrich', enrich, 'decks', decks, 'matches', matches, 'leetcode', leetcode, 'collegeGap', collegeGap);
  return { enrich, decks, matches, leetcode, collegeGap };
}

module.exports = {
  ensurePrepContent,
  enrichDsaMetadata,
  seedPrepDecksIfEmpty,
  refreshCompanyMatchScores,
  nextReviewDate,
  loadJson
};
