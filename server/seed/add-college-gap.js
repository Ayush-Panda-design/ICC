/**
 * Upsert college-friendly LC gap problems + light Saturday/Wednesday schedule notes.
 * Does NOT wipe progress. Safe to re-run.
 *
 * node seed/add-college-gap.js
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const DSATopic = require('../models/DSATopic');
const DSAProblem = require('../models/DSAProblem');
const DailyTask = require('../models/DailyTask');

const pack = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'college-gap-pack.json'), 'utf-8')
);

function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

async function ensureTopic() {
  let topic = await DSATopic.findOne({ name: /College Gap|Interview Gap/i });
  if (topic) return topic;
  const maxOrder = await DSATopic.find().sort({ order: -1 }).limit(1);
  const order = (maxOrder[0]?.order || 24) + 1;
  topic = await DSATopic.create({
    name: 'College Gap Pack (LC missing)',
    order,
    sheetStep: order,
    month: 5,
    week: 20,
    totalProblems: pack.length
  });
  return topic;
}

async function upsertProblems(topic) {
  const existing = await DSAProblem.find();
  const byNorm = new Map(existing.map((p) => [normalizeName(p.name), p]));
  let inserted = 0;
  let updated = 0;

  for (let i = 0; i < pack.length; i += 1) {
    const item = pack[i];
    const url = `https://leetcode.com/problems/${item.slug}/`;
    const key = normalizeName(item.name);
    let doc = byNorm.get(key);
    // also match by slug url
    if (!doc) doc = existing.find((p) => p.url && p.url.includes(item.slug));

    const payload = {
      topicId: topic._id,
      name: item.name,
      difficulty: item.difficulty,
      track: 'both',
      pattern: item.pattern,
      isCore: true,
      googleHard: item.difficulty === 'Hard',
      companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
      url,
      sheetStep: topic.sheetStep,
      orderInStep: i + 1,
      targetWeek: item.scheduleWeek,
      targetPhase: item.scheduleWeek <= 4 ? 1 : item.scheduleWeek <= 9 ? 2 : item.scheduleWeek <= 14 ? 3 : 5
    };

    if (!doc) {
      await DSAProblem.create({ ...payload, status: 'Todo' });
      inserted += 1;
    } else {
      Object.assign(doc, payload);
      await doc.save();
      updated += 1;
    }
  }

  topic.totalProblems = pack.length;
  await topic.save();
  return { inserted, updated };
}

function gapLine(item) {
  const prem = item.premium ? ' [Premium — skip if no LC Premium]' : '';
  return `College gap (1 only): ${item.name} (LC ${item.lc})${prem}`;
}

async function scheduleOnPlanner() {
  const tasks = await DailyTask.find().sort({ date: 1 });
  let patched = 0;

  for (const item of pack) {
    const candidates = tasks.filter((t) => t.weekNumber === item.scheduleWeek);
    if (!candidates.length) continue;

    let day = candidates.find((t) => {
      const d = new Date(t.date);
      return DOW[d.getUTCDay()] === item.scheduleDow;
    });
    // Fallback: Saturday of that week, else last non-rest day
    if (!day) {
      day = candidates.find((t) => DOW[new Date(t.date).getUTCDay()] === 'Sat');
    }
    if (!day) {
      day = [...candidates].reverse().find((t) => !t.isRest) || candidates[candidates.length - 1];
    }
    if (!day) continue;

    const line = gapLine(item);
    const already =
      (day.dsaFocus || '').includes(item.name) ||
      (day.rawPlan || '').includes(item.name) ||
      (day.dsaFocus || '').includes(`LC ${item.lc}`);

    if (already) continue;

    // Light: append as separate focus note — do NOT inflate weekday 3-problem batches
    day.dsaFocus = day.dsaFocus
      ? `${day.dsaFocus}. ${line}`
      : line;
    day.rawPlan = day.rawPlan
      ? `${day.rawPlan}. ${line}`
      : line;
    if (item.premium) {
      day.englishTask = day.englishTask
        ? `${day.englishTask} · Premium LC optional`
        : 'Premium LC optional — skip if no access';
    }
    await day.save();
    patched += 1;
  }

  return { patched };
}

async function syncSeedJson() {
  // Append to tuf-problems for future reseeds (dedupe by name)
  const seedPath = path.join(__dirname, 'data', 'tuf-problems.json');
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  const have = new Set(seed.map((p) => normalizeName(p.name)));
  let added = 0;
  for (const item of pack) {
    if (have.has(normalizeName(item.name))) continue;
    seed.push({
      topicName: 'College Gap Pack (LC missing)',
      name: item.name,
      difficulty: item.difficulty,
      status: 'Todo',
      track: 'both',
      targetWeek: item.scheduleWeek,
      targetPhase: item.scheduleWeek <= 9 ? 2 : 4,
      orderInStep: added + 1,
      sheetStep: 25,
      url: `https://leetcode.com/problems/${item.slug}/`,
      pattern: item.pattern,
      isCore: true
    });
    added += 1;
  }
  if (added) fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2));

  // Also stamp into daily-tasks.json for seed consistency
  const tasksPath = path.join(__dirname, 'data', 'daily-tasks.json');
  if (fs.existsSync(tasksPath)) {
    const daily = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
    let filePatched = 0;
    for (const item of pack) {
      const line = gapLine(item);
      const hits = daily.filter((t) => t.weekNumber === item.scheduleWeek);
      let day = hits.find((t) => {
        const d = new Date(t.date);
        return DOW[d.getUTCDay()] === item.scheduleDow;
      }) || hits.find((t) => DOW[new Date(t.date).getUTCDay()] === 'Sat') || hits[hits.length - 1];
      if (!day) continue;
      if ((day.dsaFocus || '').includes(item.name)) continue;
      day.dsaFocus = day.dsaFocus ? `${day.dsaFocus}. ${line}` : line;
      day.rawPlan = day.rawPlan ? `${day.rawPlan}. ${line}` : line;
      filePatched += 1;
    }
    fs.writeFileSync(tasksPath, JSON.stringify(daily, null, 2));
    return { seedAdded: added, dailyFilePatched: filePatched };
  }
  return { seedAdded: added, dailyFilePatched: 0 };
}

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/interview-command-center';
  await mongoose.connect(uri);
  const topic = await ensureTopic();
  const probs = await upsertProblems(topic);
  const sched = await scheduleOnPlanner();
  const files = await syncSeedJson();
  const total = await DSAProblem.countDocuments();
  console.log(JSON.stringify({ topic: topic.name, probs, sched, files, totalProblemsNow: total }, null, 2));
  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { pack, upsertProblems, scheduleOnPlanner };
