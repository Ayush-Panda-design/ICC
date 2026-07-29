const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dsaCompleted: { type: Number, default: 0 },
  mocksCompleted: { type: Number, default: 0 },
  applicationsSent: { type: Number, default: 0 },
  currentPhase: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('UserProgress', UserProgressSchema);
