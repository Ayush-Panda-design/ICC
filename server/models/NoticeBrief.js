const mongoose = require('mongoose');

const NoticeBriefSchema = new mongoose.Schema({
  key: { type: String, default: 'hiring-status', unique: true },
  headline: { type: String },
  body: { type: String },
  bullets: [{ type: String }],
  focusNow: [{ type: String }],
  source: { type: String, enum: ['rules', 'gemini'], default: 'rules' },
  asOf: { type: Date, default: Date.now },
  meta: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('NoticeBrief', NoticeBriefSchema);
