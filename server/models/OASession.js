const mongoose = require('mongoose');

const OASessionSchema = new mongoose.Schema({
  company: {
    type: String,
    enum: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Mixed'],
    required: true
  },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  durationMin: { type: Number, default: 90 },
  problemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DSAProblem' }],
  problemNames: [{ type: String }],
  solvedCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 2 },
  notes: { type: String },
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('OASession', OASessionSchema);
