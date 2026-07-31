const mongoose = require('mongoose');

const MockInterviewSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  company: { type: String },
  stage: {
    type: String,
    enum: ['OA', 'Phone', 'Onsite', 'Behavioral', 'System Design', 'Peer'],
    default: 'Peer'
  },
  type: { type: String, enum: ['Startup', 'Service', 'Product', 'FAANG'], default: 'Startup' },
  platform: { type: String },
  // Rubric 1–4 (Google-style hire signal)
  scoreCode: { type: Number, min: 1, max: 4 },
  scoreComms: { type: Number, min: 1, max: 4 },
  scoreComplexity: { type: Number, min: 1, max: 4 },
  rating: { type: Number, min: 1, max: 5 },
  weakTopics: [{ type: String }],
  notes: { type: String },
  durationMin: { type: Number }
}, { timestamps: true });

MockInterviewSchema.index({ date: -1 });

module.exports = mongoose.model('MockInterview', MockInterviewSchema);
