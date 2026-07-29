/**
 * Reseed DSA topics/problems only (preserves companies, apps).
 * Also refreshes planner checkpoints scaled to 474.
 * Usage: npm run seed:dsa
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const DSATopic = require('../models/DSATopic');
const DSAProblem = require('../models/DSAProblem');
const UserProgress = require('../models/UserProgress');
const DailyTask = require('../models/DailyTask');
const WeeklyCheckpoint = require('../models/WeeklyCheckpoint');

require('./generate-a2z');
require('./generate-planner');

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/interview-command-center');
  await DSATopic.deleteMany();
  await DSAProblem.deleteMany();

  const topicsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'a2z-topics.json'), 'utf-8'));
  const problemsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'a2z-problems.json'), 'utf-8'));

  const created = {};
  for (const t of topicsData) {
    const doc = await DSATopic.create(t);
    created[t.name] = doc._id;
  }

  const docs = problemsData.map((p) => ({
    topicId: created[p.topicName],
    name: p.name,
    difficulty: p.difficulty,
    status: p.status || 'Todo',
    track: p.track,
    targetWeek: p.targetWeek,
    targetPhase: p.targetPhase,
    orderInStep: p.orderInStep,
    a2zStep: p.a2zStep,
    completedAt: p.status === 'Done' ? new Date() : undefined
  }));
  await DSAProblem.insertMany(docs);

  const done = await DSAProblem.countDocuments({ status: 'Done' });
  await UserProgress.findOneAndUpdate({}, { dsaCompleted: done });

  // Refresh planner targets to 474 scale (preserve completion flags where possible by full replace of planner only)
  await DailyTask.deleteMany();
  await WeeklyCheckpoint.deleteMany();
  const dailyTasks = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'daily-tasks.json'), 'utf-8'));
  const checkpoints = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'checkpoints.json'), 'utf-8'));
  await DailyTask.insertMany(dailyTasks);
  await WeeklyCheckpoint.insertMany(checkpoints);

  const sep = await DSAProblem.countDocuments({ track: { $in: ['startup_service', 'both'] } });
  const faang = await DSAProblem.countDocuments({ track: 'faang' });
  const placeholders = await DSAProblem.countDocuments({ name: /Problem \d+$/ });

  console.log(`DSA reseeded: ${topicsData.length} steps, ${docs.length} problems, ${done} Done`);
  console.log(`Tracks: Sep=${sep}, FAANG-only=${faang}, placeholders=${placeholders}`);
  console.log(`Planner refreshed: ${dailyTasks.length} days, ${checkpoints.length} checkpoints`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
