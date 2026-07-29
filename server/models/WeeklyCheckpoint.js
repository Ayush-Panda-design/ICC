const mongoose = require('mongoose');

const WeeklyCheckpointSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true, unique: true },
  date: { type: Date, required: true },
  dsaTarget: { type: Number, required: true },
  dsaActual: { type: Number, default: 0 },
  mustHaveDone: [{ type: String }],
  redFlags: [{ type: String }],
  onTrack: { type: Boolean, default: true },
  theme: { type: String },
  phase: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WeeklyCheckpoint', WeeklyCheckpointSchema);
