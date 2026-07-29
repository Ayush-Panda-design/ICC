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
  a2zStep: { type: Number }
}, { timestamps: true });

DSAProblemSchema.index({ topicId: 1, orderInStep: 1 });
DSAProblemSchema.index({ track: 1, status: 1 });
DSAProblemSchema.index({ targetWeek: 1 });

module.exports = mongoose.model('DSAProblem', DSAProblemSchema);
