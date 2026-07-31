const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const Company = require('../models/Company');
const DSATopic = require('../models/DSATopic');
const DSAProblem = require('../models/DSAProblem');
const SyllabusItem = require('../models/SyllabusItem');
const MotivationalQuote = require('../models/MotivationalQuote');
const DailyTask = require('../models/DailyTask');
const WeeklyCheckpoint = require('../models/WeeklyCheckpoint');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/interview-command-center';

const seedData = async ({ exit = true } = {}) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URI);
    }
    console.log('MongoDB Connected...');

    // Clear existing data
    await User.deleteMany();
    await UserProgress.deleteMany();
    await Company.deleteMany();
    await DSATopic.deleteMany();
    await DSAProblem.deleteMany();
    await SyllabusItem.deleteMany();
    await MotivationalQuote.deleteMany();
    await Application.deleteMany();
    await Notification.deleteMany();
    await DailyTask.deleteMany();
    await WeeklyCheckpoint.deleteMany();

    console.log('Old data cleared.');

    // 1. Seed User
    const user = await User.create({
      name: 'Ayush Panda',
      email: 'ayush@example.com',
      cgpa: 8.27,
      semester: '5th Sem CS',
      portfolioUrl: 'https://ayushdev-five.vercel.app/',
      githubUrl: 'https://github.com/Ayush-Panda-design',
      startDate: new Date('2026-07-30T00:00:00Z')
    });

    await UserProgress.create({
      userId: user._id,
      dsaCompleted: 23,
      mocksCompleted: 0,
      applicationsSent: 0,
      currentPhase: 1,
      streak: 0,
      lastActiveDate: new Date('2026-07-30T00:00:00Z')
    });
    console.log('User and Progress seeded.');

    // 2. Seed Quotes
    const quotesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'quotes.json'), 'utf-8'));
    await MotivationalQuote.insertMany(quotesData);
    console.log('Quotes seeded.');

    // 3. Seed Companies
    const companiesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'companies.json'), 'utf-8'));
    await Company.insertMany(companiesData);
    console.log(`Companies seeded (${companiesData.length}).`);

    // 3b. Daily planner + checkpoints from PDF
    require('./generate-planner');
    const dailyTasks = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'daily-tasks.json'), 'utf-8'));
    const checkpoints = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'checkpoints.json'), 'utf-8'));
    await DailyTask.insertMany(dailyTasks);
    await WeeklyCheckpoint.insertMany(checkpoints);
    console.log(`Daily tasks (${dailyTasks.length}) + checkpoints (${checkpoints.length}) seeded.`);

    // 4. Seed Syllabus
    const syllabusData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'syllabus.json'), 'utf-8'));
    await SyllabusItem.insertMany(syllabusData);
    console.log('Syllabus seeded.');

    // 5. Seed DSA Topics & Problems (TUF+ Basic to Advanced paid batch — 435)
    require('./generate-tuf-sheet');
    const topicsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'tuf-topics.json'), 'utf-8'));
    const createdTopics = {};
    for (const topicData of topicsData) {
      const t = await DSATopic.create(topicData);
      createdTopics[topicData.name] = t._id;
    }

    const problemsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'tuf-problems.json'), 'utf-8'));
    const problemsToInsert = problemsData.map((p) => ({
      topicId: createdTopics[p.topicName],
      name: p.name,
      difficulty: p.difficulty,
      status: p.status || 'Todo',
      track: p.track,
      targetWeek: p.targetWeek,
      targetPhase: p.targetPhase,
      orderInStep: p.orderInStep,
      sheetStep: p.sheetStep,
      completedAt: p.status === 'Done' ? new Date() : undefined
    }));
    await DSAProblem.insertMany(problemsToInsert);
    console.log(`DSA seeded: ${topicsData.length} TUF+ sheet steps, ${problemsToInsert.length} problems.`);

    // Pattern tags, OA gap rows (additive), design/STAR/Core CS, portfolio match scores
    const { ensurePrepContent } = require('./ensurePrepContent');
    await ensurePrepContent();

    console.log('Data Import Success');
    if (exit) process.exit(0);
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    if (exit) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedData();
}

module.exports = { seedData };
