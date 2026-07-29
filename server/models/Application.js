const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, enum: ['Applied', 'OA', 'Interview', 'Offer', 'Rejected'], default: 'Applied' },
  oaResult: { type: String, enum: ['Pass', 'Fail', 'Pending'] },
  interviewRounds: [{ type: String }],
  notes: { type: String },
  timeline: [{
    status: { type: String },
    date: { type: Date }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
