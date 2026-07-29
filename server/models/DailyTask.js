const mongoose = require('mongoose');

const DailyTaskSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  weekNumber: { type: Number },
  phase: { type: String },
  theme: { type: String },
  dayLabel: { type: String },
  dsaProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DSAProblem' }],
  dsaFocus: { type: String },
  coreCS: { type: String },
  techRevision: { type: String },
  applicationTask: { type: String },
  englishTask: { type: String },
  isRest: { type: Boolean, default: false },
  rawPlan: { type: String },
  completed: [{ type: String }],
  streakDay: { type: Number, default: 0 }
}, { timestamps: true });

DailyTaskSchema.index({ weekNumber: 1 });
DailyTaskSchema.index({ date: 1 });

module.exports = mongoose.model('DailyTask', DailyTaskSchema);
