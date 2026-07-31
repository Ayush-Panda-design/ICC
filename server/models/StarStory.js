const mongoose = require('mongoose');

const StarStorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  theme: { type: String, required: true },
  situation: { type: String, default: '' },
  task: { type: String, default: '' },
  action: { type: String, default: '' },
  result: { type: String, default: '' },
  // Company value mapping
  googleValues: [{ type: String }],
  microsoftValues: [{ type: String }],
  amazonLPs: [{ type: String }],
  projectHint: { type: String },
  status: { type: String, enum: ['Draft', 'Ready', 'Polished'], default: 'Draft' },
  lastDrilledAt: { type: Date },
  drillCount: { type: Number, default: 0 },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('StarStory', StarStorySchema);
