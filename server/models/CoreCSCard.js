const mongoose = require('mongoose');

const CoreCSCardSchema = new mongoose.Schema({
  subject: { type: String, enum: ['OS', 'DBMS', 'CN', 'OOP'], required: true },
  question: { type: String, required: true },
  answerKey: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  status: { type: String, enum: ['Todo', 'Weak', 'OK', 'Strong'], default: 'Todo' },
  lastAskedAt: { type: Date },
  selfScore: { type: Number, min: 1, max: 4 },
  timesAsked: { type: Number, default: 0 },
  order: { type: Number, default: 0 }
}, { timestamps: true });

CoreCSCardSchema.index({ subject: 1, status: 1 });

module.exports = mongoose.model('CoreCSCard', CoreCSCardSchema);
