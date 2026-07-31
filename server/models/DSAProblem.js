const mongoose = require('mongoose');

const DSAProblemSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'DSATopic' },
  name: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  status: { type: String, enum: ['Todo', 'In Progress', 'Done', 'Revisit'], default: 'Todo' },
  completedAt: { type: Date },
  revisit: { type: Boolean, default: false },
  url: { type: String },
  track: {
    type: String,
    enum: ['startup_service', 'faang', 'both'],
    default: 'startup_service'
  },
  targetWeek: { type: Number },
  targetPhase: { type: Number },
  orderInStep: { type: Number },
  sheetStep: { type: Number },
  // Pattern mastery + hardness gate (practice on LeetCode/TUF; log here)
  pattern: { type: String },
  isCore: { type: Boolean, default: false }, // Blind75 / NeetCode / OA staple
  companies: [{ type: String }],
  timeSpentMin: { type: Number },
  timeComplexity: { type: String },
  spaceComplexity: { type: String },
  explainNote: { type: String },
  approachQuality: {
    type: String,
    enum: ['optimal', 'suboptimal', 'wrong', 'unknown'],
    default: 'unknown'
  },
  confidence: { type: Number, min: 1, max: 5 },
  nextReviewAt: { type: Date },
  reviewCount: { type: Number, default: 0 },
  googleHard: { type: Boolean, default: false }
}, { timestamps: true });

DSAProblemSchema.index({ topicId: 1, orderInStep: 1 });
DSAProblemSchema.index({ track: 1, status: 1 });
DSAProblemSchema.index({ targetWeek: 1 });
DSAProblemSchema.index({ isCore: 1, status: 1 });
DSAProblemSchema.index({ pattern: 1 });
DSAProblemSchema.index({ nextReviewAt: 1 });
DSAProblemSchema.index({ googleHard: 1, status: 1 });

module.exports = mongoose.model('DSAProblem', DSAProblemSchema);
