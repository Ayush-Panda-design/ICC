const mongoose = require('mongoose');

const MockInterviewSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, enum: ['Startup', 'Service', 'FAANG'] },
  platform: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  weakTopics: [{ type: String }],
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MockInterview', MockInterviewSchema);
